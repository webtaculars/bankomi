angular.module('appRoutes', ['ngRoute'])


.config(function($routeProvider, $locationProvider) {

	$routeProvider

		.when('/', {
			templateUrl: 'app/views/pages/appointment.html'
		})
    .when('/login', {
      templateUrl: 'app/views/pages/login.html'
    })
    .when('/market', {
      templateUrl: 'app/views/pages/market.html'
    })

	$locationProvider.html5Mode(true);

})
