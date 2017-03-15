var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Appointment = new Schema({

    mainuser: { type: Schema.Types.ObjectId, ref: 'User' },
    inviteduser: [{ type: String }],
    confirmeduser: [{ type: String }],
    title: { type: String },
    schedule: { type: Date },
    status: { type: String, default: 'Pending' },
    created_at: { type: Date, default: Date.now },
    active: { type: Number, default:0 }

})


module.exports = mongoose.model('Appointment', Appointment)
