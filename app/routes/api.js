process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var User = require('../models/user');
var Appointment = require('../models/appointment');

var config = require('../../config/config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');
var msg91 = require('msg91-sms');
var nodemailer = require('nodemailer');
var moment = require('moment-timezone');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sahilchauhan224@gmail.com',
        pass: 'pallavichauhan'
    }
});

// CREATE USER TOKEN
function createUserToken(user) {

    var token = jsonwebtoken.sign({

        id: user._id,
        email: user.email,
        mobile: user.mobile,
        name: user.name

    }, secretKey, {
        expiresIn: 900000000
    });

    return token
}


module.exports = function(app, express, io) {

    var api = express.Router();


    api.post('/signup', function(req, res) {
        var user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password
        })

        user.save(function(err, user) {
            if (err) {
                return console.log(err);
            } else {
                var token = createUserToken(user);
                res.json({
                    success: true,
                    token: token
                })
            }
        })

    })


    api.post('/login', function(req, res) {
        User.findOne({
            email: req.body.email
        }).select('name email mobile password').exec(function(err, user) {

            if (err) throw err;

            else if (!user) {

                res.send({ message: "User doesn't exist" });
            } else if (user) {

                var validPassword = user.comparePassword(req.body.password);

                if (!validPassword) {
                    res.send({ message: "Invalid Password" });
                } else {

                    var token = createUserToken(user);

                    res.json({
                        success: true,
                        message: "Successfully login",
                        token: token
                    });

                }

            }
        });

    })


    api.post('/get_users', function(req, res) {
        User.find({}, function(err, users) {
            if (err) {
                return console.log(err);
            } else {
                res.json(users);
            }
        })
    })


    // Middleware
    api.use(function(req, res, next) {
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        if (token) {
            jsonwebtoken.verify(token, secretKey, function(err, decoded) {
                if (err) {
                    res.status(403).send({ success: false, message: "Failed to connect" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {

            res.status(403).send({ success: false, message: "false token" });
        }

    });


    api.post('/create_appointment', function(req, res) {

        var inviteduser = req.body.invitedusers;

        var appointment = new Appointment({
            mainuser: req.decoded.id,
            inviteduser: req.body.invitedusers,
            title: req.body.title,
            schedule: req.body.schedule
        });

        //var array = inviteduser.split(",");
        /*inviteduser.forEach(function(element) {
            appointment.inviteduser.push(element);
        })*/



        appointment.save(function(err, appointment) {
            if (err) {
                return console.log(err);
            } else {
                var date = appointment.schedule;
                var date1 = moment(date).utcOffset("+05:30").toString();
                console.log(date1);
                inviteduser.forEach(function(element) {
                    var mailOptions = {
                        from: req.decoded.email,
                        to: element,
                        subject: 'Meeting Scheduled',
                        text: 'Hello world ?',
                        html: '<div style="border:1px solid #d0d0d0; padding:15px;color: #404040;"><h2>' + appointment.title + '</h2>You have been invited by ' + req.decoded.name + ' to join the meeting scheduled on ' + date1 + ' along with ' + appointment.inviteduser + '<br> To view please click <a href="http://localhost:8080">here</a>. </div>'
                    };
                    console.log(element);
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                    });
                    io.emit('newappointment_' + element, appointment);
                })

                io.emit('newappointment_' + req.decoded.email, appointment);
                res.json(appointment);

            }
        })

    })


    api.get('/get_myappointments', function(req, res) {
        Appointment.find({ $or: [{ inviteduser: req.decoded.email }, { mainuser: req.decoded.id }, { confirmeduser: req.decoded.email }] }).populate('mainuser').exec(function(err, result) {
            if (err) {
                return console.log(err)
            } else {
                res.json(result);
            }
        })
    })

    /*api.post('/send_notification', function(req, res) {
        Appointment.find({"status":'Confirmed', "active":0},function(err, result) {
            if (err) {
                return console.log(err)
            }
            else {
                result.forEach(function(element) {
                    element.confirmeduser.forEach(function(email){
                        var time = element.schedule;
                        var time1 = time.getTime();
                        var date = new Date();
                        var d = date.getTime()+19800000;
                        var remaining = time1 - d;
                        if(remaining>900000&& remaining<960000){
                            var mailOptions = {
                                from: '"Bankomi" <lnm.teamconnect@gmail.com>',
                                to: email,
                                subject: 'Reminder',
                                text: 'General Reminder',
                                html: 'appointment scheduled at ' +element.schedule+ ' .'
                            };
                        }

                        else{
                            //console.log('do nothing', remaining)
                        }

                    })
                    element.update({"$set":{"active":1}},function(err, response){
                        if(err){
                            return res.send(err);
                        }
                        else{
                            res.json(response);
                        }
                    })
                })

            }
        })
    })*/

    api.post('/one_appointment', function(req, res) {
        Appointment.findOne({ "id": req.body.appointmentid }).populate('inviteduser mainuser confirmeduser').exec(function(err, appointment) {
            if (err) {
                return console.log(err)
            } else {
                res.json(appointment);
            }
        })
    })


    api.post('/accept_appointment', function(req, res) {
        Appointment.findOneAndUpdate({ "_id": req.body.id }, { $pull: { inviteduser: req.decoded.email }, $push: { confirmeduser: req.decoded.email } }, { "new": true }).exec(function(err, appointment) {
            if (err) {
                console.log(err)
                res.send(err);
            } else {
                console.log(appointment.inviteduser.length)
                if (appointment.inviteduser.length == 0) {
                    Appointment.findOneAndUpdate({ "_id": req.body.id }, { $set: { 'status': 'Confirmed' } }).exec(function(err, response) {
                        if (err) {
                            return res.send(err)
                        } else {
                            console.log(response)
                            res.json(response)
                        }
                    })
                } else {
                    console.log(appointment)
                    res.json(appointment)
                }

            }
        })
    })


    api.post('/reject_appointment', function(req, res) {
        Appointment.findOneAndUpdate({ "_id": req.body.id }, { $set: { 'status': 'Declined' } }).exec(function(err, appointment) {
            if (err) {
                console.log(err)
                res.send(err);
            } else {
                res.json(appointment)
            }
        })
    })

    api.get('/me', function(req, res) {
        res.json(req.decoded)
    })


    return api;
}
