/* 
 * This is where most of the brains of the app come in. 
 * The assignments, grades, and blackbox page routes are all located here.
 * This script also calls the regex.js script that runs the regex checker.
 */

var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var regex = require('../regex.js');
var fs = require('fs');
var nodemailer = require('nodemailer');
var sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/usr/share/nginx/html/120/attendance.db');

var urlencodedParser = bodyParser.urlencoded({ extended: false});
var score = {myscore: ""};

dotenv.config();

/* GET assignments. */
router.get('/120/assignments', secured(), function (req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  res.render('assignments', {
    userProfile: JSON.stringify(userProfile, null, 2),
    title: 'Assignments'
  });
});

router.post('/120/assignments', secured(), urlencodedParser, function(req, res, next){

  var input = req.body['code'];
  var input = input.trim(); // in case the user had any newlines or spaces at the beginning or end of their input
  var task = req.body['task'];
  var testData = regex.testRegex(input, task); // send user input to regex tester in regex.js
  score['myscore'] = testData['score'];
  var passFail = testData['passFail'];

  // get timestamp to record with answer and score
  var date = new Date();
  var date_pretty = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  // Get user email address
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  // Get user data
  var rawData = fs.readFileSync('user_data.json');
  var allUserData = JSON.parse(rawData);
  if (allUserData.hasOwnProperty(userEmail)) { // if user has posted data before or gone to Grades and is therefore in user_data.json
    var userData = allUserData[userEmail];
    var userPrevScore = userData[task]; // extract their previous score on this task
    var submissionType = task + '_submissions';

    // If better score, save it
    if (userPrevScore < parseInt(score['myscore'])) {
      allUserData[userEmail][task] = parseInt(score['myscore']);
      userData = allUserData[userEmail]; // updating the variable, because its parent changed
      allUserData[userEmail]['average'] = (userData['haigyPaigy'] + userData['turkishPlurals'] + userData['corpusCleaning'] + userData['articleReplacement'])/4;
      allUserData[userEmail][submissionType].push([input, score['myscore'], date_pretty]); // pushing input to end of array so that I can save their answers in chronological order
      fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){ // write data to user_data.json
        if (err) return console.log(err);
      });
    } else { // if user has never posted data before or gone to Grades (so doesn't exist in user_data.json)
      allUserData[userEmail][submissionType].push([input, score['myscore'], date_pretty]);
      fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
        if (err) return console.log(err);
      });
    };
  } else {
    allUserData[userEmail] = { // initialize new user's data
      "haigyPaigy": 0,
      "turkishPlurals": 0,
      "corpusCleaning": 0,
      "articleReplacement": 0,
      "average": 0,
      "haigyPaigy_submissions": [],
      "turkishPlurals_submissions": [],
      "corpusCleaning_submissions": [],
      "articleReplacement_submissions": []
    };

    // save score if > 0
    if (parseInt(score['myscore']) > 0) {
      allUserData[userEmail][task] = parseInt(score['myscore']);
      userData = allUserData[userEmail]; // updating the variable, because its parent changed
      allUserData[userEmail]['average'] = (userData['haigyPaigy'] + userData['turkishPlurals'] + userData['corpusCleaning'] + userData['articleReplacement'])/4;
    };

    var submissionType = task + '_submissions';
    //var userSubmissions = allUserData[userEmail][submissionType];
    allUserData[userEmail][submissionType].push([input, score['myscore'], date_pretty]);

    // Write new 0 scores to file
    fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
      if (err) return console.log(err);
    });
  };

  res.render('assignments', {
    score: score['myscore'],
    passFail: passFail,
    prevTask: task,
    prevCode: input
  });
});

router.get('/120/grades', secured(), function (req, res, next) {

  // Get user email
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  // Get user user data
  var rawData = fs.readFileSync('user_data.json');
  var allUserData = JSON.parse(rawData);

  // If user has scores
  if (allUserData.hasOwnProperty(userEmail)) {
    var userData = allUserData[userEmail];
    var haigyPaigyScore = userData['haigyPaigy'];
    var turkishPluralsScore = userData['turkishPlurals'];
    var corpusCleaningScore = userData['corpusCleaning'];
    var articleReplacementScore = userData['articleReplacement'];
    var averageScore = userData['average'];

    res.render('grades', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: 'Grades',
      haigyPaigyScore: haigyPaigyScore,
      turkishPluralsScore: turkishPluralsScore,
      corpusCleaningScore: corpusCleaningScore,
      articleReplacementScore: articleReplacementScore,
      averageScore: averageScore
    });
  } else {
    // Update their scores to 0 for all
    allUserData[userEmail] = {
      "haigyPaigy": 0,
      "turkishPlurals": 0,
      "corpusCleaning": 0,
      "articleReplacement": 0,
      "average": 0,
      "haigyPaigy_submissions": [],
      "turkishPlurals_submissions": [],
      "corpusCleaning_submissions": [],
      "articleReplacement_submissions": []
    };
    // Write new 0 scores to file
    fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
      if (err) return console.log(err);
    });
    // Render grades with 0s
    res.render('grades', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: 'Grades',
      haigyPaigyScore: 0,
      turkishPluralsScore: 0,
      corpusCleaningScore: 0,
      articleReplacementScore: 0,
      averageScore: 0
    });

  }

});

router.get('/120/blackbox', secured(), function (req, res, next) {
  res.render('blackbox');
});


router.post('/120/blackbox', secured(), urlencodedParser, function(req, res, next){
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];
  
  var input = req.body['emailText'];
  var courseSection = req.body['courseSection'];
  var subject = 'BlackBox - ' + courseSection;

  var course = courseSection.replace(/(\w+)-\w+/, "$1");

  let roster_sql = 'SELECT email FROM ' + course;
  db.all(roster_sql, (roster_err, roster_results)=> {
    let email_list = [];
    let i;
    for (i in roster_results) {
      email_list.push(roster_results[i]['email']);
    }
    let roster = email_list;
    if (email_list.includes(userEmail)) {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASS
        }
      });

      var mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: process.env.EMAIL_RECIPIENT,
        subject: subject,
        text: input
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          pass
        } else {
          pass
        }
      });

      res.render('blackbox', {
        title: 'Blackbox',
        thankyou: "Thank you for your message. Your instructor will reply soon."
      });
    } else {
      res.render('blackbox-err', {
        userProfile: JSON.stringify(userProfile, null, 2),
        title: 'Blackbox'
      });
    }
  });
});


/* GET attendance. */
router.get('/120/attendance', secured(), function (req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  res.render('attendance', {
    userProfile: JSON.stringify(userProfile, null, 2),
    title: 'Attendance'
  });
});


router.post('/120/attendance', secured(), urlencodedParser, function(req, res, next){
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  var course = req.body['course'];

  let roster_sql = 'SELECT email FROM ' + course;
  db.all(roster_sql, (roster_err, roster_results)=> {
    let email_list = [];
    let i;
    for (i in roster_results) {
      email_list.push(roster_results[i]['email']);
    }
    let roster = email_list;
    if (email_list.includes(userEmail)) {
      let absences = 'SELECT * FROM ' + course + ' WHERE email LIKE "%' + userEmail + '%"';
      db.all(absences, (err, results)=> {
        //let absences = results[0]['absences'];
        //let tardies = results[0]['tardies'];
        //let combined = results[0]['combined'];
        //let subtracted = results[0]['subtracted'];
        
        let absencesList = [];
        let tardiesList = [];

        let keys = Object.keys(results[0]);
        let key;

        for (key in keys) {
          if (results[0][keys[key]] == 'X') {
            let new_formatted_key = keys[key].replace(/^(\w+?)_(\d{2})_\d{4}/, ' $1 $2');
            absencesList.push(new_formatted_key);
          } else if (results[0][keys[key]] == 'T') {
            let new_formatted_key = keys[key].replace(/^(\w+?)_(\d{2})_\d{4}/, ' $1 $2');
            tardiesList.push(new_formatted_key);
          }
        }


        let absences_count = absencesList.length;
        let tardies_count = tardiesList.length;

        if (absencesList.length == 0) {
          absencesList.unshift('never absent');
        }
        if (tardiesList.length == 0) {
          tardiesList.unshift('never tardy');
        }
        let combined_count = absences_count + Math.floor(tardies_count/3);

        let subtracted_count;
        if (course == "SPAN101") {
          subtracted_count = (combined_count > 4) ? (combined_count-4)*2 : 0;
        } else if (course == "LING120") {
          subtracted_count = (combined_count > 3) ? (combined_count-3)*5 : 0;
        }

        res.render('attendance', {
          userProfile: JSON.stringify(userProfile, null, 2),
          title: 'Attendance',
          absences: 'Absences: ' + absences_count + ' - ' + absencesList,
          tardies: 'Tardies: ' + tardies_count + ' - ' + tardiesList,
          combined: 'Combined: ' + combined_count,
          subtracted: 'Subtracted: ' + subtracted_count + '%'
        });
      });
    } else {
      res.render('attendance-err', {
        userProfile: JSON.stringify(userProfile, null, 2),
        title: 'Attendance'
      });
    }
  });

});


router.get('/120/attendance/master', secured(), urlencodedParser, function(req, res, next){

  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];


  var date = new Date();
  var date_formatted = date.toString().replace(/^\w+? (\w+?) (\d+) (\d{4}).+$/, '$1_$2_$3');

  if (userEmail == 'btdingel@iastate.edu') {
    res.render('attendance-master', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: 'Attendance',
      date: date_formatted
    });
  } else {
    res.render('attendance-master-err', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: 'Attendance'
    });
  }

});


router.post('/120/attendance/master', secured(), urlencodedParser, function(req, res, next){

  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  var course = req.body['course'];

  if (userEmail == 'btdingel@iastate.edu') {
    let sql_cols = 'PRAGMA table_info("' + course + '")';
    db.all(sql_cols, (err, results)=> {
      let col_list = [];
      let i;
      for (i in results) {
        col_list.push(results[i]['name']);
      }
      col_list.push('ok');
      let date = req.body['date'];
      let test;
      let sql_new_col;
      let sql_new_values;
      let sql_names_and_date;
      if (col_list.includes(date) != true) {
        sql_new_col = 'ALTER TABLE ' + course + ' ADD ' + date + ' TEXT';
        db.run(sql_new_col, (err, results)=> {
          sql_new_values = 'UPDATE ' + course + ' SET ' + date + '="OK"';
          db.run(sql_new_values, (err, results)=> {
            sql_names_and_date = 'SELECT name, ' + date + ' FROM ' + course;
            db.all(sql_names_and_date, (err2, results2)=> {
              res.render('attendance-master-results', {
                userProfile: JSON.stringify(userProfile, null, 2),
                title: 'Attendance',
                date: date,
                roster: results2,
                num_students: results2.length,
                course: course
              });
            });
          });
        });
      } else {
        sql_names_and_date = 'SELECT name, ' + date + ' FROM ' + course;
        db.all(sql_names_and_date, (err2, results2)=> {
          res.render('attendance-master-results', {
            userProfile: JSON.stringify(userProfile, null, 2),
            title: 'Attendance',
            date: date,
            roster: results2,
            num_students: results2.length,
            course: course
          });
        });
      }
    });
  } else {

    render('attendance-master-err', {
      userProfile: JSON.stringify(userProfile, null, 2),
      title: 'Attendance'
    });
  }

});



router.post('/120/attendance/master/results', secured(), urlencodedParser, function(req, res, next){

  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  var num_students = req.body['num_students'];
  var num_type = parseInt(num_students);
  var num_type2 = typeof(num_type);
  var date = req.body['date'];
  var course = req.body['course'];

  var counter = 0;

  while (counter < num_students) {
    var student_name = req.body['student_name_' + counter];
    var student_status = req.body['student_status_' + counter];

    var sql = 'UPDATE ' + course + ' SET ' + date + '="' + student_status + '" WHERE name="' + student_name + '"';

    db.run(sql, (err, results)=> {});
    counter++;
  }

  var new_sql = 'INSERT INTO SPAN101 (name) VALUES ('+ num_type2 + ')';
  db.run(new_sql, (err, results)=> {});

  res.render('attendance-master', {
    userProfile: JSON.stringify(userProfile, null, 2),
    title: 'Attendance',
    date: date
  });

});


module.exports = router;
