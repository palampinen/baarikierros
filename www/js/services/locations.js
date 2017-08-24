angular.module('barhop.services')

.factory('Locations', function($firebaseArray, $firebaseObject, CONFIG) {

  var refPath = CONFIG.firebaseBasePath;
  var database = firebase.database();
  var PATHS = {
    events: 'events',
    routes: 'routes'
  };

  // Add three-way data binding
  return {
    routes: function(opts = {}) {
      var query = database.ref(`${refPath}/${PATHS.routes}`);

      if (opts.showOnlyPublic) {
        query = query.orderByChild('public').equalTo(true)
      }

      return $firebaseArray(query);
    },
    info: function(id) {
      var query = database.ref(`${refPath}/${PATHS.routes}/${id}`);
      return $firebaseObject(query);
    },
    locations: function(id) {
      // ref.limitToLast(limit);
      var query = database.ref(`${refPath}/${PATHS.events}/${id}/locations`);
      return $firebaseArray(query);
    },
    users: function(id) {
      var query = database.ref(`${refPath}/${PATHS.events}/${id}/users`);
      return $firebaseArray(query);
    },
    usersObject: function(id) {
      var query = database.ref(`${refPath}/${PATHS.events}/${id}/users`);
      return $firebaseObject(query);
    },
    user: function(id, userId) {
      var query = database.ref(`${refPath}/${PATHS.events}/${id}/users/${userId}`);
      return $firebaseObject(query);
    }
  }
})
