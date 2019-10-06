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

router.get('/sitemap', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../sitemap.xml'));
});

router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../brody/index.html'));
});

router.post('/', urlencodedParser, function(req, res, next) {
  //var name = req.body['contacter-name'];
  //var email = req.body['contacter-email'];
  //var message = req.body['contacter-message'];
  //
  var contacterData = req.body;
  var contacterName = contacterData.contacterName;
  var contacterEmail = contacterData.contacterEmail;
  var contacterMessage = contacterData.contacterMessage;
  fs.appendFile("debugging.txt", JSON.stringify(req.body), (err)=>{if (err) throw err;});

  //console.log('xxxxxxxxxxxxxxxxx', req.body);
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
      return res.json({'msg':'you might be a robot', 'score': body.score}); // here I'll want to just disregard
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
  //const contactInfo = {
  //  name: req.body['contacter-name'],
  //  email: req.body['contacter-email'],
  //  message: req.body['contacter-message']
  //}
  //fs.appendFile("debugging.txt", name+"\n"+email+"\n"+message+"\n"+JSON.stringify(req.body)+"\n", (err)=>{if (err) throw err;});
  //fs.appendFile("debugging.txt", req.body, (err)=>{if (err) throw err;});



/*
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
  subject: "Personal message from " + name,
  text: email_text
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    pass
  } else {
    pass
  }
});*/
  
  //res.sendFile(path.join(__dirname+'/../brody/index.html'));
});


//router.post('/ajax', function(req, res) {
//  var contacterName = req.body;
//  res.send(contacterName);
//});


router.get('/120-test', function(req, res, next) {
  res.sendFile(path.join(__dirname+'/../120-test/120-test.html'));
});

router.get('/120', function (req, res, next) {
  res.render('index', { title: 'Overview' });
});

/* GET resources page */
router.get('/120/resources', function (req, res, next) {
  res.render('resources', { title: 'Resources' });
});

/* GET test page */
router.get('/testDir/test', function(req, res, next) {
  res.render('test');
});

module.exports = router;
