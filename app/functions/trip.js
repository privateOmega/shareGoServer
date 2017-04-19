const trip                  = require('../models/passengers');
const turf                  = require('@turf/distance');



exports.checkDestinationReached = (currentLatitude,currentLongitude,endLatitude,endLongitude) =>{
	var currentLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(currentLatitude),parseFloat(currentLongitude)]
	  }
	};
	var destinationLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(endLatitude), parseFloat(endLongitude)]
	  }
	};
	var units = "kilometers";
	var successValue;
	var points = {
	  "type": "FeatureCollection",
	  "features": [currentLocation, destinationLocation]
	};
	var remainingDistance = turf(currentLocation, destinationLocation, units);
	if(remainingDistance<=0.01)
		successValue=true;
	else
     	successValue=false;
	return successValue;
};

exports.findDistanceCovered = (startLatitude,startLongitude,endLatitude,endLongitude) =>{
	var startLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(startLatitude),parseFloat(startLongitude)]
	  }
	};
	var destinationLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(endLatitude), parseFloat(endLongitude)]
	  }
	};
	var units = "kilometers";
	var successValue;
	var points = {
	  "type": "FeatureCollection",
	  "features": [startLocation, destinationLocation]
	};
	var totalDistance = turf(startLocation, destinationLocation, units);
	return totalDistance;
};

exports.findNearbyDrivers = (paxLatitude,paxLongitude,driverLatitude,driverLongitude) =>{
	var paxLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(paxLatitude),parseFloat(paxLongitude)]
	  }
	};
	var driverLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [parseFloat(driverLatitude), parseFloat(driverLongitude)]
	  }
	};
	var units = "kilometers";
	var successValue;
	var points = {
	  "type": "FeatureCollection",
	  "features": [paxLocation, driverLocation]
	};
	var totalDistance = turf(paxLocation, driverLocation, units);
	console.log("Pax Lat = "+ parseFloat(paxLatitude));
	console.log("driver Lat = "+ parseFloat(driverLatitude));
	console.log("Nearby Distance = "+totalDistance);
	if(totalDistance<=1)
	return true;
	else return false;
};
