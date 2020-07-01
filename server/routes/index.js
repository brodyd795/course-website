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

// router.get('/', function(req, res, next) {
//   res.sendFile(path.join(__dirname+'/../brody/index.html'));
// });

router.post('/', urlencodedParser, function(req, res, next) {
  var contacterData = req.body;
  var contacterName = contacterData.contacterName;
  var contacterEmail = contacterData.contacterEmail;
  var contacterMessage = contacterData.contacterMessage;
  //fs.appendFile("debugging.txt", JSON.stringify(req.body), (err)=>{if (err) throw err;});

  if (!req.body.captcha){
    return res.json({msg: 'captcha token is undefined'});
  }

  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;

  request(verifyUrl,(err, response, body)=>{
    if (err) {
      console.log(err);
    }

    body = JSON.parse(body);

    if (!body.success || body.score < 0.4) {
      return res.json({'msg':'you might be a robot', 'score': body.score});
    }
    var email_text = contacterName + ' sent you a message on your personal website. You can contact them at ' + contacterEmail + '. \n\nMessage:\n' + contacterMessage;

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS
      }
    });

    var mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_RECIPIENT_PERSONAL_SITE,
      subject: "Personal message from " + contacterName,
      text: email_text
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        pass
      } else {
        pass
      }
    });
    return res.json({'msg':'you have been verified', 'score': body.score, 'contacterData': contacterData});
  });
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
