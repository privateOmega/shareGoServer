const config                = require('../configurations/config');
const user                  = require('../models/user');
const trip                  = require('../models/trip');
const passengertrip         = require('../models/passengers');
const extraFunctions         = require('../functions/trip');
const completedtrips         = require('../models/completedTrips');
const cancelledtrips         = require('../models/cancelledTrips');
const rating                  = require('../models/rating');

exports.setRating = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  //send request as user,role,rating
  console.log(req.body.user);
  rating.findOne({user:req.body.user}, function(err,rating){
    if(req.body.role=="pax"){
      rating.paxRating=((rating.paxRating*rating.paxCount)+req.body.rating)/(rating.paxCount+1);
      rating.paxCount+=1;
    }
    else if(req.body.role=="driver"){
      rating.driverRating=((rating.driverRating*rating.driverCount)+req.body.rating)/(rating.driverCount+1);
      rating.driverCount+=1;
    }
    rating.save(function (err) {
           if(err) {
             console.error('ERROR!');
           }
    });
    res.json({success:true});
  });
};
