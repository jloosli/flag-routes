import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ClientResponse, GeocodingResponse, GeocodingResponseStatus, GeocodingResult} from '@google/maps';

admin.initializeApp();
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
import DataSnapshot = admin.database.DataSnapshot;
import FieldValue = admin.firestore.FieldValue;
import Change = functions.Change;
import EventContext = functions.EventContext;
import DocumentReference = admin.firestore.DocumentReference;
import QueryDocumentSnapshot = admin.firestore.QueryDocumentSnapshot;

const googleMapsClient = require('@google/maps').createClient({
  key: functions.config().maps.key,
  Promise: Promise,
});

const fs = admin.firestore();

const city_state = 'Ogden Utah, 84401';

const setHouseCoordinates = functions.firestore.document('/houses/{houseId}')
  .onWrite((change: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
    const {street: beforeStreet = undefined} = change.before.data() as { street: string } || {};
    const {street: afterStreet = undefined} = change.after.data() as { street: string } || {};
    if (!afterStreet || beforeStreet === afterStreet) {
      return 0;
    }
    const {houseId} = context.params;
    console.log('setHouseCoordinates', houseId, afterStreet);
    return getLatLng(afterStreet)
      .then(({lat, lng}) => {
        console.log(`${afterStreet}: (${lat}, ${lng})`);
        return change.after.ref.set({lat, lng}, {merge: true});
      });
  });

const deliveryDocumentReference = functions.firestore.document('routes/{routeId}/deliveries/{deliveryId}');
const centerRoute = deliveryDocumentReference
  .onWrite(async (change: Change<DocumentSnapshot>, context: EventContext) => {
    if (!change.after.exists) {
      return;
    }
    const {routeId} = context.params;
    const before = change.before.data();
    const after = change.after.data() || {};
    if (!before || after.lat !== before.lat || after.lng !== before.lng) {
      const housesSnap = await fs.collection('houses')
        .where('route_ref', '==', fs.collection('routes').doc(routeId))
        .get();
      const all: { lat: number[], lng: number[] } = {lat: [], lng: []};
      housesSnap.forEach(deliverySnap => {
        const {lat, lng} = deliverySnap.data();
        if (lat && lng) {
          all.lat.push(lat);
          all.lng.push(lng);
        }
      });
      if (all.lat.length > 0) {
        const ref = fs.collection('routes').doc(routeId);
        console.log('All:', all);
        return ref
          .update({
            lat: (Math.max(...all.lat) + Math.min(...all.lat)) / 2,
            lng: (Math.max(...all.lng) + Math.min(...all.lng)) / 2,
          });
      }


    }
    return;
  });

const addDeliveryToRoute = deliveryDocumentReference
  .onCreate(async (deliverySnap: DocumentSnapshot, context: functions.EventContext) => {
    const {deliveryId, routeId} = context.params;
    const {name, order} = deliverySnap.data() as any;
    const houseReference = fs.collection('houses').doc(deliveryId);
    const routeRef = fs.collection('routes').doc(routeId);
    const routeSnap = await routeRef.get();
    const {name: routeName = '', house_count = 0} = routeSnap.data() || {};


    const updateHouseCount = routeRef.update({
      house_count: FieldValue.increment(1),
    });
    const updateHouseReference = houseReference.set({
      route: {name: routeName, id: routeId},
      route_ref: routeRef,
    }, {merge: true});

    const promises = [
      updateHouseCount,
      updateHouseReference,
    ];
    if (!order) {
      const updateDeliveryOrder = deliverySnap.ref.set({
        order: house_count,
      }, {merge: true});
      promises.push(updateDeliveryOrder);
    }
    console.log(name, order);
    return Promise.all(promises);
  });

const reorderDeliveries = async (routeRef: DocumentReference, startingOrder: number) => {
  let order = startingOrder;
  console.log('Reorder from ', order);
  const deliveriesSnap = await routeRef.collection('deliveries')
    .orderBy('order').where('order', '>=', order).get();
  const deliveryUpdates: Promise<any>[] = [];
  deliveriesSnap.forEach((deliverySnap: QueryDocumentSnapshot) => {
    deliveryUpdates.push(deliverySnap.ref.set({order: order++}, {merge: true}));
  });
  return Promise.all(deliveryUpdates);
};


const removeDeliveryFromRoute = deliveryDocumentReference
  .onDelete((deliverySnap: DocumentSnapshot, context: functions.EventContext) => {
    const {deliveryId, routeId} = context.params;
    const houseReference = fs.collection('houses').doc(deliveryId);
    const routeRef = fs.collection('routes').doc(routeId);
    const {order = null} = deliverySnap.data() || {};

    return routeRef.update({
      house_count: FieldValue.increment(-1),
    }).then(() => houseReference.update({
      route: FieldValue.delete(),
      route_ref: FieldValue.delete(),
    })).then(() => reorderDeliveries(routeRef as unknown as DocumentReference, order));

  });

const centerRouteDB = functions.database.ref('/routes/{routeId}/houses/{houseID}')
  .onWrite((change: functions.Change<DataSnapshot>, context: functions.EventContext) => {
    if (!change.after.exists()) {
      return;
    }
    const house_key = change.after.val();
    console.log('centerRouteDB (house)', house_key);
    // @ts-ignore thinks that change.after could be null
    return change.after.ref.parent.once('value')
      .then(routeHousesRef => {
        const house_ids = routeHousesRef.val() || [];
        return admin.database().ref('/houses').once('value')
          .then((snapshot) => {
            const lat = {max: null, min: null}, lng = {max: null, min: null};
            snapshot.forEach(houseSnap => {
              if (house_ids.indexOf(houseSnap.key) > -1) {
                if (houseSnap.val().lat) {
                  // @ts-ignore worried about one of the values is Math.* is null...that's ok
                  lat['max'] = lat['max'] ? Math.max(lat['max'], houseSnap.val().lat) : houseSnap.val().lat;
                  // @ts-ignore worried about one of the values is Math.* is null...that's ok
                  lat['min'] = lat['min'] ? Math.min(lat['min'], houseSnap.val().lat) : houseSnap.val().lat;
                }
                if (houseSnap.val().lng) {
                  // @ts-ignore worried about one of the values is Math.* is null...that's ok
                  lng['max'] = lng['max'] ? Math.max(lng['max'], houseSnap.val().lng) : houseSnap.val().lng;
                  // @ts-ignore worried about one of the values is Math.* is null...that's ok
                  lng['min'] = lng['min'] ? Math.min(lng['min'], houseSnap.val().lng) : houseSnap.val().lng;
                }
              }
            });

            return [lat, lng];
          });
      })
      .then(([lat, lng]) => {
        // @ts-ignore
        const center_lat = lat.max ? (lat.max + lat.min) / 2 : 0;
        // @ts-ignore
        const center_lng = lng.max ? (lng.max + lng.min) / 2 : 0;
        return Promise.all([
          // @ts-ignore
          change.after.ref.parent.parent.child('lat').set(center_lat),
          // @ts-ignore
          change.after.ref.parent.parent.child('lng').set(center_lng)]);
      });
  });

const setHouseCoordinatesDB = functions.database.ref('/houses/{houseId}/street')
  .onWrite((change: functions.Change<DataSnapshot>, context: functions.EventContext) => {
    if (!change.after.exists()) {
      return;
    }
    const prev = change.before.val();
    const street = change.after.val();
    if (prev === street || !street) {
      return;
    }
    console.log('setHouseCoordinates', context.params.houseId, street);
    return getLatLng(street)
      .then(({lat, lng}) => {
        console.log('resolved: ', {lat, lng});
        return Promise.all([
          // @ts-ignore TS doesn't know that after ref cannot be null at this point
          change.after.ref.parent.child('lat').set(lat),
          // @ts-ignore
          change.after.ref.parent.child('lng').set(lng),
        ]);

      });
  });


async function getLatLng(street: string) {
  const formatted = getFormattedAddress(street);
  return googleMapsClient.geocode({address: formatted})
    .asPromise()
    .then((response: ClientResponse<GeocodingResponse<GeocodingResponseStatus>>) => {
      console.log('getlatLng results', response);
      return response.json.results;
    })
    .then(([result]: [GeocodingResult]) => {
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      };
    })
    .catch((err: any) => {
      console.error(err);
      console.error(`Missing Address: ${formatted}`);
    });
}

function getFormattedAddress(address: string): string {
  return `${address} ${city_state}`;
}

export {
  setHouseCoordinatesDB,
  centerRouteDB,
  setHouseCoordinates,
  centerRoute,
  addDeliveryToRoute,
  removeDeliveryFromRoute,
};
