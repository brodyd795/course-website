/*
 * This is where most of the brains of the app come in.
 * The assignments, grades, and blackbox page routes are all located here.
 * This script also calls the regex.js script that runs the regex checker.
 */

var express = require("express");
var secured = require("../lib/middleware/secured");
var router = express.Router();
var dotenv = require("dotenv");
var bodyParser = require("body-parser");
var regex = require("../regex.js");
var fs = require("fs");
var nodemailer = require("nodemailer");
var sqlite3 = require("sqlite3").verbose();
let db = new sqlite3.Database(
	"/home/brody/course-website/server/attendance.db"
);

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var score = { myscore: "" };
var util = require("util");
var readFile = util.promisify(fs.readFile);
var fetch = require("node-fetch");

// start cal work
//const { google } = require("googleapis");
//const readline = require("readline");
//const moment = require("moment");
const getBusyTimes = require("../appt/getBusyTimes.js");
const createEvent = require("../appt/createEvent.js");
// end cal work
dotenv.config();

checkRosters = (userEmail) => {
	var roster101 = fs.readFileSync("roster101.txt", "utf-8").split("\n");
	var roster120 = fs.readFileSync("roster120.txt", "utf-8").split("\n");

	if (roster101.includes(userEmail)) {
		return "Español 101";
	} else if (roster120.includes(userEmail)) {
		return "Linguistics 120";
	} else {
		return "SPAN 101 / LING 120";
	}
};

db.allAsync = function (sql) {
	var that = this;
	return new Promise(function (resolve, reject) {
		that.all(sql, function (err, rows) {
			if (err) reject(err);
			else resolve(rows);
		});
	});
};

/* GET assignments. */
router.get("/courses/assignments-old", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;
	res.render("assignments", {
		userProfile: JSON.stringify(userProfile, null, 2),
		title: "Assignments",
	});
});

router.get("/courses/assignments", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;
	const otherData = "otherData";

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	const userData = {
		userProfile: JSON.stringify(userProfile, null, 2),
		otherData: otherData,
	};

	res.render("assignments-react", {
		userData: userData,
		title: "Assignments",
		courseHeading: courseHeading,
		givenName: userProfile.name.givenName,
	});
});

router.post("/courses/regex-results", secured(), function (req, res, next) {
	var input = req.body["regexValue"];
	var input = input.trim();
	var task = req.body["assignmentValue"]["value"];
	var testData = regex.testRegex(input, task);
	score["myscore"] = testData["score"];
	var passFail = testData["passFail"];

	// get timestamp to record with answer and score
	var date = new Date();
	var date_pretty =
		date.getFullYear() +
		"-" +
		(date.getMonth() + 1) +
		"-" +
		date.getDate() +
		" " +
		date.getHours() +
		":" +
		date.getMinutes() +
		":" +
		date.getSeconds();

	// Get user email address
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	if (Date.now() > 1586235600000) {
		fs.appendFileSync("gotEm.txt", userEmail + "\n");
	}

	// Get user data
	var rawData = fs.readFileSync("user_data.json");
	var allUserData = JSON.parse(rawData);
	if (allUserData.hasOwnProperty(userEmail)) {
		// if user has posted data before or gone to Grades and is therefore in user_data.json
		var userData = allUserData[userEmail];
		var userPrevScore = userData[task]; // extract their previous score on this task
		var submissionType = task + "_submissions";

		// If better score, save it
		if (userPrevScore < parseInt(score["myscore"])) {
			allUserData[userEmail][task] = parseInt(score["myscore"]);
			userData = allUserData[userEmail]; // updating the variable, because its parent changed
			allUserData[userEmail]["average"] =
				(userData["haigyPaigy"] +
					userData["turkishPlurals"] +
					userData["corpusCleaning"] +
					userData["articleReplacement"]) /
				4;
			allUserData[userEmail][submissionType].push([
				input,
				score["myscore"],
				date_pretty,
			]); // pushing input to end of array so that I can save their answers in chronological order
			fs.writeFile(
				"user_data.json",
				JSON.stringify(allUserData, null, 2),
				function (err) {
					// write data to user_data.json
					if (err) return console.log(err);
				}
			);
		} else {
			// if user has never posted data before or gone to Grades (so doesn't exist in user_data.json)
			allUserData[userEmail][submissionType].push([
				input,
				score["myscore"],
				date_pretty,
			]);
			fs.writeFile(
				"user_data.json",
				JSON.stringify(allUserData, null, 2),
				function (err) {
					if (err) return console.log(err);
				}
			);
		}
	} else {
		allUserData[userEmail] = {
			// initialize new user's data
			haigyPaigy: 0,
			turkishPlurals: 0,
			corpusCleaning: 0,
			articleReplacement: 0,
			average: 0,
			haigyPaigy_submissions: [],
			turkishPlurals_submissions: [],
			corpusCleaning_submissions: [],
			articleReplacement_submissions: [],
		};

		// save score if > 0
		if (parseInt(score["myscore"]) > 0) {
			allUserData[userEmail][task] = parseInt(score["myscore"]);
			userData = allUserData[userEmail]; // updating the variable, because its parent changed
			allUserData[userEmail]["average"] =
				(userData["haigyPaigy"] +
					userData["turkishPlurals"] +
					userData["corpusCleaning"] +
					userData["articleReplacement"]) /
				4;
		}

		var submissionType = task + "_submissions";
		//var userSubmissions = allUserData[userEmail][submissionType];
		allUserData[userEmail][submissionType].push([
			input,
			score["myscore"],
			date_pretty,
		]);

		// Write new 0 scores to file
		fs.writeFile(
			"user_data.json",
			JSON.stringify(allUserData, null, 2),
			function (err) {
				if (err) return console.log(err);
			}
		);
	}

	var sendData = {
		score: score["myscore"],
		passFail: passFail,
		prevTask: task,
		prevCode: input,
	};

	//var input = req.body['regexValue'];
	//var data = {anotherItem: "another item", input: input, task: task, score: score['myscore'], userEmail: userEmail};
	res.send(sendData);
});

router.get("/courses/sandbox", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;
	const otherData = "otherData";

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	const userData = {
		userProfile: JSON.stringify(userProfile, null, 2),
		otherData: otherData,
	};

	res.render("sandbox-react", {
		userData: userData,
		title: "Sandbox",
		courseHeading: courseHeading,
		givenName: userProfile.name.givenName,
	});
});

router.get("/courses/blackbox", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;
	const otherData = "otherData";

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	const userData = {
		userProfile: JSON.stringify(userProfile, null, 2),
		otherData: otherData,
	};

	res.render("blackbox-react", {
		userData: userData,
		title: "Black Box",
		courseHeading: courseHeading,
		givenName: userProfile.name.givenName,
	});
});

router.post("/courses/blackbox", secured(), function (req, res, next) {
	var input = req.body["messageValue"];
	var course = req.body["courseHeading"];

	const { _raw, _json, ...userProfile } = req.user;
	const otherData = "otherData";

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	//var success = true;
	var transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASS,
		},
	});

	var mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: process.env.EMAIL_RECIPIENT,
		subject: "BlackBox – " + course,
		text: input,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			pass;
		} else {
			pass;
		}
	});

	//var sendData = { success: success };
	res.send();
});

router.get("/courses/attendance", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	(async function getAttendance(userEmail) {
		var course = await checkUsrInDB(userEmail);
		if (course !== false) {
			var records = await getUsrRecords(userEmail, course);
			res.render("attendance-react", {
				records: records,
				userProfile: JSON.stringify(userProfile, null, 2),
				title: "Attendance",
				courseHeading: courseHeading,
				givenName: userProfile.name.givenName,
			});
		} else {
			res.render("attendance-react", {
				records: false,
				userProfile: JSON.stringify(userProfile, null, 2),
				title: "Attendance",
				courseHeading: courseHeading,
				givenName: userProfile.name.givenName,
			});
		}
	})(userEmail);

	async function checkUsrInDB(userEmail) {
		var ling120RosterRaw = await db.allAsync("SELECT email FROM LING120");
		var ling120Roster = ling120RosterRaw.map((i) => {
			return i["email"];
		});

		var span101RosterRaw = await db.allAsync("SELECT email FROM SPAN101");
		var span101Roster = span101RosterRaw.map((i) => {
			return i["email"];
		});

		if (span101Roster.includes(userEmail)) {
			return "SPAN101";
		} else if (ling120Roster.includes(userEmail)) {
			return "LING120";
		} else {
			return false;
		}
	}

	async function getUsrRecords(userEmail, course) {
		var usrRecordsRaw = await db.allAsync(
			`SELECT * FROM ${course} WHERE email="${userEmail}"`
		);
		var usrRecordsRaw = usrRecordsRaw[0];
		let absencesList = [];
		let tardiesList = [];
		let keys = Object.keys(usrRecordsRaw);

		for (let key in keys) {
			if (usrRecordsRaw[keys[key]] == "A") {
				let newKey = keys[key].replace(/^(\w+?)_(\d{2})_\d{4}/, " $1 $2");
				absencesList.push(newKey);
			} else if (usrRecordsRaw[keys[key]] == "T") {
				let newKey = keys[key].replace(/^(\w+?)_(\d{2})_\d{4}/, " $1 $2");
				tardiesList.push(newKey);
			}
		}

		var absences = absencesList.length;
		var tardies = tardiesList.length;

		if (absencesList.length == 0) {
			absencesList.unshift("never absent");
		}
		if (tardiesList.length == 0) {
			tardiesList.unshift("never tardy");
		}
		let combined = absences + Math.floor(tardies / 3);

		if (course == "SPAN101") {
			var subtracted = combined > 4 ? (combined - 4) * 2 : 0;
		} else if (course == "LING120") {
			var subtracted = combined > 3 ? (combined - 3) * 3 : 0;
		}

		return {
			absences: absences,
			tardies: tardies,
			combined: combined,
			subtracted: subtracted,
			absencesList: absencesList,
			tardiesList: tardiesList,
		};
	}
});

router.get("/courses/attendance-master", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	if (userEmail !== "btdingel@iastate.edu") {
		res.render("error", { title: "Error" });
	} else {
		res.render("attendance-master-react", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Attendance Master",
			courseHeading: courseHeading,
			givenName: userProfile.name.givenName,
		});
	}
});

router.post(
	"/courses/attendance-master",
	secured(),
	urlencodedParser,
	function (req, res, next) {
		const { _raw, _json, ...userProfile } = req.user;

		var userInfo = userProfile;
		var userEmail = userInfo["emails"][0]["value"];

		var courseHeading = checkRosters(userEmail);

		if (userEmail !== "btdingel@iastate.edu") {
			res.render("error", { title: "Error", courseHeading: courseHeading });
		} else {
			var course = req.body["course"];
			var date = req.body["date"];

			(async function getAttendanceRecords() {
				var colsRaw = await db.allAsync(`PRAGMA table_info("${course}")`);
				var cols = colsRaw
					.filter((i) => {
						return /\w+_\d{2}_\d{4}/.test(i.name);
					})
					.map((i) => {
						return i.name;
					});
				if (!cols.includes(date)) {
					await db.allAsync(`ALTER TABLE ${course} ADD ${date} TEXT`);
					await db.allAsync(`UPDATE ${course} SET ${date}="OK"`);
				}
				var records = await db.allAsync(`SELECT name, ${date} FROM ${course}`);
				res.send({ course: course, date: date, records: records });
			})();
		}
	}
);

router.post(
	"/courses/attendance-master-update",
	secured(),
	urlencodedParser,
	function (req, res, next) {
		const { _raw, _json, ...userProfile } = req.user;

		var userInfo = userProfile;
		var userEmail = userInfo["emails"][0]["value"];

		var courseHeading = checkRosters(userEmail);

		if (userEmail !== "btdingel@iastate.edu") {
			res.render("error", { title: "Error", courseHeading: courseHeading });
		} else {
			var course = req.body["course"];
			var date = req.body["date"];
			var records = req.body["records"];

			(async function updateAttendanceRecords(course, date, records) {
				for (let record of records) {
					await db.allAsync(
						`UPDATE ${course} SET ${date}="${record[date]}" WHERE name="${record["name"]}"`
					);

					var results = await db.allAsync(
						`SELECT * FROM ${course} WHERE name="${record["name"]}"`
					);

					var student_email = results[0]["email"];
					//console.log(results);
					let absences = 0;
					let tardies = 0;
					for (let key in results[0]) {
						if (results[0][key] === "A") {
							absences++;
						} else if (results[0][key] === "T") {
							tardies++;
						}
					}
					let combined = absences + Math.floor(tardies / 3);

					if (
						results[0]["emailed"] === "no" &&
						((course === "SPAN101" && combined === 4) ||
							(course === "LING120" && combined === 3))
					) {
						var subject = "Your attendance in " + course;
						var text = `Dear ${record["name"]},\n\nThis is an automated message from your ${course} instructor regarding your attendance.\n\nYour record shows that you have ${combined} absences in ${course}. As a reminder, this is the maximum number of absences allowed before your final grade is impacted for each additional absence.\n\nYou may check your attendance record by visiting https://brody.linguatorium.com/courses/attendance. If you have any questions, please email your instructor immediately at btdingel@iastate.edu. (Do NOT respond by clicking "Reply".)`;
						var transporter = nodemailer.createTransport({
							service: "gmail",
							auth: {
								user: process.env.EMAIL_USERNAME,
								pass: process.env.EMAIL_PASS,
							},
						});

						var mailOptions = {
							from: process.env.EMAIL_USERNAME,
							to: student_email,
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
						await db.allAsync(
							`UPDATE ${course} SET emailed="yes" WHERE name="${record["name"]}"`
						);
					}
				}
			})(course, date, records);

			var updateStatus = true;
			res.send({
				course: course,
				date: date,
				records: records,
				updateStatus: updateStatus,
			});
		}
	}
);

router.get("/courses/grades", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	(async function getGrades(username) {
		try {
			var roster = await readFile("netIDs.txt", "utf8");
			Promise.all([scrapeUserData(username), getRegexGrades(username)]).then(
				(grades) => {
					res.render("grades-react", {
						userProfile: JSON.stringify(userProfile, null, 2),
						title: "Grades",
						courseHeading: courseHeading,
						givenName: userProfile.name.givenName,
						grades: grades,
					});
				}
			);
		} catch (err) {
			fs.appendFile("devlog.txt", err, function (err) {
				if (err) return console.log(err);
			});
		}
	})(userEmail);

	async function getRegexGrades(username) {
		try {
			var regexAllData = await readFile("user_data.json");
			var regexAllData = JSON.parse(regexAllData);
			if (!regexAllData.hasOwnProperty(username)) {
				regexAllData[username] = {
					haigyPaigy: 0,
					turkishPlurals: 0,
					corpusCleaning: 0,
					articleReplacement: 0,
					average: 0,
					haigyPaigy_submissions: [],
					turkishPlurals_submissions: [],
					corpusCleaning_submissions: [],
					articleReplacement_submissions: [],
				};
				fs.writeFile(
					"user_data.json",
					JSON.stringify(regexAllData, null, 2),
					function (err) {
						if (err) return console.log(err);
					}
				);
				return {
					haigyPaigy: 0,
					turkishPlurals: 0,
					corpusCleaning: 0,
					articleReplacement: 0,
					average: 0,
				};
			}
			var regexGrades = {
				haigyPaigyScore: regexAllData[username]["haigyPaigy"],
				turkishPluralsScore: regexAllData[username]["turkishPlurals"],
				corpusCleaningScore: regexAllData[username]["corpusCleaning"],
				articleReplacementScore: regexAllData[username]["articleReplacement"],
				averageScore: regexAllData[username]["average"],
			};
			return regexGrades;
		} catch (err) {
			fs.appendFile("devlog.txt", err, function (err) {
				if (err) return console.log(err);
			});
		}
	}

	async function scrapeUserData(username) {
		try {
			const fccChallenges = JSON.parse(
				await readFile("fcc-challenges.json", "utf8")
			);

			var fccUsername = username.replace(/\@\w+\.\w+/, "_ling120");

			let rawUserData = await fetch(
				`https://api.freecodecamp.org/api/users/get-public-profile?username=${fccUsername}`,
				{
					method: "GET",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36",
					},
				}
			);
			let userData = await rawUserData.json();

			if (userData.hasOwnProperty("entities")) {
				if (
					userData["entities"]["user"][fccUsername].hasOwnProperty(
						"completedChallenges"
					)
				) {
					let scores = calculate(
						fccChallenges,
						userData["entities"]["user"][fccUsername]["completedChallenges"]
					);
					return scores;
				} else {
					return "Not public";
				}
			} else {
				return "No fCC challenges completed yet.";
			}
		} catch (err) {
			return null;
		}
	}

	function calculate(fccChallenges, userData) {
		return new Promise((resolve, reject) => {
			let basicJSCount = (regexCount = debugCount = 0);

			for (let challenge of userData) {
				if (fccChallenges["basic-javascript"]["ids"].includes(challenge.id)) {
					basicJSCount++;
				} else if (
					fccChallenges["regular-expressions"]["ids"].includes(challenge.id)
				) {
					regexCount++;
				} else if (fccChallenges["debugging"]["ids"].includes(challenge.id)) {
					debugCount++;
				}
			}

			let scores = {
				basicJSCount: Math.round((basicJSCount / 110) * 100) / 100,
				regexCount: Math.round((regexCount / 33) * 100) / 100,
				debugCount: Math.round((debugCount / 12) * 100) / 100,
				totalCount:
					Math.round(((basicJSCount + regexCount + debugCount) / 155) * 100) /
					100,
			};
			resolve(scores);
		});
	}
});

router.post("/courses/assignments-old", secured(), urlencodedParser, function (
	req,
	res,
	next
) {
	var input = req.body["code"];
	var input = input.trim(); // in case the user had any newlines or spaces at the beginning or end of their input
	var task = req.body["task"];
	var testData = regex.testRegex(input, task); // send user input to regex tester in regex.js
	score["myscore"] = testData["score"];
	var passFail = testData["passFail"];

	// get timestamp to record with answer and score
	var date = new Date();
	var date_pretty =
		date.getFullYear() +
		"-" +
		(date.getMonth() + 1) +
		"-" +
		date.getDate() +
		" " +
		date.getHours() +
		":" +
		date.getMinutes() +
		":" +
		date.getSeconds();

	// Get user email address
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	// Get user data
	var rawData = fs.readFileSync("user_data.json");
	var allUserData = JSON.parse(rawData);
	if (allUserData.hasOwnProperty(userEmail)) {
		// if user has posted data before or gone to Grades and is therefore in user_data.json
		var userData = allUserData[userEmail];
		var userPrevScore = userData[task]; // extract their previous score on this task
		var submissionType = task + "_submissions";

		// If better score, save it
		if (userPrevScore < parseInt(score["myscore"])) {
			allUserData[userEmail][task] = parseInt(score["myscore"]);
			userData = allUserData[userEmail]; // updating the variable, because its parent changed
			allUserData[userEmail]["average"] =
				(userData["haigyPaigy"] +
					userData["turkishPlurals"] +
					userData["corpusCleaning"] +
					userData["articleReplacement"]) /
				4;
			allUserData[userEmail][submissionType].push([
				input,
				score["myscore"],
				date_pretty,
			]); // pushing input to end of array so that I can save their answers in chronological order
			fs.writeFile(
				"user_data.json",
				JSON.stringify(allUserData, null, 2),
				function (err) {
					// write data to user_data.json
					if (err) return console.log(err);
				}
			);
		} else {
			// if user has never posted data before or gone to Grades (so doesn't exist in user_data.json)
			allUserData[userEmail][submissionType].push([
				input,
				score["myscore"],
				date_pretty,
			]);
			fs.writeFile(
				"user_data.json",
				JSON.stringify(allUserData, null, 2),
				function (err) {
					if (err) return console.log(err);
				}
			);
		}
	} else {
		allUserData[userEmail] = {
			// initialize new user's data
			haigyPaigy: 0,
			turkishPlurals: 0,
			corpusCleaning: 0,
			articleReplacement: 0,
			average: 0,
			haigyPaigy_submissions: [],
			turkishPlurals_submissions: [],
			corpusCleaning_submissions: [],
			articleReplacement_submissions: [],
		};

		// save score if > 0
		if (parseInt(score["myscore"]) > 0) {
			allUserData[userEmail][task] = parseInt(score["myscore"]);
			userData = allUserData[userEmail]; // updating the variable, because its parent changed
			allUserData[userEmail]["average"] =
				(userData["haigyPaigy"] +
					userData["turkishPlurals"] +
					userData["corpusCleaning"] +
					userData["articleReplacement"]) /
				4;
		}

		var submissionType = task + "_submissions";
		//var userSubmissions = allUserData[userEmail][submissionType];
		allUserData[userEmail][submissionType].push([
			input,
			score["myscore"],
			date_pretty,
		]);

		// Write new 0 scores to file
		fs.writeFile(
			"user_data.json",
			JSON.stringify(allUserData, null, 2),
			function (err) {
				if (err) return console.log(err);
			}
		);
	}

	res.render("assignments", {
		score: score["myscore"],
		passFail: passFail,
		prevTask: task,
		prevCode: input,
	});
});

router.get("/courses/grades-old", secured(), function (req, res, next) {
	// Get user email
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	// Get user user data
	var rawData = fs.readFileSync("user_data.json");
	var allUserData = JSON.parse(rawData);

	// If user has scores
	if (allUserData.hasOwnProperty(userEmail)) {
		var userData = allUserData[userEmail];
		var haigyPaigyScore = userData["haigyPaigy"];
		var turkishPluralsScore = userData["turkishPlurals"];
		var corpusCleaningScore = userData["corpusCleaning"];
		var articleReplacementScore = userData["articleReplacement"];
		var averageScore = userData["average"];

		res.render("grades", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Grades",
			haigyPaigyScore: haigyPaigyScore,
			turkishPluralsScore: turkishPluralsScore,
			corpusCleaningScore: corpusCleaningScore,
			articleReplacementScore: articleReplacementScore,
			averageScore: averageScore,
		});
	} else {
		// Update their scores to 0 for all
		allUserData[userEmail] = {
			haigyPaigy: 0,
			turkishPlurals: 0,
			corpusCleaning: 0,
			articleReplacement: 0,
			average: 0,
			haigyPaigy_submissions: [],
			turkishPlurals_submissions: [],
			corpusCleaning_submissions: [],
			articleReplacement_submissions: [],
		};
		// Write new 0 scores to file
		fs.writeFile(
			"user_data.json",
			JSON.stringify(allUserData, null, 2),
			function (err) {
				if (err) return console.log(err);
			}
		);
		// Render grades with 0s
		res.render("grades", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Grades",
			haigyPaigyScore: 0,
			turkishPluralsScore: 0,
			corpusCleaningScore: 0,
			articleReplacementScore: 0,
			averageScore: 0,
		});
	}
});

router.get("/courses/blackbox-old", secured(), function (req, res, next) {
	res.render("blackbox");
});

router.post("/courses/blackbox-old", secured(), urlencodedParser, function (
	req,
	res,
	next
) {
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var input = req.body["emailText"];
	var courseSection = req.body["courseSection"];
	var subject = "BlackBox - " + courseSection;

	var course = courseSection.replace(/(\w+)-\w+/, "$1");

	let roster_sql = "SELECT email FROM " + course;
	db.all(roster_sql, (roster_err, roster_results) => {
		let email_list = [];
		let i;
		for (i in roster_results) {
			email_list.push(roster_results[i]["email"]);
		}
		let roster = email_list;
		if (email_list.includes(userEmail)) {
			var transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: process.env.EMAIL_USERNAME,
					pass: process.env.EMAIL_PASS,
				},
			});

			var mailOptions = {
				from: process.env.EMAIL_USERNAME,
				to: process.env.EMAIL_RECIPIENT,
				subject: subject,
				text: input,
			};

			transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					pass;
				} else {
					pass;
				}
			});

			res.render("blackbox", {
				title: "Blackbox",
				thankyou:
					"Thank you for your message. Your instructor will reply soon.",
			});
		} else {
			res.render("blackbox-err", {
				userProfile: JSON.stringify(userProfile, null, 2),
				title: "Blackbox",
			});
		}
	});
});

/* GET attendance. */
router.get("/courses/attendance-old", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	res.render("attendance", {
		userProfile: JSON.stringify(userProfile, null, 2),
		title: "Attendance",
	});
});

router.post("/courses/attendance-old", secured(), urlencodedParser, function (
	req,
	res,
	next
) {
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var course = req.body["course"];

	let roster_sql = "SELECT email FROM " + course;
	db.all(roster_sql, (roster_err, roster_results) => {
		let email_list = [];
		let i;
		for (i in roster_results) {
			email_list.push(roster_results[i]["email"]);
		}
		let roster = email_list;
		if (email_list.includes(userEmail)) {
			let absences =
				"SELECT * FROM " + course + ' WHERE email LIKE "%' + userEmail + '%"';
			db.all(absences, (err, results) => {
				//let absences = results[0]['absences'];
				//let tardies = results[0]['tardies'];
				//let combined = results[0]['combined'];
				//let subtracted = results[0]['subtracted'];

				let absencesList = [];
				let tardiesList = [];

				let keys = Object.keys(results[0]);
				let key;

				for (key in keys) {
					if (results[0][keys[key]] == "X") {
						let new_formatted_key = keys[key].replace(
							/^(\w+?)_(\d{2})_\d{4}/,
							" $1 $2"
						);
						absencesList.push(new_formatted_key);
					} else if (results[0][keys[key]] == "T") {
						let new_formatted_key = keys[key].replace(
							/^(\w+?)_(\d{2})_\d{4}/,
							" $1 $2"
						);
						tardiesList.push(new_formatted_key);
					}
				}

				let absences_count = absencesList.length;
				let tardies_count = tardiesList.length;

				if (absencesList.length == 0) {
					absencesList.unshift("never absent");
				}
				if (tardiesList.length == 0) {
					tardiesList.unshift("never tardy");
				}
				let combined_count = absences_count + Math.floor(tardies_count / 3);

				let subtracted_count;
				if (course == "SPAN101") {
					subtracted_count = combined_count > 4 ? (combined_count - 4) * 2 : 0;
				} else if (course == "LING120") {
					subtracted_count = combined_count > 3 ? (combined_count - 3) * 5 : 0;
				}

				res.render("attendance", {
					userProfile: JSON.stringify(userProfile, null, 2),
					title: "Attendance",
					absences: "Absences: " + absences_count + " - " + absencesList,
					tardies: "Tardies: " + tardies_count + " - " + tardiesList,
					combined: "Combined: " + combined_count,
					subtracted: "Subtracted: " + subtracted_count + "%",
				});
			});
		} else {
			res.render("attendance-err", {
				userProfile: JSON.stringify(userProfile, null, 2),
				title: "Attendance",
			});
		}
	});
});

router.get("/courses/attendance/master", secured(), urlencodedParser, function (
	req,
	res,
	next
) {
	const { _raw, _json, ...userProfile } = req.user;
	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var date = new Date();
	var date_formatted = date
		.toString()
		.replace(/^\w+? (\w+?) (\d+) (\d{4}).+$/, "$1_$2_$3");

	if (userEmail == "btdingel@iastate.edu") {
		res.render("attendance-master", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Attendance",
			date: date_formatted,
		});
	} else {
		res.render("attendance-master-err", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Attendance",
		});
	}
});

router.post(
	"/courses/attendance/master",
	secured(),
	urlencodedParser,
	function (req, res, next) {
		const { _raw, _json, ...userProfile } = req.user;
		var userInfo = userProfile;
		var userEmail = userInfo["emails"][0]["value"];

		var course = req.body["course"];

		if (userEmail == "btdingel@iastate.edu") {
			let sql_cols = 'PRAGMA table_info("' + course + '")';
			db.all(sql_cols, (err, results) => {
				let col_list = [];
				let i;
				for (i in results) {
					col_list.push(results[i]["name"]);
				}
				col_list.push("ok");
				let date = req.body["date"];
				let test;
				let sql_new_col;
				let sql_new_values;
				let sql_names_and_date;
				if (col_list.includes(date) != true) {
					sql_new_col = "ALTER TABLE " + course + " ADD " + date + " TEXT";
					db.run(sql_new_col, (err, results) => {
						sql_new_values = "UPDATE " + course + " SET " + date + '="OK"';
						db.run(sql_new_values, (err, results) => {
							sql_names_and_date = "SELECT name, " + date + " FROM " + course;
							db.all(sql_names_and_date, (err2, results2) => {
								res.render("attendance-master-results", {
									userProfile: JSON.stringify(userProfile, null, 2),
									title: "Attendance",
									date: date,
									roster: results2,
									num_students: results2.length,
									course: course,
								});
							});
						});
					});
				} else {
					sql_names_and_date = "SELECT name, " + date + " FROM " + course;
					db.all(sql_names_and_date, (err2, results2) => {
						res.render("attendance-master-results", {
							userProfile: JSON.stringify(userProfile, null, 2),
							title: "Attendance",
							date: date,
							roster: results2,
							num_students: results2.length,
							course: course,
						});
					});
				}
			});
		} else {
			render("attendance-master-err", {
				userProfile: JSON.stringify(userProfile, null, 2),
				title: "Attendance",
			});
		}
	}
);

router.post(
	"/courses/attendance/master/results",
	secured(),
	urlencodedParser,
	function (req, res, next) {
		const { _raw, _json, ...userProfile } = req.user;
		var userInfo = userProfile;
		var userEmail = userInfo["emails"][0]["value"];

		var num_students = req.body["num_students"];
		var num_type = parseInt(num_students);
		var date = req.body["date"];
		var course = req.body["course"];
		var testing = "";

		for (let counter = 0; counter < num_students; counter++) {
			let student_name = req.body["student_name_" + counter];
			let student_status = req.body["student_status_" + counter];

			let sql =
				"UPDATE " +
				course +
				" SET " +
				date +
				'="' +
				student_status +
				'" WHERE name="' +
				student_name +
				'"';
			db.all(sql, (err, results) => {
				let email_sql =
					"SELECT * FROM " + course + ' WHERE name="' + student_name + '"';
				db.all(email_sql, (email_err, email_results) => {
					let absences_count = 0;
					let tardies_count = 0;
					let combined_count = 0;

					let keys = Object.keys(email_results[0]);
					let key;

					let student_email = email_results[0]["email"];
					for (key in keys) {
						if (email_results[0][keys[key]] == "X") {
							absences_count++;
						} else if (email_results[0][keys[key]] == "T") {
							tardies_count++;
						}
					}
					combined_count = absences_count + Math.floor(tardies_count / 3);
					if (
						(course == "SPAN101" &&
							combined_count == 4 &&
							email_results[0]["emailed"] == "no") ||
						(course == "LING120" &&
							combined_count == 3 &&
							email_results[0]["emailed"] == "no")
					) {
						var subject = "Your attendance in " + course;
						var text =
							"Dear " +
							student_name +
							",\n\nThis is an automated message from your " +
							course +
							" instructor regarding your attendance.\n\nYour record shows that you have " +
							combined_count +
							" absences in " +
							course +
							'. As a reminder, this is the maximum number of absences allowed before your final grade is impacted for each additional absence.\n\nYou may check your attendance record by visiting http://brody.linguatorium.com/courses/attendance. If you have any questions, please email your instructor immediately at btdingel@iastate.edu. (Do NOT respond by clicking "Reply".)';
						var transporter = nodemailer.createTransport({
							service: "gmail",
							auth: {
								user: process.env.EMAIL_USERNAME,
								pass: process.env.EMAIL_PASS,
							},
						});

						var mailOptions = {
							from: process.env.EMAIL_USERNAME,
							to: student_email,
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
						let sql_change_emailed =
							"UPDATE " +
							course +
							' SET emailed="yes" WHERE name="' +
							student_name +
							'"';
						db.run(sql_change_emailed, (err, results) => {});
					}
				});
			});
		}

		res.render("attendance-master", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Attendance",
			date: date,
		});
	}
);

router.get("/courses/appointment", secured(), function (req, res, next) {
	const { _raw, _json, ...userProfile } = req.user;

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var courseHeading = checkRosters(userEmail);

	function doBusyTimesCallback(availableSlots) {
		fs.appendFileSync("debugging.txt", "Made it into callback");
		res.render("appointment-react", {
			userProfile: JSON.stringify(userProfile, null, 2),
			title: "Appointment",
			courseHeading: courseHeading,
			givenName: userProfile.name.givenName,
			availableSlots: availableSlots,
		});
	}
	getBusyTimes.doAll(doBusyTimesCallback);

	/* res.render('appointment-react', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: "Appointment",
      courseHeading: courseHeading,
      givenName: userProfile.name.givenName
    });*/
});

router.post("/courses/appointment", secured(), urlencodedParser, function (
	req,
	res,
	next
) {
	var selection = req.body["selection"]["value"];
	var reason = req.body["reason"];

	var endTime = new Date(selection);
	var endTime = endTime.setMinutes(endTime.getMinutes() + 30);
	var endTime = new Date(endTime).toISOString();

	const { _raw, _json, ...userProfile } = req.user;

	var userInfo = userProfile;
	var userEmail = userInfo["emails"][0]["value"];

	var guest = userEmail;
	var startTime = selection;
	var endTime = endTime;
	var reason = reason;
	var course = checkRosters(userEmail);

	function doCallBack(success) {
		console.log(success);
	}
	createEvent.createEvent(
		guest,
		course,
		startTime,
		endTime,
		reason,
		doCallBack
	);

	res.send({ selection: selection });
});

module.exports = router;
