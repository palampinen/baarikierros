angular.module('barhop.controllers')

.controller('MapCtrl', function($scope, Locations, CONFIG, MapStyle) {

  var locationRef = Locations.locations($scope.getBarhopId());

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

  var visitedIcon = {
    url: 'img/marker__selected.png',
    size: new google.maps.Size(26,26),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(13, 13)
  };

  var notVisitedIcon = {
    url: 'img/marker__plain.png',
    size: new google.maps.Size(26,26),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(13, 13)
  };

  var mapOptions = {
    center: { lat: CONFIG.startPointLat, lng: CONFIG.startPointLon},
    zoom: 9,
    disableDefaultUI: ionic.Platform.isIOS() || ionic.Platform.isAndroid(),
    backgroundColor: "#2d2d2d",
    styles: MapStyle
  };


  map = new google.maps.Map(document.getElementById('map'), mapOptions);


  var getInfoWindowContent = function(markerData) {
    var isVisited = _.has(markerData, ['hops', $scope.userId]);
    var visitedAt = _.get(markerData, ['hops', $scope.userId, 'createdAt']);
    return `
      <div class="infowindow${isVisited ? ' infowindow--success' : ''}">
        <span class="infowindow__image" style="background-image: url(${markerData.image})">
          ${isVisited ? '<i class="ion-android-done checkmark"></i>' : ''}
        </span>
        <span class="infowindow__title">${markerData.name}</span>

        <span class="infowindow__status">
          ${isVisited
            ? `Checked at ${moment(visitedAt).format('D.M.YYYY HH:mm')}`: 'Not yet checked'}
        </span>
      </div>
    `;
  }


  var infoWindow = new google.maps.InfoWindow();
  var createMarkers = function(items) {

    var alphabets = 'ABCDEFGHIJKLMNOPQRSTUVW...';
    var visitCounter = 0;
    return _
    .chain(items)
    .sortBy(function(item) { return _.get(item, ['hops', $scope.userId, 'createdAt']) || 0 })
    .map(function(item, index) {
      var itemCoords = new google.maps.LatLng(item.lat, item.lon);
      var marker = new google.maps.Marker({
        position: itemCoords,
        // size: new google.maps.Size(28,28),
        // origin: new google.maps.Point(0,0),
        // anchor: new google.maps.Point(14, 28),
        icon: _.has(item, ['hops', $scope.userId]) ? visitedIcon : notVisitedIcon,
        // icon: !_.has(item, ['hops', $scope.userId]) ? placeIcon : null,
        label: _.has(item, ['hops', $scope.userId]) ? alphabets[visitCounter++] : '',
        map: map,
        title: item.name,
        zIndex: _.has(item, ['hops', $scope.userId]) ? 10 : 1
      });


      var infoWindowContent = getInfoWindowContent(item);

      marker.addListener('click', function() {
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);
      });

      return marker;
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
      navigator.geolocation.watchPosition(cb, geoLocationDisabled, { enableHighAccuracy: true, timeout: 15000, maximumAge: 15000});
    } else {
      console.log("Geolocation is not supported by this browser." );
    }
  };


  function showPosition(position) {
    var coords = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
    // map.setCenter(coords)
    createMe(coords);
  };


  // Show on map
  function createMe(myLatlng) {

    //marker
    if(marker && marker.getMap()){
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
      .filter(function(marker){ return _.has(marker, ['hops', $scope.userId]) })
      .sortBy(function(marker) { return _.get(marker, ['hops', $scope.userId]) })
      .map(function(marker) {
        return { lat: marker.lat, lng: marker.lon }
      })
      .value();

    if (!markerCoordinates.length) {
      return;
    }

    travelPath = new google.maps.Polyline({
      path: markerCoordinates,
      geodesic: true,
      strokeColor: '#28db7d',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });

    travelPath.setMap(map);

  }

  function fitToShowAllVisibleMarkers() {

    var bounds = new google.maps.LatLngBounds();
    _.map($scope.locations, function(item) {
      var position = new google.maps.LatLng(item.lat, item.lon);
      bounds.extend(position);
    });

    map.fitBounds(bounds);
  }

  $scope.$on('$ionicView.enter', function(e) {
    locationRef = Locations.locations($scope.getBarhopId());

    locationRef
    .$loaded()
    .then(function(data) {
      $scope.loaded = true;
      $scope.locations = data;
      clearMarkers();

      $scope.markers = createMarkers(data);
      createTravelPath(data);
      fitToShowAllVisibleMarkers();
    });
  });


  getLocation(showPosition);

});
