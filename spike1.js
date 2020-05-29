var nodemailer = require("nodemailer");     

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
                        credential : admin.credential.cert(serviceAccount),
                        databaseURL: "https://fit3140-assignment3-171e7.firebaseio.com"
                    });

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db  = admin.database();
var ref;
var t1 = 1000;      // 1 second
var t2 = 10000;     // 10 second

create_channel();

function create_channel(){
    ref = db.ref("1");
    ref.off("value"); // kill the previous observable
    // calling all functions to reset observables
    func1();
    func2();
    func3();
};

// Send email if each new object has a duration within 1 to 10 seconds
function func1(){
    ref.limitToLast(1).on("value", function (snapshot) {       
        var item = snapshot.val()

        if (item != null){
            var key = Object.keys(item)[0];
            var duration = item[key].endtime - item[key].starttime;

            // 2.2.1
            if(duration>t1 && duration<t2){
                console.log("This is duration :" + (duration/1000) + "s");
                sendEmail("Timestamp: " + item[key].timestamp + "<br>" + "Start Time: " + item[key].starttime + "<br>" + "End Time: " + item[key].endtime);
                console.log("Function 1 is called.");
            };
        }
    },  function (errorObject) {                 
        console.log("The read failed: " + errorObject.code);
    });
};

// Send email for the last 5 new objects
function func2(){
    ref.limitToLast(5).on("value", function (snapshot) {       
        var item = snapshot.val();

        if (item != null){
            var msg5 = "";
            // var counter=0;

            for (obj in item){
                var duration = item[obj].endtime - item[obj].starttime;
        
                msg5 = msg5 + "Timestamp: " + item[obj].timestamp + "<br>" + "Start Time: " + item[obj].starttime + "<br>" + "End Time: " + item[obj].endtime + "<br><br>"
            };
            sendEmail(msg5);
            console.log("Function 2 is called.");
        };
    }, function (errorObject) {                 
        console.log("The read failed: " + errorObject.code);
    });
}

// Clear the database if the duration of the new object is greater than 10 seconds
function func3(){
    ref.limitToLast(1).on("value", function (snapshot) {      
        var item = snapshot.val();

        if (item!=null){
            var key = Object.keys(item)[0];
            var duration = item[key].endtime - item[key].starttime;

            if(duration>t2){
                console.log("This is duration :" + (duration/1000) + "s");
                ref.remove();
                create_channel();
                console.log("Database reset.")
            };
        }; 
    }, function (errorObject) {                 
        console.log("The read failed: " + errorObject.code);
    });
};

// Method for sending emails
function sendEmail(msg){
    // Create reusable transport method (opens pool of SMTP connections) 
    var smtpTransport = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
            user: "fit3140.s12018.team02@gmail.com",
            pass: "kongzhengnelson"
    }
    });
    
    // Setup e-mail data with unicode symbols 
    var mailOptions = {
        from: "Underwater Squad ✔ <fit3140.s12018.team02@gmail.com>", // sender address 
        to: "fit3140.s12018.team02@gmail.com", // list of receivers 
        subject: "Motion Sensor Results", // Subject line 
        text: msg, // plaintext body 
        html: msg // html body 
    }
    
    // Send mail with defined transport object 
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent successfully");
        }
    });
}