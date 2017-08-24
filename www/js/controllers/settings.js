angular.module('barhop.controllers')

.controller('SettingsCtrl', function($scope, $timeout, $ionicModal, Locations, User) {

  var userId = User.getUser();
  var userRef, locationRef;

  //
  // # Load user information for Barhop
  //
  var loadUserInfo = function() {
    userRef
    .$loaded()
    .then(function(userData) {
      $scope.username = _.get(userData, ['name'], '');
    });
  }

  //
  // # Form Edit state
  //
  $scope.toggleEditMode = function() {
    $scope.editMode = !$scope.editMode;

    // Focus on username innput
    if ($scope.editMode) {
      $timeout(function() {
        var input = document.getElementById('input-username');
        !!input && input.focus();
      });
    }
  }


  //
  // # Save user
  //
  var saveUser = function(name) {
    if (!userRef) {
      return;
    }

    userRef.name = name;
    userRef.$save().then(loadUserInfo);
  }


  $scope.saveUserForm = function(name) {
    // Save user
    saveUser(name);


    // Handle Form state changes
    $scope.savedUserForm = true;
    var input = document.getElementById('input-username');
    !!input && input.blur();

    $timeout(function() {
      delete $scope.savedUserForm;
      $scope.editMode = false;
    }, 2000)
  }


  //
  // # Show stats
  //

  var locations = [];
  var loadLocations = function() {
    locationRef
    .$loaded()
    .then(function(data) {
      locations = data;
    });
  }


  $scope.stats = {
    getChecksCount: function() {
      return _.filter(locations, function(place) {
        return _.has(place, ['hops', $scope.userId], false)
      }).length;
    },
    getProgress: function() {
      var progress = (this.getChecksCount() / locations.length) * 100;
      return progress
        ? _.round(progress, 1)
        : 0;
    }
  }


  //
  // # Update/load content
  //
  $scope.$on('$ionicView.enter', function(e) {
    userRef = Locations.user($scope.getBarhopId(), userId);
    locationRef = Locations.locations($scope.getBarhopId());
    loadUserInfo();
    loadLocations();
  });


});
