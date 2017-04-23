const bcrypt  = require('bcrypt-nodejs');
const crypto  = require('crypto');
const mongoose  = require('mongoose');

var cancelledTripsSchema = new mongoose.Schema({
  startLatitude: {type:String, required: true},
  startLongitude: {type:String, required: true},
  endLatitude: {type:String, required: true},
  endLongitude: {type:String, required: true},
  reason:{type:String,required:true},
  user: { type: String, required: true},
  time:{ type: String, required: true },
  routeId:{ type: String, required: true},
  date:{ type: String, required: true},
  role:{ type: String, required: true},
 }, { timestamps: true });

// CREATE MODEL
var cancelledTrips = mongoose.model('cancelledTrips', cancelledTripsSchema);
module.exports = cancelledTrips;
