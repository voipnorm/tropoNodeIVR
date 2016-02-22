//Do not use "use strict" as it breaks outbound texting to tropo
//CISCOSPARK_ACCESS_TOKEN=<your Cisco Spark Token here> node ./server.js
var http = require('http');
var path = require('path');
var util= require('util');
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var utils= require('./utils/utils');
var request= require('request');
var config = require("./config/config");
//

var router = express();
var server = http.createServer(router);
var tropowebapi = require('tropo-webapi');

router.use(express.static(path.resolve(__dirname, 'client')));

router.use(express.bodyParser());
router.use(express.cookieParser());
router.use(express.session({secret:'troposecretkeyAPI'}));



router.post('/', function(req, res){

  	// Create a new instance of the TropoWebAPI object.
	var tropo = new TropoWebAPI();
	 

  if (req.body.session.parameters) {
    parameters = req.body.session.parameters
    //to, answerOnMedia, channel, from, headers, name, network, recording, required, timeout, allowSignals, machineDetection
    tropo.call(parameters.remoteDID, null, null, null, null, null, "SMS", null, null, null, null, null);
    tropo.say(parameters.message);
    
    res.send(tropowebapi.TropoJSON(tropo));
  }else{
	 var callerID=req.body['session']['from']['id'];
	 req.session.callerID=callerID;
	 console.log(callerID);
	// Use the say method https://www.tropo.com/docs/webapi/say.htm
	tropo.say("Welcome to " + config.customerName);
	tropo.wait(1000);
	// Use the on method https://www.tropo.com/docs/webapi/on.htm
	 var say = new Say("Please enter your 5 digit zip code");
	 var choices = new Choices("[5 DIGITS]");
	 	// (choices, attempts, bargein, minConfidence, name, recognizer, required, say, timeout, voice);
	 tropo.ask(choices, null, null, null, "digit", null, null, say, 60, null);
	tropo.on("continue", null, "/response", true);
	res.send(TropoJSON(tropo));
  }
});

router.post('/response', function(req, res){
	var tropo = new TropoWebAPI();
	console.log("incoming request for response");
	var answer = req.body['result']['actions']['value'];
		tropo.say("You said " + answer);
		console.log(answer);
		var city;
		var storeOperation;
		utils.cityLookup(answer,function(data){
				if(data==='00000'){
								utils.logToSpark("An invalid zip code was entered "+answer);
								console.log("we have all 00000");
								tropo.say("I didn't catch that");
								tropo.wait(1500);
								var say = new Say("Can you please repeat your zip code");
	 							var choices = new Choices("[5 DIGITS]");
	 							// (choices, attempts, bargein, minConfidence, name, recognizer, required, say, timeout, voice);
								tropo.ask(choices, null, null, null, "digit", null, null, say, 60, null);
								tropo.on("continue", null, "/response", true);
								res.send(TropoJSON(tropo));
				
						}else{
					console.log(data.city);
					city = data.city;
		
			
					utils.googlePetSmartStoreHours(answer, function(hours,storeName){
							if (city.slice(0,4)===storeName.slice(0,4)){
									console.log(hours);
									if(hours===true){
												storeOperation="open";
												console.log(storeOperation);
												tropo.wait(1000);
												tropo.say("Welcome to the "+config.customerName+" "+city);
												tropo.wait(1000);
												tropo.say("Our "+city+" store is currently "+storeOperation);
												tropo.on("continue", null, "/storeMenu", true);
												res.send(TropoJSON(tropo));
								}else {
												storeOperation= "closed";
												tropo.say("Our "+city+" store is currently "+storeOperation+", please stay on the line to speak to an operator");
												tropo.on("continue", null, "/transferOperator", true);
												res.send(TropoJSON(tropo));
							}
	
					}else{
						tropo.wait(1000);
						tropo.say("There is no "+config.customerName+" store in "+city+" area");
						tropo.wait(2000);
						var say = new Say("Please enter your zip code to have the nearset store address sent to you via text message. Or stay on the line to speak to an operator");
				 		var choices = new Choices("[5 DIGITS]");
				 		tropo.ask(choices, null, null, null, "digit", null, null, say, 10, null);
						tropo.on("continue", null, "/storeSearch", true);
						res.send(TropoJSON(tropo));
				}
				})
		}})
		
});

router.post('/storeSearch', function(req, res){
	console.log("storeSearch launched");
	 //console.log(req);
	var tropo = new TropoWebAPI();
	var answer = req.body['result']['actions']['value'];
	if(!answer){
		 tropo.on("continue", null, "/transferOperator", true);
  	res.send(TropoJSON(tropo));
	}else{
	tropo.say("You said " + answer);

	 var to="1"+req.session.callerID;
	 console.log(to);
	console.log(answer);
	
		utils.googlePetSmartSearch(answer, function(data){
			  var parameters = {remoteDID: to,
                    snrDID: null,
                    message: data,
                    token: config.tropoDevToken
			  	}

  		var options = {
      							uri: 'https://api.tropo.com/1.0/sessions',
      							method: 'POST',
      							json: parameters
    							 }
  	request(options, function (error, response, body) {
      	if (!error && response.statusCode == 200) {
        		utils.logToSpark("SMS message sent to" +to);;
      }
      	else {
        	utils.logToSpark('Error sending SMS to '+to)
        	console.log(error);
      }
  });
  tropo.on("continue", null, "/transferOperator", true);
  res.send(TropoJSON(tropo));
		
});
}
});

router.post('/storeMenu', function(req, res){
	// Create a new instance of the TropoWebAPI object.
	var tropo = new TropoWebAPI();
	tropo.say("Please select from one of the following options");
	tropo.wait(1000);
	var say = new Say( "Press one for "+config.ivrOptionOne+", press two for "+config.ivrOptionTwo+", press three for "+config.ivrOptionThree+", press four for "+config.ivrOptionFour+", press seven for "+config.ivrOptionSeven+", or press zero for "+config.ivrOptionZero);
	var choices = new Choices("0,1,2,3,4,7");
	tropo.ask(choices, null, null, null, "digit", null, null, say, 60, null);
	tropo.on("continue", null, "/menuSelection", true);
	res.send(TropoJSON(tropo));
});

router.post('/menuSelection', function(req, res){
var tropo = new TropoWebAPI();
	//console.log(req);
	var answer = req.body['result']['actions']['value'];
	console.log(answer);
	tropo.say("You said " + answer);
	if (answer==='1'){
		tropo.wait(1000);
		tropo.say("Our Store hours are, from nine a m to nine p m Monday to Saturday, and 10 a m to 6 p m on Sunday. If you would like to hear the menu again please stay on the line.");
		tropo.wait(1500);
		tropo.on("continue", null, "/storeMenu", true);
		res.send(TropoJSON(tropo));
	}else{
	tropo.on("continue", null, "/transferOperator", true);
	res.send(TropoJSON(tropo));
	}
	
});

router.post('/transferOperator', function(req, res){
var tropo = new TropoWebAPI();
	tropo.wait(1000);
	tropo.say("Transfering you to an operator");
	tropo.transfer(config.transferNumber);
	res.end(TropoJSON(tropo));
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Tropo IVR server listening at", addr.address + ":" + addr.port);
});
