const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

var nodemailer = require("nodemailer");    

var admin = require("firebase-admin");


// Initialize the app
admin.initializeApp();

// Send email if each new object has a duration within 1 to 10 seconds
exports.function1= functions.database.ref("/1/{pushId}").onCreate( snapshot => {      
        const item = snapshot.val();

        if (item !== null){
            const duration = item.endtime - item.starttime;

            // 2.2.1
            if(duration>1000 && duration<10000){
                console.log("This is duration :" + (duration/1000) + "s");
                sendEmail("Timestamp: " + item.timestamp + "<br>" + "Start Time: " + item.starttime + "<br>" + "End Time: " + item.endtime);
            }
        }
    }
);

// Send email for the last 5 new objects
exports.function2= functions.database.ref("/1").onWrite( snapshot => {      
        var item = snapshot.before.val();
        
        if (!snapshot.before.exists()){
        	return null;
        }

        if (item !== null){
            var keys = Object.keys(item)   
           	var msg5 = ""
            var counter = 0
            
            for (var i = keys.length-5; i < keys.length ; i ++){
                var obj = keys[i]
                
                if (counter == 5) {
                	break
                }

                msg5 = msg5 + "Timestamp: " + item[obj].timestamp + "<br>" + "Start Time: " + item[obj].starttime + "<br>" + "End Time: " + item[obj].endtime + "<br><br>"
                counter++;
            }
            sendEmail(msg5);
        }
	}
);

// Clear the database if the duration of the new object is greater than 10 seconds
exports.function3= functions.database.ref("/1/{pushId}").onCreate( snapshot => {     
        var item = snapshot.val();

        if (item !== null){
            var duration = item.endtime - item.starttime;

            if(duration>10000){
                console.log("This is duration :" + (duration/1000) + "s");
                admin.database().ref("/1").remove();
                console.log("Database reset.")
            }
        }
	}
);

// Method for sending emails
function sendEmail(msg){
    // create reusable transport method (opens pool of SMTP connections) 
    var smtpTransport = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
            user: "fit3140.s12018.team02@gmail.com",
            pass: "nelsonkongzheng"
    }
    });
    
    // setup e-mail data with unicode symbols 
    var mailOptions = {
        from: "Underwater Squad ✔ <fit3140.s12018.team02@gmail.com>", // sender address 
        to: "fit3140.s12018.team02@gmail.com", // list of receivers 
        subject: "Motion Sensor Results", // Subject line 
        text: msg, // plaintext body 
        html: msg // html body 
    }
    
    // send mail with defined transport object 
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent successfully");
        }
    });
}