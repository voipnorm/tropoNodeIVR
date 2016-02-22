'use strict'

var assert = require("assert");
var GooglePlaces = require("googleplaces");
var config = require("../config/config");
var googlePlaces = new GooglePlaces(config.apiKey, config.outputFormat);
var request = require('request');
var ciscospark = require('ciscospark');
var parameters;

var USPS = require('usps-webtools');
    var usps = new USPS({
    server: 'http://production.shippingapis.com/ShippingAPI.dll',
    userId: config.uspsDevToken,
    ttl: 10000 //TTL in milliseconds for request
});
exports.cityLookup= function(zip,callback){
   
    usps.cityStateLookup(zip, function(err,data){
        if(err){
        utilsLogtoSpark(err);
        console.log(err);
        data ="00000";
        callback(data);
        }
        else{
        callback(data)
    }});
};
exports.googlePetSmartSearch = function(zip, callback){
    var parameters = {
    query: config.googleQueryText+" in "+zip
};
    var location;
    console.log("Google search "+parameters);
    googlePlaces.textSearch(parameters, function (error, response) {
        if (error) throw error;
            assert.notEqual(response.results.length, 0, "Text search must not return 0 results");
            console.log(response);
            location = response.results[0].formatted_address;
            console.log(location);
            callback("Your nearest "+config.googleQueryText+ " store " + location);
    
});
};
exports.googlePetSmartStoreHours = function(zip, callback){
   var parameters = {
    query: config.googleQueryText+" in "+zip
    };
    var placeId;
    var location;
    console.log("Google search "+parameters);
    googlePlaces.textSearch(parameters, function (error, response) {
        if (error) throw error;
            assert.notEqual(response.results.length, 0, "Text search must not return 0 results");
            console.log(response);
             placeId = {
                        placeid: response.results[0].place_id
                 };
                 googlePlaces.placeDetailsRequest(placeId, function(error, response){
                        if (error) throw error;
                            assert.equal(response.status, "OK", "Place details request response status is OK");
                         console.log(response.result);
                         console.log(response.result.name.slice(9).toUpperCase());
                         callback(response.result.opening_hours.open_now,response.result.name.slice(9).toUpperCase());
             });
    
        });
};
 exports.logToSpark = function (message){
    console.log('call Spark Log');
    var textmessage = message;
    ciscospark.messages.create({
    roomId: config.sparkRoomId,
    text: textmessage
})
    
};
function utilsLogtoSpark(message){
    console.log('call Spark Log');
    var textmessage = JSON.stringify(message, null,2);
    ciscospark.messages.create({
    roomId: config.sparkRoomId,
    text: textmessage
})
    
};


