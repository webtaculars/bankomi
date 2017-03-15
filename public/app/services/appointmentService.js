angular.module('appointmentService', [])

.factory('Appointment', function($http) {

	var appointmentFactory = {};

	appointmentFactory.create = function(appointmentData) {
		return $http.post('/api/create_appointment', appointmentData);
	}

	appointmentFactory.getapp = function(){
		return $http.get('/api/get_myappointments');
	}

	appointmentFactory.accept = function(id){
		return $http.post('/api/accept_appointment', {id: id});
	}

	appointmentFactory.reject = function(id){
		return $http.post('/api/reject_appointment', {id: id});
	}

	return appointmentFactory;

})	