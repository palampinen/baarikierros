// Ionic liquomsa App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'liquomsa' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'liquomsa.services' is found in services.js
// 'liquomsa.controllers' is found in controllers.js
angular.module('barhop', [
  'ionic',
  'config',
  'barhop.controllers',
  'barhop.services',
  'ion-sticky',
  'firebase'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $locationProvider, $urlRouterProvider, $ionicConfigProvider) {

  // $locationProvider.hashPrefix('');
  $locationProvider.html5Mode(true);

  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.views.transition('none');
  $ionicConfigProvider.views.maxCache(0);
  $ionicConfigProvider.scrolling.jsScrolling('false');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


  .state('info', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl',
  })
  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/:barhopId',
    abstract: true,
    controller: 'BarhopCtrl',
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.locations', {
    url: '/',
    views: {
      'tab-locations': {
        templateUrl: 'templates/tab-locations.html',
        controller: 'LocationsCtrl'
      }
    }
  })

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })
  .state('tab.me', {
    url: '/me',
    views: {
      'tab-me': {
        templateUrl: 'templates/tab-me.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

});
