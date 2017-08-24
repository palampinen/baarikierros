angular.module('barhop.controllers')

.controller('HomeCtrl', function($scope, Locations, User) {

  var routesRef = Locations.routes({ showOnlyPublic: true });
  // var usersRef = Locations.users($scope.barhopId);
  // var usersObjectRef = Locations.usersObject($scope.barhopId);


  //
  // # Load public routes
  //
  routesRef
  .$loaded()
  .then(function(data) {
    $scope.routes = data;
  });


});
