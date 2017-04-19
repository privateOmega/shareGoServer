const mongoose 	= require('mongoose');

var ratingSchema = new mongoose.Schema({
  user: {type:String, required: true},
  paxRating: { type: Number, required: true,default:0},
  paxCount: {type: Number, required:true,default:0},
  driverRating:{type:Number, required: true,default:0 },
  driverCount:{type:Number, required:true,default:0}
 }, { timestamps: true });

// CREATE MODEL
var Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;