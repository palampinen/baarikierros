angular.module('liquomsa.controllers', ['config'])

.controller('DashCtrl', function($scope) {})

.constant('PLACEHOLDER_BAR_IMG', 'https://images.unsplash.com/photo-1468056961052-15507578a50d?dpr=1&auto=format&crop=entropy&fit=crop&w=750&h=350&q=80')

.controller('LocationsCtrl', function($scope, $timeout, Locations, Utils, CONFIG, PLACEHOLDER_BAR_IMG, CONFIG) {

  $scope.placholderBarImg = PLACEHOLDER_BAR_IMG;
  $scope.locationInfos = {};

  var loadLocations = function() {
    Locations.$loaded().then(function(data) {
      $scope.loaded = true;
      $scope.locations = _.groupBy(data, 'category');
      $scope.categories = _.keys($scope.locations);
    });
  }

  loadLocations();

  $scope.toggleItem = function(item, cat, key) {
    var distance = _.has($scope.locationInfos, [cat, key, 'distance']) ? $scope.locationInfos[cat][key].distance : '';
    if (distance !== 0 && (!distance || distance > CONFIG.maxDistanceKm)) {
      return;
    }

    item.visited=!item.visited;
    item.visitedAt= new Date().getTime();
    Locations.$save(item).then(function(data){
      loadLocations();
    });
  }


  function geoLocationDisabled() {
    console.log('enable geolocation')
  }


  // get geolocation
  function getLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(cb, geoLocationDisabled, { enableHighAccuracy: true,timeout: 15000,maximumAge: 15000});
    } else {
      console.log("Geolocation is not supported by this browser." );
    }
  };


  function getDistances(position) {
    $timeout(function(){
      for (var key in $scope.locations) {
        $scope.locations[key].forEach(function(item, i){
          var distance = Utils.distance(
            position.coords.latitude, position.coords.longitude,
            item.lat, item.lon
          ).toFixed(1);

          if(!$scope.locationInfos[key]) $scope.locationInfos[key] = {};
          if(!$scope.locationInfos[key][i]) $scope.locationInfos[key][i] = {};

          $scope.locationInfos[key][i].distance = distance;
          $scope.locationInfos[key][i].close = position.coords && distance < CONFIG.maxDistanceKm;
        });
      }
    });
  }

  $scope.getVisitedPlaces = function(places) {
    return _.filter(places, function(place) {
      return place.visited
    }).length;
  }


  $scope.getTimeAgo = function(ago) {
    var diff = (new Date().getTime() - ago) / 60000; // minutes

    //if(diff < 3)
    //  return 'Juuri nyt!';
    if(diff < 60)
      return Math.round(diff) + ' min sitten';
    else if(diff < 60 * 24)
      return Math.round(diff/60) + ' h sitten';
    else (diff < 60 * 24)
      return Math.round(diff/60/24) + ' pv sitten';
  }


  $scope.sortByDistance = function(category) {

    return _.has($scope.locationInfos, [category, 0, 'distance']) ?
      parseInt($scope.locationInfos[category][0].distance) : 0;

  }


// Get user location
  $timeout(function(){
    getLocation(getDistances);
  }, 500);


})




.controller('MapCtrl', function($scope, Locations, CONFIG) {

  var map, me, marker, markers, refresh, travelPath;
  var meIcon = {
    url: 'img/marker-user.png',
    size: new google.maps.Size(22,22),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(11, 11)
  };
  var placeIcon = {
    url: 'img/marker-place.png',
    size: new google.maps.Size(22,22),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(11, 11)
  };

  var mapOptions = {
    center: { lat: CONFIG.startPointLat, lng: CONFIG.startPointLon},
    zoom: 11,
    disableDefaultUI: true,
    backgroundColor: "#2d2d2d",
    styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}]
  };


  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var createMarkers = function(items) {

    var alphabets = 'ABCDEFGHIJKLMNOPQRSTUVW...';
    var visitCounter = 0;
    return _
    .chain(items)
    .sortBy(function(item) { return item.visitedAt || 0 })
    .map(function(item) {
      var itemCoords = new google.maps.LatLng(item.lat, item.lon);
      return new google.maps.Marker({
        position: itemCoords,
        // size: new google.maps.Size(28,28),
        // origin: new google.maps.Point(0,0),
        // anchor: new google.maps.Point(14, 28),
        // icon: `img/marker-${item.visited ? 'green' : 'red'}.png`,
        icon: !item.visited ? placeIcon : null,
        label: item.visited ? alphabets[visitCounter++] : '',
        map: map,
        title: item.name
      });
    })
    .value();

  }

  function clearMarkers() {
    if (!$scope.markers || !$scope.markers.length) {
      return;
    }
    $scope.markers.forEach(function(marker) {
      marker.setMap(null);
    });
  }



  function geoLocationDisabled() {
    console.log('enable geolocation')
  }

  // get geolocation
  function getLocation(cb) {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(cb, geoLocationDisabled, { enableHighAccuracy: true,timeout: 15000,maximumAge: 15000});
    } else {
      console.log("Geolocation is not supported by this browser." );
    }
  };


  function showPosition(position) {
    var coords = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    map.setCenter(coords)
    createMe(coords);
  };


  // Show on map
  function createMe(myLatlng) {

    //marker
    if(marker&&marker.getMap()){
      marker.setPosition(myLatlng)
    } else {
      marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: 'Sijaintisi',
        icon:meIcon
      });
    }

  };

  function createTravelPath(markers) {

    if (travelPath) {
      travelPath.setMap(null);
    }

    var markerCoordinates = _
    .chain(markers)
    .filter(function(marker){ return marker.visited })
    .sortBy(function(marker) { return marker.visitedAt })
    .map(function(marker) {
      return {lat: marker.lat, lng: marker.lon }
    })
    .value();

    if (!markerCoordinates.length) {
      return;
    }

    travelPath = new google.maps.Polyline({
      path: markerCoordinates,
      geodesic: true,
      strokeColor: '#F7685C',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });

    travelPath.setMap(map);

  }

  $scope.$on('$ionicView.enter', function(e) {
    Locations.$loaded().then(function(data) {
      $scope.loaded = true;
      $scope.locations = data;
      clearMarkers();
      $scope.markers = createMarkers(data);
      createTravelPath(data);
    });
  });


  getLocation(showPosition);



});
