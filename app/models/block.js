const mongoose 	= require('mongoose');

var blockSchema = new mongoose.Schema({
  by: {type:String, required: true},
  user: { type: String, required: true},
  time:{type:String, required: true }
 }, { timestamps: true });

// CREATE MODEL
var Blocked = mongoose.model('Blocked', blockSchema);
module.exports = Blocked;