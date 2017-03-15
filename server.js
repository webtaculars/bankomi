var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config/config');
var mongoose = require('mongoose');
var cron = require('node-cron');
var Appointment = require('./app/models/appointment');
var nodemailer = require('nodemailer');
var moment = require('moment-timezone');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'sahilchauhan224@gmail.com',
		pass: 'pallavichauhan'
	}
});


var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect(config.database, function(err){
	if(err){
		console.log(err);
	}
	else {
		console.log('Happily Connected')
	}
});


app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));


var api = require('./app/routes/api')(app, express, io);
app.use('/api', api);

app.get('*', function(req, res){
	res.sendFile(__dirname + '/public/app/views/index.html');
});


cron.schedule('* * * * *', function(req, res){
	Appointment.find({"status":'Confirmed', "active":0},function(err, result) {
		if (err) {
			return console.log(err)
		} 
		else {
			result.forEach(function(element) {
				element.confirmeduser.forEach(function(email){
					var time = element.schedule;
					//var time1 = moment(time).utcOffset("+05:30").toString();
					var time2 = time.getTime();
					var date = new Date();
					var d = date.getTime();

					var remaining = time2 - d;
					console.log(time2,d,'------------' ,remaining, email);
					if(remaining>900000&& remaining<960000){
						var mailOptions = {
							from: 'sahilchauhan224@gmail.com',
							to: email,
							subject: element.title,
							text: 'General Reminder',
							html: 'This is a general reminder of your appointment scheduled at ' +time+ ' .'
						};
						console.log(remaining)
						transporter.sendMail(mailOptions, (error, info) => {
							if (error) {
								return console.log(error);
							}
							console.log('Message %s sent: %s', info.messageId, info.response);
							element.update({"$set":{"active":1}},function(err, response){
								if(err){
									return res.send(err);
								}
								else{
						//
					}
				})
						});
					}

					else{
    						//console.log('do nothing', remaining)
    					}

    				})
				
			})

		}
	})
});

http.listen(config.port, function(err){
	if(err) {
		console.log(err);
	} else {
		console.log('Listening on port 8080');
	}
});