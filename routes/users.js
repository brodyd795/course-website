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

var urlencodedParser = bodyParser.urlencoded({ extended: false});
var score = {myscore: ""};

dotenv.config();

/* GET assignments. */
router.get('/assignments', secured(), function (req, res, next) {
  const { _raw, _json, ...userProfile } = req.user;
  res.render('assignments', {
    userProfile: JSON.stringify(userProfile, null, 2),
    title: 'Assignments'
  });
});

router.post('/assignments', secured(), urlencodedParser, function(req, res, next){

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

router.get('/grades', secured(), function (req, res, next) {

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

router.get('/blackbox', function (req, res, next) {
  res.render('blackbox');
});


router.post('/blackbox', urlencodedParser, function(req, res, next){
  var input = req.body['emailText'];
  var courseSection = req.body['courseSection'];
  var subject = 'BlackBox - ' + courseSection;

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
    thankyou: "Thank you for your message. Your instructor will reply soon."
  });
});

module.exports = router;
