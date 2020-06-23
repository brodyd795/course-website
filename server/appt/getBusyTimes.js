const fs = require("fs");
const { google } = require("googleapis");
const readline = require("readline");
const moment = require("moment");

const doAll = callback => {
  const SCOPES = ["https://www.googleapis.com/auth/calendar"];

  const TOKEN_PATH = "./appt/token.json";

  var today = new Date();
  var lastDay = new Date(today);
  lastDay.setDate(today.getDate() + 14);
  var availableSlots = {};

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
    authorize(JSON.parse(content), getFreeBusy);
  });

  const getFreeBusy = auth => {
    const gCalendar = google.calendar({ version: "v3", auth });
    gCalendar.freebusy.query(
      {
        auth: auth,
        resource: {
          timeMin: today,
          timeMax: lastDay,
          items: [
            { id: "brodydingel795@gmail.com" },
            { id: "btdingel@iastate.edu" }
          ]
        }
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);

        var busyTimes = [];

        var calendars = res["data"]["calendars"];
        for (calendar in calendars) {
          var busyFrames = calendars[calendar]["busy"];
          for (busyFrame of busyFrames) {
            busyTimes.push({
              start: new Date(busyFrame["start"]),
              end: new Date(busyFrame["end"])
            });
          }
        }

        for (var i = new Date(today); i < lastDay; i.setDate(i.getDate() + 1)) {
          let centralHrs = i.getHours() - 6;
          i.setHours(centralHrs);
          availableSlots[i.toISOString().substring(0, 10)] = getTimeSlotsForDay(
            i,
            busyTimes
          );
        }
        callback(availableSlots);
      }
    );
  };

  const getTimeSlotsForDay = (date, busyTimes) => {
    var timeSlots = [];
    var dayStart = new Date(date);
    var dayEnd = new Date(date);

    switch (date.getDay()) {
      case 0:
        return timeSlots;
      case 6:
        return timeSlots;
      default:
        dayStart.setHours(08, 0, 0, 0);
        dayEnd.setHours(17, 0, 0, 0);
    }
    do {
      if (
        !checkGoogleCalendarConflict(dayStart, busyTimes) &&
        moment(new Date(dayStart)).isAfter(new Date())
      ) {
        timeSlots.push(new Date(dayStart));
      }
      dayStart.setHours(dayStart.getHours(), dayStart.getMinutes() + 30);
    } while (dayStart < dayEnd);

    return timeSlots;
  };

  const checkGoogleCalendarConflict = (date, busyTimes) => {
    var hasConflict = false;
    var proposedDateStart = date;
    var proposedDateEnd = moment(date)
      .add(30, "m")
      .toDate();

    for (let busyTime of busyTimes) {
      if (
        (moment(proposedDateStart).isAfter(busyTime["start"]) &&
          moment(proposedDateStart).isBefore(busyTime["end"])) ||
        (moment(proposedDateEnd).isAfter(busyTime["start"]) &&
          moment(proposedDateEnd).isBefore(busyTime["end"])) ||
        moment(proposedDateStart).isSame(busyTime["start"]) ||
        moment(proposedDateEnd).isSame(busyTime["end"])
      ) {
        hasConflict = true;
      }
    }
    return hasConflict;
  };

  const createEvent = auth => {
    const gCalendar = google.calendar({ version: "v3", auth });
    gCalendar.events.insert(
      {
        auth: auth,
        calendarId: "courses.dingel@gmail.com",
        sendUpdates: "all",
        resource: {
          summary: "First Event Creation",
          location: "Home",
          description:
            "Check out my first event creation through Google Calendar API!",
          start: {
            dateTime: "2020-01-03T21:00:00-06:00",
            timeZone: "America/Chicago"
          },
          attendees: [
            { email: "btdingel@iastate.edu" },
            { email: "brodydingel795@gmail.com" }
          ],
          end: {
            dateTime: "2020-01-03T21:30:00-06:00",
            timeZone: "America/Chicago"
          }
        }
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        console.log("Event created: %s");
        console.log(res);
      }
    );
  };

  const listEvents = auth => {
    const calendar = google.calendar({ version: "v3", auth });
    calendar.events.list(
      {
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime"
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const events = res.data.items;
        if (events.length) {
          console.log("Upcoming 10 events:");
          events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
          });
        } else {
          console.log("No upcoming events found.");
        }
      }
    );
  };
};

exports.doAll = doAll;

