angular.module('mainCtrl', ['authService'])


.controller('MainController', function($rootScope, $location, Auth, AuthToken) {

	var vm = this;

	vm.loggedIn = Auth.isLoggedIn();

	$rootScope.$on('$routeChangeStart', function() {

		vm.loggedIn = Auth.isLoggedIn();

		Auth.getUser()
			.then(function(data) {
				vm.user = data.data;
			});
	});


	vm.doLogin = function() {

		vm.processing = true;

		vm.error = '';
		console.log(vm.loginData);
		Auth.login(vm.loginData.email, vm.loginData.password)
			.success(function(data) {
				vm.processing = false;
				console.log(data)
				AuthToken.setToken(data.token);
				if(data.success){

					$location.path('/');
					console.log('hellllllllllllllo')
				}
				else
					vm.error = data.message;

			});
	}


	vm.doLogout = function() {
		Auth.logout();
		$location.path('/logout');
	}


});