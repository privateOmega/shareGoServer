const config                = require('../configurations/config');
const user                  = require('../models/user');
const trip                  = require('../models/trip');
const passengertrip         = require('../models/passengers');
const extraFunctions         = require('../functions/trip');
const completedtrips         = require('../models/completedTrips');
const cancelledtrips         = require('../models/cancelledTrips');

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
  console.log(Trip);
  console.log("erorrrrr");
  res.writeHead(200, {"Content-Type": "application/json"});
  trip.find({$and:[{username:req.body.username},{status:'OTG'}]}, function(existingRide){
    console.log(existingRide);
    if(!existingRide)
      console.log("none whatsover haha");
    console.log(existingRide._id);
    if (existingRide.username == req.body.username) {
      console.log("username exists");
      res.write(JSON.stringify({rUname: 'Ride with that username already exists' }));
      return ;
    }
    else if (existingRide.status=='OTG'){
      console.log("the ride is OTG");
      res.write(JSON.stringify({ rStatus: 'OTG' }));
      return ;
    }
    if(!existingRide){
      Trip.save((err) => {
        if (err) { return next(err); }
      });
      res.json({ success: true, message: 'Trip is approved' });
      return;
    }
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
  var passengerTrip = new passengertrip({
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
    var tripComplete = extraFunctions.checkDestinationReached(req.body.currentLatitude,req.body.currentLongitude,
							req.body.endLatitude,req.body.endLongitude);
	   if(tripcomplete==true){

       var distanceCovered = extraFunctions.findDistanceCovered(req.body.startLatitude,req.body.startLongitude,
								req.body.endLatitude,req.body.endLongitude);
		passengerTrip.remove({ _id: req.body.id }, function(err) {
			if (!err) {
			    console.log("RIDE DELETED");
			}
			else {
			     console.log("RIDE DELETE ERROR");
			}
		});
    trip.findOne({username: req.body.driverUsername}, function (err, tripUser) {
       if(tripUser.passengerCount>0)
        {
         tripUser.passengerCount -=1;
         tripUser.pId.pop(existingRide._id);
         tripUser.save(function (err) {
           if(err) {
             console.error('ERROR!');
           }
         });
        }
       else console.error('SEATS ZERO !');
        var completedTrips = new completedtrips({
          startLatitude:req.body.startLatitude,
          startLongitude:req.body.startLongitude,
          endLatitude:req.body.endLatitude,
          endLongitude:req.body.endLongitude,
          user:req.body.username,
          time:tripUser.time,
          routeId:tripUser.routeId,
          date:tripUser.date,
          role:'PAX'
        });
        completedTrips.save((err) => {
      if (err) { return next(err); }
      else  console.error('COULD NOT SAVE completedTrips');
    });

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
  if (errors)
  {
    res.json({ success: false, message: errors });
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  trip.findOne({username:req.body.username}).cursor()
  .on('data', function(existingTrip){
    if (existingRide.username == req.body.username)
    {
      console.log("Trip exists !");
      var tripComplete = extraFunctions.checkDestinationReached(req.body.currentLatitude,req.body.currentLongitude,
							req.body.endLatitude,req.body.endLongitude);
	    if(tripcomplete==true)
      {
	           var distanceCovered = extraFunctions.findDistanceCovered(req.body.startLatitude,req.body.startLongitude,
								req.body.endLatitude,req.body.endLongitude);
             if(existingRide.passengerCount==0)
             {
                trip.remove({ _id: req.body._id }, function(err) {
  			    if (!err)
                {
          			  console.log("RIDE DELETED");
                  var completedTrips = new completedtrips({
                    startLatitude:existingRide.startLatitude,
                    startLongitude:existing.startLongitude,
                    endLatitude:existingRide.endLatitude,
                    endLongitude:existingRide.endLongitude,
                    user:existingRide.username,
                    time:existingRide.time,
                    routeId:existingRide.routeId,
                    date:existingRide.date,
                    role:'DRIVER'
                 });
                 completedTrips.save((err) => {
                   if (err) { return next(err); }
                     else  console.error('COULD NOT SAVE completedTrips');
  		          	});
                }
  			      else {
  			       console.log("RIDE DELETE ERROR");
  					   }
  				});
		  		res.write(JSON.stringify({ distance:distanceCovered},{ success: true }));
    	     }
	 }
   else  res.write(JSON.stringify({ message:'passengerCount not 0'},{ success: false }));
   }
   else
      res.write(JSON.stringify({ success: false }));
   res.end();
  });
};

//RECIEVES FROM REQUEST as profile user as USERNAME AND ROLE as DRIVER OR PAX 
exports.cancelTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  res.writeHead(200, {"Content-Type": "application/json"});
  if(req.body.role=='DRIVER')
  {
      trip.findOne({username:req.body.username}).cursor()
      .on('data', function(existingTrip)
      {
          if (existingRide.username == req.body.username)
          {
             console.log("Trip exists !");
             if(existingRide.passengerCount>0)
             {
                for(var i=0;i<existingRide.pId.length;i++)
                passengertrip.findOneAndRemove({username: 'existingRide.pId[i]'}, function(err){console.log('ERROR')});
             }
             trip.remove({ _id: req.body._id }, function(err)
             {
                     console.log("RIDE DELETED");
                     var cancelledTrips= new cancelledtrips({
                          startLatitude:existingRide.startLatitude,
                          startLongitude:existing.startLongitude,
                          endLatitude:existingRide.endLatitude,
                          endLongitude:existingRide.endLongitude,
                          user:existingRide.username,
                          time:existingRide.time,
                          routeId:existingRide.routeId,
                          date:existingRide.date,
                          role:'DRIVER',
                          reason:'some reason'
                      });
                      cancelledTrips.save((err) => {
                      if (err)  return next(err);
                      else  console.error('COULD NOT SAVE cancelledTrips');
                      });
             });
          }
        });
  }

  if(req.body.role=='PAX')
  {
      passengertrip.findOne({username:req.body.username}).cursor()
      .on('data', function(existingTrip){
        if (existingRide.username == req.body.username) {
        console.log("Trip exists !");
             passengertrip.remove({ _id: req.body._id }, function(err)
             {
                     console.log("RIDE DELETED");
                     var cancelledTrips= new cancelledtrips({
                          startLatitude:existingRide.startLatitude,
                          startLongitude:existing.startLongitude,
                          endLatitude:existingRide.endLatitude,
                          endLongitude:existingRide.endLongitude,
                          user:existingRide.username,
                          time:0, //For now
                          routeId:0, //For now
                          date:0, //For now
                          role:'PAX',
                          reason:'some pax reason'
                      });
                      cancelledTrips.save((err) => {
                      if (err)  return next(err);
                      else  console.error('COULD NOT SAVE cancelledTrips');
                      });
             });
          }
        });

  }
};































