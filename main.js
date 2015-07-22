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
var moistSensorPin = 0;
var moistSensorPower = 5;
var moistSensorOn = true;
var pumpMotor = 2;
// delay between beginning of readings in milliseconds
var intervalDelay = 10000;
// Connecting to the Arduino
var firmata =  require('/opt/node/lib/node_modules/firmata');
var board = new firmata.Board('/dev/ttyUSB0',function(err){
	//in case of error connecting to arduino
	if (err){
		console.log(err);
		return;
	}
	console.log("Arduino board connected!");

	console.log("Firmware: " + board.firmware.name + "-" + board.firmware.version.major + "." + board.firmware.version.minor);

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

	/*
	*	Analog read
	*/
	// Moisture
	board.analogRead(moistSensorPin, function(val){
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
	board.digitalWrite(moistSensorPower, board.LOW);
	// Pump relay HIGH == , LOW==
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
	
		
		console.log("Moisture value(2): " + moistureValue);
		
		// Watering now
		if (moistureValue > 600)
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
	     
});

