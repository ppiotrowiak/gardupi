"use strict";


/**
 *
 * Gardupi demo
 *
 * Author: Przemyslaw Piotrowiak
 *
 */

console.log("Starting gardupi");

var ledPinL = 13;
var moistureValue;
var ledOn = true;
var moistSensorPower = 2;
var moistSensorOn = false;
var pumpMotor = 3;
// Connecting to the Arduino
var firmata =  require('/opt/node/lib/node_modules/firmata');
var board = new firmata.Board('/dev/ttyUSB0',function(err){
	//in case of error connecting to arduino
	if (err){
		console.log(err);
		return;
	}
	console.log("connected");

	console.log("Firmware: " + board.firmware.name + "-" + board.firmware.version.major + "." + board.firmware.version.minor);

	/*
	*	Setting up pins
	*/
		
	board.pinMode(ledPinL, board.MODES.OUTPUT);
	board.pinMode(12, board.MODES.OUTPUT);
	board.pinMode(pumpMotor, board.MODES.OUTPUT);
	board.pinMode(moistSensorPower, board.MODES.OUTPUT);
	/*
	*	Analog read
	*/
	// Moisture
	board.analogRead(0, function(val){
		moistureValue = val;
	});

   
	setInterval(function() {

	if (ledOn) {
		console.log("+");
		board.digitalWrite(ledPinL, board.HIGH);
	} else {
		console.log("-");
		board.digitalWrite(ledPinL, board.LOW);
	}
	
	
	ledOn = !ledOn;
	// Reading moisture value
	// At the beginning of iteration Turn on sensors
	board.digitalWrite(moistSensorPower, board.HIGH);
	// Pump relay HIGH == OFF, LOW==ON
	board.digitalWrite(pumpMotor, board.HIGH);
	// After a period of time take reading and turn off sensors
	setTimeout(function() {

		console.log("Moisture value(1): " + moistureValue);

	
		if (moistureValue > 900)
		{
			board.digitalWrite(12, board.HIGH);
		}
		else
		{
			board.digitalWrite(12, board.LOW);
		}
	
		board.digitalWrite(moistSensorPower, board.LOW);
		console.log("Moisture value(2): " + moistureValue);
		
		// Watering now
		if (moistureValue > 600)
		{
			board.digitalWrite(pumpMotor, board.LOW);
		}
		else
		{
			board.digitalWrite(pumpMotor, board.HIGH);
		}
	}, 2000);
	
		

	}, 5000);
	     
});

