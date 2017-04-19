const config                = require('../configurations/config');
const user                  = require('../models/user');
const trip                  = require('../models/trip');
const passengertrip         = require('../models/passengers');
const extraFunctions         = require('../functions/trip');
const completedtrips         = require('../models/completedTrips');
const cancelledtrips         = require('../models/cancelledTrips');

exports.getTripDetails = (req,res,next) =>{
  console.log("req"+req.body);
  if(req.body.role=="driver"){
    trip.findOne({$and:[{_id:req.body._id},{status:'OTG'}]}, (err, existingRide) => {
      if (err) { return next(err); }
      if (existingRide) {
        res.json({
          success: true,
          startLatitude: existingRide.startLatitude,
          startLongitude: existingRide.startLongitude,
          endLatitude: existingRide.endLatitude,
          endLongitude: existingRide.endLongitude,
          latitude: existingRide.latitude,
          longitude: existingRide.longitude
        });
      }
    });
  }
  else if(req.body.role== "pax"){
      passengertrip.findOne({$and:[{_id:req.body._id},{status:'OTG'}]}, (err, existingRide2) => {
        if (err) { return next(err); }
        if (existingRide2) {
          res.json({
            success: true,
            startLatitude: existingRide2.startLatitude,
            startLongitude: existingRide2.startLongitude,
            endLatitude: existingRide2.endLatitude,
            endLongitude: existingRide2.endLongitude,
            latitude: existingRide2.currentLatitude,
            longitude: existingRide2.currentLongitude
          });
        }
      });
  }
};

exports.getTrip = (req,res,next) =>{
  console.log(req.body.user);
  trip.findOne({$and:[{user:req.body.user},{status:'OTG'}]}, (err, existingRide) => {
    if (err) { return next(err); }
    if (existingRide) {
      console.log("haha");
      console.log(existingRide);
      res.json({
        success: true,
        role: "driver",
        _id: existingRide._id
      });
    }
    else{
      passengertrip.findOne({$and:[{username:req.body.user},{status:'OTG'}]}, (err, existingRide2) => {
        if (err) { return next(err); }
        if (existingRide2) {
          console.log("haha 2");
          console.log(existingRide2);
          res.json({
            success: true,
            role: "pax",
            _id: existingRide2._id
          });
        }
        else
          res.json({success: false,message: 'no existing ride'});
      });
    }
  });
};

exports.createTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  console.log(req.body.user);
  var Trip = new trip({
    vId:req.body.vId,
    status:'OTG',
    startLatitude:req.body.startLatitude,
    startLongitude:req.body.startLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude,
    user:req.body.user,
    seats:req.body.seats,
    time:req.body.time,
    routeId:req.body.routeId,
    latitude:req.body.latitude,
    longitude:req.body.longitude,
    date:req.body.date,
    passengerCount:0
  });
  trip.find({$and:[{user:req.body.user},{status:'OTG'}]}, function(err,existingRide){
     if(existingRide.length){
      res.json({ success: false});
    }
    else{
      console.log("none whatsover haha");
      Trip.save((err,trip) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        console.log("found trip id as "+trip._id);
        res.json({ success: true, _id: trip._id});
      });
      return;
    }
  });
};

exports.passengerJoinTrip = (req, res, next) => {
  console.log("Passenger join trip ethi");
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  var passengerTrip = new passengertrip({
    username:req.body.user,
    status:'nodriver',
    startLatitude:req.body.startLatitude,
    startLongitude:req.body.startLongitude,
    currentLatitude:req.body.currentLatitude,
    currentLongitude:req.body.startLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude
  });
  passengertrip.find({username:req.body.user}, function(err,existingRide){
   //console.log(existingRide._id);
    if (existingRide.length) {
      console.log("passenger trip already exists");
       res.json({ success: false});
    }
    else
    {
      console.log("Creating Pax trip");
    	passengerTrip.save((err,passengertrip) => {
      		if (err)  return next(err);
          res.json({ success: true,_id: passengertrip._id});
 	    });
      
      /*
	    trip.findOne({user: req.body.driverUsername}, function (err, tripUser) {

         if (tripUser){
	       if(tripUser.passengerCount<tripUser.seats)
  		    {
  			   tripUser.passengerCount +=1;
  			   tripUser.pId.push(req.body.user);
  			   tripUser.save(function (err) {
    			   if(err) console.error('ERROR!');
  			   });
  		    }
	       else console.error('SEATS FULL !');
        }
        else {   console.log("driver does not exist ");
                 res.json({ success: false});
            }
	   }); */
   }
   return;
  });

};

exports.passengerMatchAllDrivers = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }
  console.log("Inside trip.js passengerMatchAllDrivers");
 var driverUserList = new Array();
 var driverLatitudeList = new Array();
 var driverLongitudeList = new Array();
 var jArr = new Array();
 trip.find({},function(err, records) {
  if(err) {
          console.log('ERROR IN FINDING');
          driverUserList.push("temp");
          driverLatitudeList.push(req.body.paxLatitude);
          driverLongitudeList.push(req.body.paxLongitude);

         }
  if(records.length){
      console.log("REC LENGTH :"+records.length);
      for (var i=0;i<records.length;i++) {
       var isNearBy = extraFunctions.findNearbyDrivers(req.body.paxLatitude,req.body.paxLongitude,records[i].latitude,records[i].longitude);
        if(isNearBy)
        {   console.log("\nFOUND DRIVEr : "+records[i].user);
           //driverUserList.push(records[i].user);
         //  console.log("\nHAHAHA"+driverUserList[i]);
           //driverLatitudeList.push(records[i].latitude);
           //driverLongitudeList.push(records[i].longitude);
           var job = {
            title: records[i].user,
            coordinates: {
              latitude: records[i].latitude,
              longitude: records[i].longitude
            }
           }
           console.log("JOB : "+job);
           jArr.push(job);
        }
      }
      console.log("KUNDAN"+jArr);
     res.json({jArr : jArr});
  }
  return;
   });
 
 //res.json({driverList:driverUserList , driverLatitude:driverLatitudeList , driverLongitude:driverLongitudeList});
  /*
  var json = JSON.stringify({
        success:true,
        driverUserName: driverUserList,
        coordinate : { 
                       lat : driverLatitudeList,
                       long: driverLongitudeList
                     }
  });
  res.write(json);
  

 res.end();*/
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































