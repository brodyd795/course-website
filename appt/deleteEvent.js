const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
const moment = require("moment");

const doAll = (id, callback) => {
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];
  const TOKEN_PATH = "/usr/share/nginx/html/120/appt/token.json";

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

  fs.readFile("/usr/share/nginx/html/120/appt/credentials.json", (err, content) => {
    if (err) return console.log("Error loading client secret file:", err);
    authorize(JSON.parse(content), deleteEvent);
  });

  const deleteEvent = auth => {
    const gCalendar = google.calendar({ version: "v3", auth });
    gCalendar.events.delete(
      {
        auth: auth,
        calendarId: "courses.dingel@gmail.com",
        sendUpdates: "all",
        eventId: id
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        console.log("Event deleted: %s");
        console.log(res);
        callback("successful delete!!");
      }
    );
  };

}

exports.doAll = doAll;

