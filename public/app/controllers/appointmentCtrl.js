angular.module('appointmentCtrl', ['appointmentService'])


.controller('AppointmentController', function(Appointment, $location, $window, socketio, $route) {

	var vm = this;
	vm.newemail = '';
	vm.emailids = [];
	vm.useremailid = '';
	vm.createappointment = function() {
		vm.appointmentData.invitedusers = vm.emailids;
		console.log(vm.appointmentData)
		Appointment.create(vm.appointmentData)
		.then(function(response) {
			vm.appointmentData = {};
			$route.reload();
		})
	}

	vm.addemail = function(){
		vm.emailids.push(vm.newemail);
		vm.newemail = '';
		console.log(vm.emailids)
	}
	vm.accept = function(appid){
		Appointment.accept(appid)
		.then(function(response) {
			console.log(response)
			$route.reload();
		})
	}
	vm.reject = function(appid){
		Appointment.reject(appid)
		.then(function(response) {
			console.log(response)
			$route.reload();
		})
	}
	Appointment.getapp().then(function(response){
/*		angular.forEach(response.data, function(e){
			e.schedule
		})*/
		vm.appointments = response.data;
		console.log(response)
		socketio.on('newappointment_'+vm.useremailid, function(data) {
			console.log(data)
			vm.appointments.push(data);
		})
	})

	$('#myTab a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	})


})