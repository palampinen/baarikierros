angular.module('config', [])

.constant('CONFIG', {
  firebaseUrl: 'YOUR_FIREBASE_URL_HERE', // for example: https://awesome-firebase-app.firebaseio.com/events/coolevent
  startPointLat: 61.8638258,  // starting latitude
  startPointLon: 25.1852399, // starting longitude
  maxDistanceKm: 1 // Max distance for user to be able to check in
})
