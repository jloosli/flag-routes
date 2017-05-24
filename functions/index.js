const functions = require('firebase-functions');
const admin = require('firebase-admin');
const request = require('request-promise');

admin.initializeApp(functions.config().firebase);

const geocode_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
const city_state = 'Ogden Utah, 84401';

exports.centerRoute = functions.database.ref('/routes/{routeId}/houses/{houseID}')
  .onWrite(event => {
    const house_key = event.data.val();
    console.log('centerRoute (house)', house_key);
    return event.data.ref.parent.once('value')
      .then(routeHousesRef => {
        const house_ids = routeHousesRef.val() || [];
        return admin.database().ref('/houses').once('value')
          .then((snapshot) => {
            let lat = {max: null, min: null}, lng = {max: null, min: null};
            snapshot.forEach(houseSnap => {
              if (house_ids.indexOf(houseSnap.key) > -1) {
                if (houseSnap.val().lat) {
                  lat['max'] = lat['max'] ? Math.max(lat['max'], houseSnap.val().lat) : houseSnap.val().lat;
                  lat['min'] = lat['min'] ? Math.min(lat['min'], houseSnap.val().lat) : houseSnap.val().lat;
                }
                if (houseSnap.val().lng) {
                  lng['max'] = lng['max'] ? Math.max(lng['max'], houseSnap.val().lng) : houseSnap.val().lng;
                  lng['min'] = lng['min'] ? Math.min(lng['min'], houseSnap.val().lng) : houseSnap.val().lng;
                }
              }
            });

            return [lat, lng];
          });
      })
      .then(coords => {
        const center_lat = coords[0].max ? (coords[0].max + coords[0].min) / 2 : 0;
        const center_lng = coords[1].max ? (coords[1].max + coords[1].min) / 2 : 0;
        console.log(center_lat, center_lng);
        return Promise.all([
          event.data.ref.parent.parent.child('lat').set(center_lat),
          event.data.ref.parent.parent.child('lng').set(center_lng)]);
      });
  });

exports.setHouseCoordinates = functions.database.ref('/houses/{houseId}/street')
  .onWrite(event => {
    const street = event.data.val();
    console.log('setHouseCoordinates', event.params.houseId, street);
    return getLatLng(street)
      .then(lat_lng => {
        console.log('resolved: ', lat_lng);
        return Promise.all([event.data.ref.parent.child('lat').set(lat_lng.lat),
          event.data.ref.parent.child('lng').set(lat_lng.lng)]);

      });
  });


function getLatLng(street) {
  const formatted = getFormattedAddress(street);
  const key = functions.config().maps.key;
  let url = `${geocode_url}${formatted}&key=${key}`;
  console.log('Request URL: ', url);
  if (url) {
    return request(url, {resolveWithFullResponse: true})
      .then(res => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.body).results;
          if (data && data[0] && data[0].geometry && data[0].geometry.location) {
            return {
              lat: data[0].geometry.location.lat,
              lng: data[0].geometry.location.lng
            };
          }
        }
        throw res.body;
      });
  }
  throw `Missing Address: ${street}`;
}

function getFormattedAddress(address) {
  return encodeURIComponent(`${address} ${city_state}`);
}
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
