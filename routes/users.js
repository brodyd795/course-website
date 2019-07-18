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
  var task = req.body['task'];
  var testData = regex.testRegex(input, task);
  score['myscore'] = testData['score'];
  var passFail = testData['passFail'];

  // Get user email address
  const { _raw, _json, ...userProfile } = req.user;
  var userInfo = userProfile;
  var userEmail = userInfo['emails'][0]['value'];

  // Get user previous score
  var rawData = fs.readFileSync('user_data.json');
  var allUserData = JSON.parse(rawData);
  if (allUserData.hasOwnProperty(userEmail)) {
    var userData = allUserData[userEmail];
    var userPrevScore = userData[task];
    var submissionType = task + '_submissions';
    //var userSubmissions = userData[submissionType];

    // If better score, save it
    if (userPrevScore < parseInt(score['myscore'])) {
      allUserData[userEmail][task] = parseInt(score['myscore']);
      userData = allUserData[userEmail]; // updating the variable, because its parent changed
      allUserData[userEmail]['average'] = (userData['haigyPaigy'] + userData['turkishPlurals'] + userData['corpusCleaning'] + userData['articleReplacement'])/4;
      allUserData[userEmail][submissionType].push(input);
      fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
        if (err) return console.log(err);
      });
    } else {
      allUserData[userEmail][submissionType].push(input);
      fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
        if (err) return console.log(err);
      });
    };
  } else {
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

    // save score if > 0
    if (parseInt(score['myscore']) > 0) {
      allUserData[userEmail][task] = parseInt(score['myscore']);
      userData = allUserData[userEmail]; // updating the variable, because its parent changed
      allUserData[userEmail]['average'] = (userData['haigyPaigy'] + userData['turkishPlurals'] + userData['corpusCleaning'] + userData['articleReplacement'])/4;
    };

    var submissionType = task + '_submissions';
    //var userSubmissions = allUserData[userEmail][submissionType];
    allUserData[userEmail][submissionType].push(input);

    // Write new 0 scores to file
    fs.writeFile('user_data.json', JSON.stringify(allUserData, null, 2), function(err){
      if (err) return console.log(err);
    });

    // var userData = allUserData[userEmail];
    // var userPrevScore = userData[task];

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
