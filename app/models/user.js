const bcrypt 	= require('bcrypt-nodejs');
const crypto 	= require('crypto');
const mongoose 	= require('mongoose');

//var min = [Date('1917-01-01'), 'The value is below minimum.'];
var userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true},
  gender: { type: String, required: true },
  number: { type: Number, required: true, unique: true },
  dob: { type: String, required: true },
  picture: { type: String },
  aadharno: { type: String, required: true },
  state: {type: String, required:true },
  city: {type: String, required:true },
  pincode: {type: String, required:true },
  points: { type: Number}
}, { timestamps: true });

// CREATE MODEL
var User = mongoose.model('Users', userSchema);
module.exports = User;