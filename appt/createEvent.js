const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
const moment = require("moment");

const createEvent = (guest, course, startTime, endTime, reason, callback) => {
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];

  const TOKEN_PATH = "./appt/token.json";

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
      scope: SCOPES
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("Enter the code from that page here: ", code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err);
        oAuth2Client.setCredentials(token);
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) return console.error(err);
          console.log("Token stored to", TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  };

  fs.readFile("./appt/credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    authorize(JSON.parse(content), createEvent);
  });

  const createEvent = auth => {
    const gCalendar = google.calendar({ version: "v3", auth });
    gCalendar.events.insert(
      {
        auth: auth,
        calendarId: "courses.dingel@gmail.com",
        sendUpdates: "all",
        resource: {
          summary: `Appt with ${guest}`,
          location: "2140 Pearson Hall",
          description: `Meeting with ${guest} for ${course}\nReason: ${reason}`,
          start: {
            dateTime: startTime,
            timeZone: "America/Chicago"
          },
          attendees: [{ email: "btdingel@iastate.edu" }, { email: guest }],
          end: {
            dateTime: endTime,
            timeZone: "America/Chicago"
          }
        }
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        console.log("Event created: %s");
        console.log(res);
        callback("success!!");
      }
    );
  };
};

exports.createEvent = createEvent;

