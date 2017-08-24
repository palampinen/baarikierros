angular.module('barhop.controllers')

.controller('LocationsCtrl', function($scope, $state, $timeout, Locations, Utils, CONFIG) {
  // References to database service
  var locationRef = Locations.locations($scope.getBarhopId());

  $scope.placholderBarImg = 'https://images.unsplash.com/photo-1468056961052-15507578a50d?dpr=1&auto=format&crop=entropy&fit=crop&w=750&h=350&q=80';
  $scope.locationInfos = {};

  var loadLocations = function() {
    locationRef
    .$loaded()
    .then(function(data) {
      $scope.loaded = true;
      $scope.locations = _.groupBy(data, 'category');
      $scope.categories = _.keys($scope.locations);
    });

  }

  $scope.$on('$ionicView.enter', function(e) {
    locationRef = Locations.locations($scope.getBarhopId());
    loadLocations();
  });


  $scope.toggleItem = function(item, cat, key) {
    var maxDistanceKm = _.get($scope, ['barhopInfo', 'distance'], CONFIG.maxDistanceKm);

    var distance = _.has($scope.locationInfos, [cat, key, 'distance']) ? $scope.locationInfos[cat][key].distance : '';
    if (distance !== 0 && (!distance || distance > maxDistanceKm)) {
      return;
    }

    // item.visited = !item.visited;
    // item.visitedAt = new Date().getTime();

    if (_.has(item, ['hops', $scope.userId])) {
      // Remove hop
      delete item.hops[$scope.userId]
    } else {

      var message = prompt('Add optional review');
      // Add hop
      item.hops = Object.assign(item.hops || {}, { [$scope.userId ]: {
        createdAt: new Date().getTime(),
        message: message
      }});
    }

    locationRef.$save(item).then(function(data){
      loadLocations();
    });
  }

  function geoLocationDisabled(error) {
    console.log('geolocation disabled', error)
  }


  // get geolocation
  function getLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(cb, geoLocationDisabled, { enableHighAccuracy: false, timeout: 27000, maximumAge: 30000 });
    } else {
      console.log("Geolocation is not supported by this browser." );
    }
  };


  function getDistances(position) {
    $timeout(function(){
      var maxDistanceKm = _.get($scope, ['barhopInfo', 'distance'], CONFIG.maxDistanceKm);
      for (var key in $scope.locations) {
        $scope.locations[key].forEach(function(item, i){
          var distance = Utils.distance(
            position.coords.latitude, position.coords.longitude,
            item.lat, item.lon
          ).toFixed(1);

          if (!$scope.locationInfos[key]) {
            $scope.locationInfos[key] = {};
          }
          if (!$scope.locationInfos[key][i]) {
            $scope.locationInfos[key][i] = {};
          }

          $scope.locationInfos[key][i].distance = distance;
          $scope.locationInfos[key][i].close = position.coords && distance < maxDistanceKm;
        });
      }
    });
  }

  $scope.getVisitedPlaces = function(places) {
    return _.filter(places, function(place) {
      return _.has(place, ['hops', $scope.userId], false)
    }).length;
  }

  $scope.getPlaceVisitors = function(place) {
    return Object.keys(place.hops || {}).length;
  }


  $scope.getTimeAgo = function(ago) {
    var diff = (new Date().getTime() - ago) / 60000; // minutes

    if (diff < 60) {
      return Math.round(diff) + ' min ago';
    }
    else if (diff < 60 * 24) {
      return Math.round(diff/60) + ' h ago';
    }
    else if (diff < 60 * 48) {
      return 'Yesterday';
    }
    else {
      return Math.round(diff / 60 / 24) + ' days ago';
    }
  }


  $scope.sortByDistance = function(category) {
    return _.has($scope.locationInfos, [category, 0, 'distance'])
      ? parseInt($scope.locationInfos[category][0].distance)
      : 0;
  }

  // Get user location
  $timeout(function(){
    getLocation(getDistances);
  }, 500);




});
