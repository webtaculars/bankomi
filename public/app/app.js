angular.module('MyApp', ['appRoutes','userCtrl', 'mainCtrl', 'appointmentCtrl', 'userService', 'authService',
	'appointmentService',  'angularMoment'])

.config(function($httpProvider) {

	$httpProvider.interceptors.push('AuthInterceptor');

})
.filter('contains', function() {
  return function (array, needle) {
    return array.indexOf(needle) >= 0;
  };
});

