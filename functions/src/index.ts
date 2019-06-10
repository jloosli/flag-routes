import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ClientResponse, GeocodingResponse, GeocodingResponseStatus, GeocodingResult} from '@google/maps';

admin.initializeApp();
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
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
      return;
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
    console.log(before, after);
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
    console.log(`${deliveryId}/${routeId}: ${name} (${order})`);
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
    if (!Number.isInteger(order)) {
      const updateDeliveryOrder = deliverySnap.ref.set({
        order: house_count,
      }, {merge: true});
      promises.push(updateDeliveryOrder);
    }
    return Promise.all(promises);
  });

const reorderDeliveries = async (routeRef: DocumentReference) => {
  let order = 0;
  console.log('Reorder from ', order);
  const deliveriesSnap = await routeRef.collection('deliveries')
    .orderBy('order').get();
  const deliveryUpdates: Promise<any>[] = [];
  deliveriesSnap.forEach((deliverySnap: QueryDocumentSnapshot) => {
    const {order: currentOrder} = deliverySnap.data();
    const diff = order - currentOrder;
    deliveryUpdates.push(deliverySnap.ref.update({order: FieldValue.increment(diff)}));
    order++;
  });
  return Promise.all(deliveryUpdates);
};


const removeDeliveryFromRoute = deliveryDocumentReference
  .onDelete((deliverySnap: DocumentSnapshot, context: functions.EventContext) => {
    const {deliveryId, routeId} = context.params;
    const houseReference = fs.collection('houses').doc(deliveryId);
    const routeRef = fs.collection('routes').doc(routeId);

    return routeRef.update({
      house_count: FieldValue.increment(-1),
    }).then(() => houseReference.update({
      route: FieldValue.delete(),
      route_ref: FieldValue.delete(),
    })).then(() => reorderDeliveries(routeRef as unknown as DocumentReference));

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
  setHouseCoordinates,
  centerRoute,
  addDeliveryToRoute,
  removeDeliveryFromRoute,
};
