var functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.centerRoute = functions.database.ref('/routes/{routeId}/houses')
  .onWrite(event => {
    const original = event.data.val();
    console.log('centerRoute', event.params.routeId, original);
    // event.data.ref.parent.
  });
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
