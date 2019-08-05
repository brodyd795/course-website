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


/* GET home page. */

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../brody/index.html'));
});

router.post('/', urlencodedParser, function(req, res, next) {
  var name = req.body['contacter-name'];
  var email = req.body['contacter-email'];
  var message = req.body['contacter-message'];
  var email_text = name + ' sent you a message on your personal website. You can contact them at ' + email + '. \n\nMessage:\n' + message;

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
  subject: "Personal message from " + name,
  text: email_text
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    pass
  } else {
    pass
  }
});

  res.sendFile(path.join(__dirname+'/../brody/index.html'));
});

router.get('/120', function (req, res, next) {
  res.render('index', { title: 'Overview' });
});

/* GET resources page */
router.get('/120/resources', function (req, res, next) {
//  console.log("Testing this out");
  res.render('resources', { title: 'Resources' });
});

/* GET test page */
router.get('/testDir/test', function(req, res, next) {
  res.render('test');
});

module.exports = router;
