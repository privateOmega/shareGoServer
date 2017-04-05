const trip                  = require('../models/passengers');
const turfCollect           = require('@turf/collect');
//turfCollect(points, polys, 'population', 'populationValues')


exports.checkDestinationReached = (currentLatitude,currentLongitude,endLatitude,endLongitude) =>{
	var currentLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [currentLatitude,currentLongitude]
	  }
	};
	var destinationLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [endLatitude, endLongitude]
	  }
	};
	var units = "kilometers";
	var successValue;
	var points = {
	  "type": "FeatureCollection",
	  "features": [currentLocation, destinationLocation]
	};
	var remainingDistance = turf.distance(currentLocation, destinationLocation, units);
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
	    "coordinates": [startLatitude,startLongitude]
	  }
	};
	var destinationLocation = {
	  "type": "Feature",
	  "properties": {},
	  "geometry": {
	    "type": "Point",
	    "coordinates": [endLatitude, endLongitude]
	  }
	};
	var units = "kilometers";
	var successValue;
	var points = {
	  "type": "FeatureCollection",
	  "features": [startLocation, destinationLocation]
	};
	var totalDistance = turf.distance(startLocation, destinationLocation, units);
	return totalDistance;
};
