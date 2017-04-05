const bcrypt 	= require('bcrypt-nodejs');
const crypto 	= require('crypto');
const mongoose 	= require('mongoose');

//var min = [Date('1917-01-01'), 'The value is below minimum.'];
var passengersSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  status: {type:Boolean, required: true},
  startLatitude: { type: String, required: true, unique: true },
  startLongitude: { type: String, required: true, unique: true },
  currentLatitude: { type: String, required: true, unique: true },
  currentLongitude: { type: String, required: true, unique: true },
  endLatitude: { type: String, required: true, unique: true },
  endLongitude: { type: String, required: true, unique: true },
  
}, { timestamps: true });

// CREATE MODEL
var Pax = mongoose.model('Pax', passengersSchema);
module.exports = Pax;