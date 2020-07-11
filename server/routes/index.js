var express = require('express');
var router = express.Router();
var path = require('path');


var secured = require('../lib/middleware/secured');
var dotenv = require('dotenv');
var bodyParser = require('body-parser');
var regex = require('../regex.js');
var fs = require('fs');
var nodemailer = require('nodemailer');
var urlencodedParser = bodyParser.urlencoded({ extended: false});
const secretKey = process.env.CAPTCHA_SECRET_KEY;
var request = require('request');

/* GET home page. */

//dotenv.config();

checkRosters = userEmail => {
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

router.get('/sitemap', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../sitemap.xml'));
});


router.get('/index-old', function (req, res, next) {
  res.render('index', { title: 'Overview' });
});

router.get('/', function (req, res, next) {
  if (req.user) {
    const { _raw, _json, ...userProfile } = req.user;

    var userInfo = userProfile;
    var userEmail = userInfo['emails'][0]['value'];

    var courseHeading = checkRosters(userEmail);
    var givenName = userProfile.name.givenName;
  } else {
    var courseHeading = "SPAN 101 / LING 120";
    var givenName = "ISU student";
  }
  res.render('index-react', { 
    title: 'Home', 
    courseHeading: courseHeading,
    givenName: givenName
  });
});

/*router.get('/120/assignments-react', function (req, res, next) {
  const otherData = 'otherData';

  const userData = {
        otherData: otherData
  }

  res.render('assignments-react', {
    userData: userData,
    title: 'Assignments'
  });
});*/

/* GET resources page */
router.get('/resources-old', function (req, res, next) {
  res.render('resources', { title: 'Resources' });
});

module.exports = router;
