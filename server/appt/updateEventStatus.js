const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
const moment = require("moment");

const doAll = (callback) => {
	const SCOPES = ["https://www.googleapis.com/auth/calendar"];
	const TOKEN_PATH = "/home/brody/course-website/prod/server/appt/token.json";

	var timeMin = new Date();
	var timeMax = new Date(timeMin);
	timeMin.setMinutes(timeMin.getMinutes() - 15);
	timeMax.setDate(timeMin.getDate() + 14);

	const authorize = (credentials, callback) => {
		const { client_secret, client_id, redirect_uris } = credentials.installed;
		const oAuth2Client = new google.auth.OAuth2(
			client_id,
			client_secret,
			redirect_uris[0]
		);

		fs.readFile(TOKEN_PATH, (err, token) => {
			if (err) return getAccessToken(oAuth2Client, callback);
			oAuth2Client.setCredentials(JSON.parse(token));
			callback(oAuth2Client);
		});
	};

	const getAccessToken = (oAuth2Client, callback) => {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: "offline",
			scope: SCOPES,
		});
		console.log("Authorize this app by visiting this url:", authUrl);
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question("Enter the code from that page here: ", (code) => {
			rl.close();
			oAuth2Client.getToken(code, (err, token) => {
				if (err) return console.error("Error retrieving access token", err);
				oAuth2Client.setCredentials(token);
				fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
					if (err) return console.error(err);
					console.log("Token stored to", TOKEN_PATH);
				});
				callback(oAuth2Client);
			});
		});
	};

	fs.readFile(
		"/home/brody/course-website/prod/server/appt/credentials.json",
		(err, content) => {
			if (err) return console.log("Error loading client secret file:", err);
			fs.appendFileSync(
				"/home/brody/course-website/prod/server/appt/debugging.txt",
				"\nI've read credentials.json"
			);
			authorize(JSON.parse(content), updateEventStatus);
		}
	);

	const updateEventStatus = (auth) => {
		const calendar = google.calendar({ version: "v3", auth });
		calendar.events.list(
			{
				calendarId: "courses.dingel@gmail.com",
				timeMin: timeMin,
				timeMax: timeMax,
			},
			(err, res) => {
				if (err) return console.log("The API returned an error: " + err);
				const events = res.data.items;
				if (events.length) {
					for (event of events) {
						for (attendee of event.attendees) {
							if (attendee.email === "btdingel@iastate.edu") {
								var instructorResponseStatus = attendee.responseStatus;
							} else {
								var studentEmail = attendee.email;
								var studentResponseStatus = attendee.responseStatus;
							}
						}
						var deleteData = {
							instructorResponseStatus: instructorResponseStatus,
							studentResponseStatus: studentResponseStatus,
							id: event.id,
							timeMin: timeMin,
							startTime: event.start.dateTime,
							studentEmail: studentEmail,
						};
						callback(deleteData);
					}
				} else {
					console.log("No upcoming events found.");
					callback("no events to check");
				}
			}
		);
	};
};

exports.doAll = doAll;
