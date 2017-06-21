var express = require('express');
var router = require('./routes');
var worker = require('./worker');
var checker = require('./checker');

var app = express();

app.use(router);

worker.init();

checker.start();

app.listen(process.env.PORT);
