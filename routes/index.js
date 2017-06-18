var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
  res.send('Welcome to Maketrail Rendering Server');
});

router.use('/trip/:tripId', function(req, res) {
  res.send('Exporting Trip : ' + req.params.tripId);
});

module.exports = router;
