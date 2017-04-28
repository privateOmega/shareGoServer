const config                = require('../configurations/config');
const user                  = require('../models/user');
const trip                  = require('../models/trip');
const passengertrip         = require('../models/passengers');
const extraFunctions         = require('../functions/trip');
const completedtrips         = require('../models/completedTrips');
const cancelledtrips         = require('../models/cancelledTrips');

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDYGO88aGeYBDr6Z_3p9QPyFrUL7VX4U0Y'
});

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
          longitude: existingRide.longitude,
          routeId: existingRide.routeId
        });
      }
    });
  }
  else if(req.body.role== "pax"){
      passengertrip.findOne({$and:[{_id:req.body._id},{status:'OTG'}]}, (err, existingRide2) => {
        if (err) { return next(err); }
        if (existingRide2) {
          console.log("Found existing ride2");
          var route;
          googleMapsClient.directions({
            origin:  {
              "lat" : parseFloat(existingRide2.startLatitude),
              "lng" : parseFloat(existingRide2.startLongitude)
            },
            destination:  {
              "lat" : parseFloat(existingRide2.endLatitude),
              "lng" : parseFloat(existingRide2.startLongitude)
            },
          },function(err,response) {
            console.log('\n\nresponse is'+JSON.stringify(response.json.routes[0].overview_polyline.points));
            route=JSON.stringify(response.json.routes[0].overview_polyline.points);
            console.log('Route is'+route);
            route = route.replace(/"/g,"");
            res.json({
              success: true,
              startLatitude: existingRide2.startLatitude,
              startLongitude: existingRide2.startLongitude,
              endLatitude: existingRide2.endLatitude,
              endLongitude: existingRide2.endLongitude,
              latitude: existingRide2.currentLatitude,
              longitude: existingRide2.currentLongitude,
              driver: existingRide2.driver,
              routeId: route
            });
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
      //console.log("haha");
      //console.log(existingRide);
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

exports.otg = (req,res,next) =>{
  console.log(req.body.user);
  trip.find({status:'OTG'}, (err, existingRide) => {
    if (err) { return next(err); }
    if (existingRide.length) {
      var rideMap = {};
      existingRide.forEach(function(user) {
        rideMap[user._id] = user;
      });
      console.log("Ridemap");
      console.log(rideMap);
      res.json({success:true,ridemap:rideMap});

    }
    else
      res.json({success:false});
  });
};

exports.createTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
  }

  console.log(req.body.startLatitude+' '+req.body.startLongitude+' '+req.body.endLatitude+' '+req.body.endLongitude);
  var route;
  googleMapsClient.directions({
      origin:  {
        "lat" : parseFloat(req.body.startLatitude),
        "lng" : parseFloat(req.body.startLongitude)
      },
      destination:  {
        "lat" : parseFloat(req.body.endLatitude),
        "lng" : parseFloat(req.body.endLongitude)
      },
    },function(err,response) {
      console.log('\n\nresponse is'+JSON.stringify(response.json.routes[0].overview_polyline.points));
      route=JSON.stringify(response.json.routes[0].overview_polyline.points);
      console.log('Route is'+route);
      route = route.replace(/"/g,"");
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
        routeId:route,
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
    currentLongitude:req.body.currentLongitude,
    endLatitude:req.body.endLatitude,
    endLongitude:req.body.endLongitude,
    driver:'NoOneRightNow'
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

exports.paxConnectToDriver = (req, res, next) => {
  console.log("Passenger Connect to Driver inside trip.js ethi");
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false, message: errors });
   }
   else {
      trip.findOne({user: req.body.driverUser}, function (err, tripUser) {

         if (tripUser){
         if(tripUser.passengerCount<tripUser.seats)
          {

                passengertrip.findOneAndUpdate({username: req.body.paxUser}, {$set:{driver:req.body.driverUser}}, {new: true}, function(err, doc){
                if(err){
                    console.log("Something wrong when updating data!");
                }

                console.log(doc);
              });
           tripUser.passengerCount +=1;
           tripUser.pId.push(req.body.paxUser);
           tripUser.save(function (err) {
             if(err) console.error('ERROR!');
            res.json({ success: true,_id:tripUser._id });
            
           });
          }
         else {
           console.error('SEATS FULL !'); 
          res.json({ success: false});

          }
        }
        else {   console.log("driver does not exist ");
                 res.json({ success: false});
            }
     });
    }
    return;
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
};



//RECIEVES FROM REQUEST as profile user as USERNAME AND ROLE as DRIVER OR PAX 
exports.cancelTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false });
  }
  if(req.body.role=='driver')
  {
      trip.findOne({user:req.body.username}, function(err,existingTrip){
          if (existingTrip){
             console.log("Trip exists !");
             if(existingTrip.passengerCount>0){
                for(var i=0;i<existingTrip.pId.length;i++)
                  passengertrip.findOneAndRemove({username: existingTrip.pId[i]}, function(err){
                    if(err)console.log('ERROR');
                  });
             }
             trip.remove({ _id: req.body._id }, function(err){
                     console.log("RIDE DELETED");
                     var cancelledTrips= new cancelledtrips({
                          startLatitude:existingTrip.startLatitude,
                          startLongitude:existingTrip.startLongitude,
                          endLatitude:existingTrip.endLatitude,
                          endLongitude:existingTrip.endLongitude,
                          user:existingTrip.user,
                          time:existingTrip.time,
                          routeId:existingTrip.routeId,
                          date:existingTrip.date,
                          role:'driver',
                          reason:'some shit reason'
                      });
                      cancelledTrips.save((err) => {
                      if (err)  return next(err);
                      console.log('SAVE cancelledTrips');
                      });
             });             
          }
        });
      res.json({success: true});
      return;
  }
  else if(req.body.role=='pax')
  {
      passengertrip.findOne({username:req.body.username}, function(err,existingTrip){
        if (existingTrip) {
              console.log("Trip exists !");
             passengertrip.remove({ _id: req.body._id }, function(err)
             {
                     console.log("RIDE DELETED");
                     var cancelledTrips= new cancelledtrips({
                          startLatitude:existingTrip.startLatitude,
                          startLongitude:existingTrip.startLongitude,
                          endLatitude:existingTrip.endLatitude,
                          endLongitude:existingTrip.endLongitude,
                          user:existingTrip.username,
                          time:"0", //For now
                          routeId:"0", //For now
                          date:"0", //For now
                          role:'pax',
                          reason:'some pax reason'
                      });
                      cancelledTrips.save((err) => {
                      if (err)  return next(err);
                      console.log('SAVE cancelledTrips');
                      });
             });
          }
        });
      res.json({success:true});
      return;
  }
  res.json({success:false});
};


exports.endTrip = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    res.json({ success: false });
  }
  if(req.body.role=='driver')
  {
      trip.findOne({user:req.body.username}, function(err,existingTrip){
          if (existingTrip){
             console.log("Trip exists !");
             if(existingTrip.passengerCount>0){
                  console.log('Bro u still have passengers');
                  res.json({ endsuccess: false });
              }
              else
              {      trip.remove({ _id: req.body._id }, function(err){
                     console.log("RIDE Completed");
                     var completedTrips= new completedtrips({
                          startLatitude:existingTrip.startLatitude,
                          startLongitude:existingTrip.startLongitude,
                          endLatitude:existingTrip.endLatitude,
                          endLongitude:existingTrip.endLongitude,
                          user:existingTrip.user,
                          time:existingTrip.time,
                          routeId:existingTrip.routeId,
                          date:existingTrip.date,
                          role:'driver'
                      });
                      completedTrips.save((err) => {
                      if (err)  return next(err);
                      console.log('SAVEed completedTrips');
                      res.json({ endsuccess: true });
                      });
             });
             }             
          }
        });
      res.json({success: true});
      return;
  }
  else if(req.body.role=='pax')
  {
      passengertrip.findOne({username:req.body.username}, function(err,existingTrip){
        if (existingTrip) {
              console.log("Pax  2 Trip exists !");
           //  var  isDestinationReached = extraFunctions.checkDestinationReached(req.body.currentLatitude,req.body.currentLongitude,existingTrip.endLatitude,existingTrip.endLongitude);
              var  isDestinationReached = extraFunctions.checkDestinationReached("8.490872","76.95274",existingTrip.endLatitude,existingTrip.endLongitude);
              
             if(isDestinationReached) {
              console.log('Destination is reached');
              passengertrip.remove({ username: req.body.username }, function(err)
              {
                    if(err) console.log('cudnt delete pax trip');

                     else console.log("RIDE DELETED from pax");
                     var completedTrips= new completedtrips({
                          startLatitude:existingTrip.startLatitude,
                          startLongitude:existingTrip.startLongitude,
                          endLatitude:existingTrip.endLatitude,
                          endLongitude:existingTrip.endLongitude,
                          user:existingTrip.username,
                          time:"0", //For now
                          routeId:"0", //For now
                          date:"0", //For now
                          role:'pax',
                      });
                      completedTrips.save((err) => {
                      if (err)  return next(err);
                      console.log('SAVEd completedTrips');
                      });
             });
               //var  distanceCovered = extraFunctions.findDistanceCovered(existingTrip.startLatitude,existingTrip.startLongitude,req.body.currentLatitude,req.body.currentLongitude);
               var  distanceCovered = extraFunctions.findDistanceCovered(existingTrip.startLatitude,existingTrip.startLongitude,existingTrip.endLatitude,existingTrip.endLongitude);
               console.log('\nDC '+ distanceCovered);
               console.log('\nDriver '+ existingTrip.driver);


              
              user.findOne({username: existingTrip.driver}, function (err, uservar) {
                uservar.points = uservar.points+distanceCovered+10;
                uservar.save(function (err) {
                    if(err) {
                        console.error('ERROR in saving driver points!');
                    }
                });
              });

             

                user.findOne({username: req.body.username}, function (err, uservar) {
                uservar.points = uservar.points-distanceCovered-10;
                uservar.save(function (err) {
                    if(err) {
                        console.error('ERROR in saving pax points!');
                    }
                });
            });
               console.log('INSIDE END TRIP SUCCES CONDITION');
              res.json({success:true});
           }
           else {
                      res.json({success:false});
                      console.log('STILL HAVE PAXES');

                      return;
                }
           
          } else { 
            res.json({success:false});
            console.log('No such Pax found');
            return;


          }

        });
      
      return;
  }
  

};