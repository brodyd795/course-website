const fs = require("fs");

var dotenv = require("dotenv");
dotenv.config({ path: "/home/brody/course-website/prod/server/.env" });
var nodemailer = require("nodemailer");

const updateEventStatus = require("/home/brody/course-website/prod/server/appt/updateEventStatus");
const deleteEvent = require("/home/brody/course-website/prod/server/appt/deleteEvent");

checkRosters = (userEmail) => {
	var roster101 = fs
		.readFileSync("/home/brody/course-website/prod/server/roster101.txt", "utf-8")
		.split("\n");
	var roster120 = fs
		.readFileSync("/home/brody/course-website/prod/server/roster120.txt", "utf-8")
		.split("\n");

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
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASS,
		},
	});

	var mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: studentEmail,
		subject: subject,
		text: text,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			pass;
		} else {
			pass;
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
		studentEmail,
	} = success;
	var course = checkRosters(studentEmail);
	var subject = `Appt ${course}`;

	if (studentResponseStatus === "declined") {
		deleteEvent.doAll(id, (afterSuccess) => {
			console.log("Successful delete");
		});
	} else if (
		(instructorResponseStatus === "needsAction" ||
			instructorResponseStatus === "tentative") &&
		timeMin.getTime() > new Date(startTime).getTime()
	) {
		deleteEvent.doAll(id, (afterSuccess) => {
			console.log("Successful delete");
		});
		var text = `Dear student,\n\nYour appointment ${course} has been cancelled because your instructor was unable to respond to your request on time. If you would still like an appointment, please visit https://courses.dingel.dev/appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
		sendEmail(studentEmail, subject, text, course);
	} else if (instructorResponseStatus === "declined") {
		deleteEvent.doAll(id, (afterSuccess) => {
			console.log("Successful delete");
			var text = `Dear student,\n\nYour appointment ${course} has been cancelled because your instructor was unable to accommodate your requested appointment time. If you would still like an appointment, please visit https://courses.dingel.dev/appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
			sendEmail(studentEmail, subject, text, course);
		});
	} else if (instructorResponseStatus === "accepted") {
		var acceptedAppts = fs
			.readFileSync(
				"/home/brody/course-website/prod/server/appt/acceptedAppts.txt",
				"utf-8"
			)
			.split("\n");
		if (!acceptedAppts.includes(id)) {
			var text = `Dear student,\n\nYour appointment ${course} has been approved. Please see your email for the details of the appointment.\n\nNOTE: this is an automated response to your request. Do NOT reply to this email.`;
			sendEmail(studentEmail, subject, text, course);
			fs.appendFileSync(
				"/home/brody/course-website/prod/server/appt/acceptedAppts.txt",
				`\n${id}`
			);
		}
	} else {
	}
}

updateEventStatus.doAll(doCallBack);
