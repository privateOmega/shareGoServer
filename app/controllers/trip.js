const config                = require('../configurations/config');
const user                  = require('../models/user');
const trip                  = require('../models/trip');
const passengertrip         = require('../models/passengers');
const func                  = require('../functions/trip');

exports.createTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  var Trip = new trip({
    vId:req.body.vId,
    status:'OTG',
    startLatitude:req.body.startLatitude,
    startLongitude:req.body.startLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude,
    user:req.body.username,
    seats:req.body.seats,
    time:req.body.time,
    routeId:req.body.routeId,
    latitude:req.body.latitude,
    longitude:req.body.longitude,
    date:req.body.date,
    passengerCount:0
  });
  res.writeHead(200, {"Content-Type": "application/json"});
  trip.find({$and:[{username:req.body.username},{vId:req.body.vId},{status:'OTG'}]}).cursor()
  .on('data', function(existingRide){
    console.log(existingRide._id);
    if (existingRide.username == req.body.username) {
      console.log("username exists");
      res.write(JSON.stringify({rUname: 'Ride with that username already exists' }));
      return ;
    }
    else if (existingRide.vId==req.body.vId) {
      console.log("vehicle exists");
      res.write(JSON.stringify({ rEmail: 'Ride with that vId already exists' }));
      return ;
    }
    else if (existingRide.status=='OTG'){
      console.log("the ride is OTG");
      res.write(JSON.stringify({ rStatus: 'OTG' }));
      return ;
    }
    Trip.save((err) => {
      if (err) { return next(err); }
    });
    res.json({ success: true, message: 'Trip is approved' });
    return;
  });
  res.write(JSON.stringify({ success: false }));
  res.end();
};

exports.passengerJoinTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  var passengerTrip = new passengertrip({
    username:req.body.username,
    status:'OTG',
    startLatitude:req.body.startLatitude,
    startLongitude:req.body.startLongitude,
    currentLatitude:req.body.currentLatitude,
    currentLongitude:req.body.startLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude,
  });
  res.writeHead(200, {"Content-Type": "application/json"});
  passengertrip.find({username:req.body.username}).cursor()
  .on('data', function(existingRide){
    console.log(existingRide._id);
    if (existingRide.username == req.body.username) {
      console.log("passenger trip already exists");
      res.write(JSON.stringify({rUname: 'Ride with that username already exists' }));
      return ;
    }
    else
    {
      passengerTrip.save((err) => {
          if (err) { return next(err); }
      });
     trip.findOne({username: req.body.driverUsername}, function (err, tripUser) {
       if(tripUser.passengerCount<tripUser.seats)
        {
         tripUser.passengerCount +=1;
         tripUser.pId.push(existingRide._id);
         tripUser.save(function (err) {
           if(err) {
             console.error('ERROR!');
           }
         });
        }
       else console.error('SEATS FULL !');
     });
    res.json({ success: true, message: 'Trip is approved' });
    return;
   }
  });
  res.write(JSON.stringify({ success: false }));
  res.end();
};

exports.endPassengerTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  var Trip = new passengertrip({
    startLatitude:req.body.startLatitude,
    startLongitude:req.body.startLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude,
    currentLatitude:req.body.currentLatitude,
    currentLongitude:req.body.currentLongitude,
    username:req.body.username,
  });
  res.writeHead(200, {"Content-Type": "application/json"});
  passengertrip.findOne({username:req.body.username}).cursor()
  .on('data', function(existingTrip){
    if (existingRide.username == req.body.username) {
      console.log("Trip exists");
    var tripComplete = func.checkDestinationReached(req.body.currentLatitude,req.body.currentLongitude,
              req.body.endLatitude,req.body.endLongitude);
     if(tripcomplete==true || existingRide.status=='CANC'){
      var distanceCovered = func.findDistanceCovered(req.body.startLatitude,req.body.startLongitude,
                req.body.endLatitude,req.body.endLongitude);
    Trip.remove({ _id: req.body.id }, function(err) {
      if (!err) {
          console.log("RIDE DELETED");
      }
      else {
           console.log("RIDE DELETE ERROR");
      }
    });
    res.write(JSON.stringify({ distance:distanceCovered},{ success: true }));
     }
   }
   else
      res.write(JSON.stringify({ success: false }));
   res.end();
  });
};

exports.endDriverTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  trip.findOne({username:req.body.username}).cursor()
  .on('data', function(existingTrip){
    if (existingRide.username == req.body.username) {
      console.log("Trip exists !");
      var tripComplete = func.checkDestinationReached(req.body.currentLatitude,req.body.currentLongitude,
              req.body.endLatitude,req.body.endLongitude);
     if(tripcomplete==true || existingRide.status=='CAN'){
      var distanceCovered = func.findDistanceCovered(req.body.startLatitude,req.body.startLongitude,
                req.body.endLatitude,req.body.endLongitude);
      trip.remove({ _id: req.body._id }, function(err) {
        if (!err) {
            console.log("RIDE DELETED");
        }
        else {
             console.log("RIDE DELETE ERROR");
        }
      });
      res.write(JSON.stringify({ distance:distanceCovered},{ success: true }));
     }
   }
   else
      res.write(JSON.stringify({ success: false }));
   res.end();
  });
};

//CANCEL TRIP BOTH
//REDUCE COUNT WHEN TRIP ENDS





