var express = require('express');
var bodyParser = require('body-parser');
var worker = require('../worker');

var router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', function(req, res) {
  res.send('Welcome to Maketrail Rendering Server');
});

router.post('/', function(req, res) {
  worker.solve(req.body);
  res.send('Welcome to Maketrail Rendering Server');
});

module.exports = router;
