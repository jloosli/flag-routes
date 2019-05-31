import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {ClientResponse, GeocodingResponse, GeocodingResponseStatus, GeocodingResult} from '@google/maps';

admin.initializeApp();
import DocumentSnapshot = admin.firestore.DocumentSnapshot;
import DataSnapshot = admin.database.DataSnapshot;

const googleMapsClient = require('@google/maps').createClient({
  key: functions.config().maps.key,
  Promise: Promise,
});

const fs = admin.firestore();

const city_state = 'Ogden Utah, 84401';

const setHouseCoordinates = functions.firestore.document('/houses/{houseId}')
  .onWrite((change: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
    const {street: beforeStreet} = change.before.data() as { street: string };
    const {street: afterStreet} = change.before.data() as { street: string };
    if (beforeStreet === afterStreet || !afterStreet) {
      return;
    }
    console.log('setHouseCoordinates', context.params.houseId, afterStreet);
    return getLatLng(afterStreet)
      .then(({lat, lng}) => {
        console.log(`${afterStreet}: (${lat}, ${lng})`);
        return change.after.ref.set({lat, lng}, {merge: true});
      });
  });

const centerRoute = functions.firestore.document('routes/{routeId}/deliveries/{deliveryID}')
  .onWrite(async (change: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!after) {
      return;
    }
    if (!before || after.lat !== before.lat || after.lng !== before.lng) {
      const deliveriesSnap = await fs.collection('routes').doc(context.params.routeID).collection('deliveries').get();
      const current = {lat: {max: null, min: null}, lng: {max: null, min: null}};
      deliveriesSnap.forEach(deliverySnap => {
        const {lat, lng} = deliverySnap.data();
        // @ts-ignore TS doesn't like initial values of max and min to be null, but JS handles it OK
        current.lat = {max: Math.max(current.lat.max, lat), min: Math.min(current.lat.min, lat)};
        // @ts-ignore
        current.lng = {max: Math.max(current.lng.max, lng), min: Math.min(current.lng.min, lng)};
      });
      return fs.collection('routes').doc(context.params.routeId)
        .update({
          lat: ((current.lat.max || 0) + (current.lat.min || 0)) / 2,
          lng: ((current.lng.max || 0) + (current.lng.min || 0)) / 2,
        });
    }
    return;
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
    .then()
    .then((response: ClientResponse<GeocodingResponse<GeocodingResponseStatus>>) => response.json.results)
    .then(([result]: [GeocodingResult]) => {
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      };
    })
    .catch((err: any) => console.error(`Missing Address: ${street}`));
}

function getFormattedAddress(address: string): string {
  // return encodeURIComponent(`${address} ${city_state}`);
  return `${address} ${city_state}`;
}

export {setHouseCoordinatesDB, centerRouteDB, setHouseCoordinates, centerRoute};
