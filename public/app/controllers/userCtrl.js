angular.module('userCtrl', ['userService'])


.controller('UserCreateController', function(User, $location, $window) {

	var vm = this;

	vm.signupUser = function() {
		vm.message = '';

		User.create(vm.userData)
		.then(function(response) {
			vm.userData = {};

			$window.localStorage.setItem('token', response.data.token);
			$location.path('/');
		})
	}


})