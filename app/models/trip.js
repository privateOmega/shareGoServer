const mongoose  = require('mongoose');

var tripSchema = new mongoose.Schema({
  vId: {type:String, required: true},
  status: {type:String, required: true},
  startLatitude: {type:String, required: true},
  startLongitude: {type:String, required: true},
  endLatitude: {type:String, required: true},
  endLongitude: {type:String, required: true},
  user: { type: String, required: true},
  seats: { type: String, required: true},
  time:{ type: String, required: true },
  routeId:{ type: String, required: true},
  latitude:{ type: String, required: true},
  longitude:{ type: String, required: true},
  date:{ type: String, required: true},
  passengerCount :{ type: Number, required: true},
  pId: [String]
 }, { timestamps: true });

// CREATE MODEL
var Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;