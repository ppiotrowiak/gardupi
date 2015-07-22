"use strict";


/**
 *
 * Gardupi demo
 *
 * Author: Przemyslaw Piotrowiak
 *
 */

console.log("Starting gardupi");

// Constants
var ledPinL = 13;
// setting up default moisture so it is available for the http server
var moistureValue;
var ledOn = true;
// analog pin for moisture sensor
var moistSensorPin = 0;
// digital pin for moisture sensor power
var moistSensorPower = 5;
var moistSensorOn = true;
// pin for pump
var pumpMotor = 2;
// pump turn on for milliseconds
var pumpTimer = 1000;
var moistureThreshold = 600;
// delay between beginning of readings in milliseconds
var intervalDelay = 10000;

var ipAddress = "192.168.1.16";

// Setting up webserver
var app = require('http').createServer(handler),
    // Setting socket.io to listen to webserver
    io = require('/opt/node/lib/node_modules/socket.io').listen(app), 
    // We need filesystem to load index.html file		
    fs = require('fs'),
    firmata = require('/opt/node/lib/node_modules/firmata'),

    // Connecting to the Arduino
    board = new firmata.Board('/dev/ttyUSB0', arduinoReady);
    

// directs page requests to html files
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
 
    res.writeHead(200);
    res.end(data);
  });
}

// Function to test Arduino connection and launch watering program
function arduinoReady(err) {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Firmware: ' + board.firmware.name 
      + '-' + board.firmware.version.major 
      + '.' + board.firmware.version.minor);
	/*
	*	Setting up pins
	*/
		
	board.pinMode(ledPinL, board.MODES.OUTPUT);
	board.pinMode(12, board.MODES.OUTPUT);
	board.pinMode(pumpMotor, board.MODES.OUTPUT);
	board.pinMode(moistSensorPower, board.MODES.OUTPUT);
    
    	// Setting up relay pins off(HIGH)
	board.digitalWrite(3, board.HIGH);
	board.digitalWrite(4, board.HIGH);
	board.digitalWrite(moistSensorPower, board.HIGH);
	board.digitalWrite(pumpMotor, board.HIGH);
    
	// Run watering module
	watering();
}



// LCD display
var lcd = require('./ipAddress');
lcd.ipAddress();

// Listening to http requests 
app.listen(8080, ipAddress);
console.log("Listening on http:" + ipAddress + ":8080");


function watering() {
	/*
	*	Analog read
	*/
	// Moisture
	board.analogRead(moistSensorPin, function(val){
		moistureValue = val;
	});

	// main function checking the state of soil periodically   
	setInterval(function() {


	// Reading moisture value
	// At the beginning of iteration Turn on sensors
	board.digitalWrite(moistSensorPower, board.LOW);
	// Pump relay HIGH == , LOW==
	board.digitalWrite(pumpMotor, board.HIGH);
	// After a period of time take reading and turn off sensors
	setTimeout(function() {

		console.log("Moisture value: " + moistureValue);

	

		
		// Watering if dried that required value
		if (moistureValue > moistureThreshold)
		{
			board.digitalWrite(pumpMotor, board.LOW);
			setTimeout(function() {
			
				board.digitalWrite(pumpMotor, board.HIGH);
			}, 1000);
		}
		else
		{
			board.digitalWrite(pumpMotor, board.HIGH);
		}
		
		// turn off moisture sensor
		board.digitalWrite(moistSensorPower, board.HIGH);
	}, 1000);
	

	}, intervalDelay);
}	     


