const fs = require('fs');

var dotenv = require('dotenv');
dotenv.config({path:'/usr/share/nginx/html/120/.env'});
var nodemailer = require('nodemailer');

const updateEventStatus = require("/usr/share/nginx/html/120/appt/updateEventStatus");
const deleteEvent = require("/usr/share/nginx/html/120/appt/deleteEvent");

checkRosters = userEmail => {
  var roster101 = fs.readFileSync("/usr/share/nginx/html/120/roster101.txt", "utf-8").split("\n");
  var roster120 = fs.readFileSync("/usr/share/nginx/html/120/roster120.txt", "utf-8").split("\n");

  if (roster101.includes(userEmail)) {
    return "for SPAN 101";
  } else if (roster120.includes(userEmail)) {
    return "for LING 120";
  } else {
    return "with Brody Dingel";
  }
};

function sendEmail(studentEmail, subject, text, course) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASS
    }
  });

  var mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: studentEmail,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      pass
    } else {
      pass
    }
  });
}

function doCallBack(success) {
  var {
    instructorResponseStatus,
    studentResponseStatus,
    id,
    timeMin,
    startTime,
    studentEmail
  } = success;
  var course = checkRosters(studentEmail);
  var subject = `Appt ${course}`;

  if (studentResponseStatus === "declined") {
    deleteEvent.doAll(id, afterSuccess => {
      console.log('Successful delete');      
    });
  } else if (
    (instructorResponseStatus === "needsAction" ||
      instructorResponseStatus === "tentative") &&
    timeMin.getTime() > new Date(startTime).getTime()
  ) {
    deleteEvent.doAll(id, afterSuccess => {
      console.log('Successful delete');    
    });
    var text = `Dear student,\n\nYour appointment ${course} has been cancelled because your instructor was unable to respond to your request on time. If you would still like an appointment, please visit https://brody.linguatorium.com/courses/appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
    sendEmail(studentEmail, subject, text, course);
  } else if (instructorResponseStatus === "declined") {
    deleteEvent.doAll(id, afterSuccess => {
      console.log('Successful delete');    
      var text = `Dear student,\n\nYour appointment ${course} has been cancelled because your instructor was unable to accommodate your requested appointment time. If you would still like an appointment, please visit https://brody.linguatorium.com/courses/appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
      sendEmail(studentEmail, subject, text, course);
    });
  } else if (instructorResponseStatus === "accepted") {
    var acceptedAppts = fs.readFileSync("/usr/share/nginx/html/120/appt/acceptedAppts.txt", "utf-8").split("\n");
    if (!acceptedAppts.includes(id)) {
      var text = `Dear student,\n\nYour appointment ${course} has been approved. Please see your email for the details of the appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
      sendEmail(studentEmail, subject, text, course);
      fs.appendFileSync("/usr/share/nginx/html/120/appt/acceptedAppts.txt", `\n${id}`);
    } 
  } else {
  }

}

updateEventStatus.doAll(doCallBack);

