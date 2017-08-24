angular.module('barhop.controllers')

.controller('BarhopCtrl', function($scope, $state, $stateParams, $ionicModal, $timeout, Locations, User) {
  //
  // # Set barhopId to scope for children
  //
  var getBarhopId = function() {
    return _.get($state, ['params', 'barhopId'], $stateParams.barhopId);
  }

  $scope.getBarhopId = getBarhopId;
  $scope.barhopId = getBarhopId();

  var infoRef, usersRef, usersObjectRef = null;

  //
  // # Load basic information for Barhop
  //
  var loadBasicInfo = function() {
    infoRef
    .$loaded()
    .then(function(data) {
      $scope.barhopInfo = data;
    });
  }


  //
  // # Create user for Barhop
  //
  $scope.userId = User.getUser();
  if (!$scope.userId) {
    usersRef
    .$add({ createdAt: new Date().getTime() })
    .then(function(ref) {
      // path
      var id = _.last(_.get(ref, ['path', 'o'], ['unknown-user-id']));

      $scope.userId = id;
      User.saveUser(id);
    });
  }


  //
  // # Load user for Barhop
  //
  var loadUsers = function() {
    usersObjectRef
    .$loaded()
    .then(function(usersData) {
      $scope.users = usersData;
    });
  }


  //
  // # Update/load content
  //
  $scope.$on('$ionicView.enter', function(e) {
    $scope.barhopId = getBarhopId();

    infoRef = Locations.info($scope.barhopId);
    usersRef = Locations.users($scope.barhopId);
    usersObjectRef = Locations.usersObject($scope.barhopId);

    loadBasicInfo();
    loadUsers();
  });



  //
  // # Modal for listing bar hoppers
  //
  $ionicModal.fromTemplateUrl('templates/modal-hops.html', {
    scope: $scope,
    animation: 'slide-in-up',
    hardwareBackButtonClose: true,
  }).then(function(modal) {
    $scope.hopsModal = modal;
  });

  $scope.openHopsModal = function(place) {
    $scope.hopsModal.show();

    $scope.detailBar = place;
  }

  $scope.closeHopsModal = function() {
    $scope.hopsModal.hide();

    // delete $scope.detailBar;
  }

  var today = moment();
  $scope.formatVisitTime = function(time) {
    var visitTime = moment(time);
    var format = today.isSame(visitTime, 'day') ? 'HH:mm' : 'D.M.YYYY HH:mm';

    return moment(time).format(format);
  }

});
