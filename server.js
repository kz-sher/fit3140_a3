var http=require('http')
            , admin = require("firebase-admin")
            , fs = require('fs')
            , path =require('path')
            , express = require('express')
            , app = express()
            , MotionList = require('./public/helper.js')
            , socket=require('socket.io'); //adding the socket in order for client and server emit and receive observations

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
                        credential : admin.credential.cert(serviceAccount),
                        databaseURL: "https://fit3140-assignment3-171e7.firebaseio.com"  // IMPORTANT: repalce the url with yours
                    });

// Join path from server to public folder:
app.use(express.static(path.join(__dirname, 'public')));

// Creating the server:
var server=http.createServer(app).listen(1997, function() {
    console.log("Listening at: http://localhost:1997")
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db  = admin.database();
var ref;

//GET DATA FROM SENSOR
var MotionDecider= new MotionList(); //create new object to use MotionList class
var isInitialDataLoaded = false;
var b = require('bonescript');
b.pinMode(led,'out');
b.pinMode('P8_19',b.INPUT);

var sensorInterval;
setTimeout(function(){ sensorInterval = setInterval(checkPIR,1000);}, 3000) // PIR motion sensor will check for movement every second, the initial will delay for around 3 seconds, this is due to latency issues
var sensor_bool = true;
var startTime;
var t1 = 1000;
var t2 = 10000;

create_channel();
// A channel will be created. Channel referred to is channel 1. It's children will store the number of Long Motions, Short Motions and Visitors
// dummyData acts as a test data for
function create_channel(){
    ref = db.ref("1"); //LISTEN TO FIREBASE current channel
    ref.off("value");

    // For every new object...
    ref.limitToLast(1).on("value", function (snapshot) {       //this callback will be invoked with each new object
        if(snapshot.val() != null && isInitialDataLoaded == false){
                MotionDecider=new MotionList();
                isInitialDataLoaded=true;
        }

        console.log(snapshot.val());            // How to retrive the new added object
    }, function (errorObject) {                 // if error
        console.log("The read failed: " + errorObject.code);
    });

    ref.limitToLast(1).on("value", function (snapshot) {       //this callback will be invoked with each new object
        if(snapshot.val().timeStamp>t2){
            ref.remove();
            create_channel();
	        MotionDecider.reset();
        }
    }, function (errorObject) {                 // if error
        console.log("The read failed: " + errorObject.code);
    });

    ref.push({
   	 dummyData: "Load Data Use"
    })
}

// This starts the motion sensor at the pin P8_19
function checkPIR(){
    //the function where my motion sensor will work to detect any movements whatsoever, supposedly timer is set at 1 second per interval
    b.digitalRead('P8_19',checkforMotion);}

// This motion sensor will first detect for any motion
// Motion sensor will emit two types of signals, HI and LO. It will add the respective signal into the class function
// The class function will decide does it fulfill LSLL
function checkforMotion(x){
    if(x.value===0){
        // motion emits HI 
        MotionDecider.add('H');
        console.log('Motion Detected');
    }
    else{
        // motion emits LO
        MotionDecider.add('L');
        console.log('No Motion Detected');
        // Push stamp, motion start time, motion end time
        if(MotionDecider.serverGetsMotion() == true){
            dataPush(MotionDecider.getTimeStamp(), MotionDecider.getStartTime(), MotionDecider.getEndTime());
        }
	}
}

// This stores the data on the Google Firebase.
// Use .update instead of .push to enable data being continuosly updated.
// For Assignment 3, I will update:
// 1.1 Timestamp
// 1.2 Motion Start Time
// 1.3 Motion End Time
function dataPush(timestamp,startTime,endTime){
    ref.push({
        timeStamp : timestamp,
        motionStartTime : startTime,
        motionEndTime: endTime
    });
}
