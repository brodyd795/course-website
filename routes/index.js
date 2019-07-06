var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Overview' });
});

/* GET resources page */
router.get('/resources', function (req, res, next) {
//  console.log("Testing this out");
  res.render('resources', { title: 'Resources' });
});

module.exports = router;
