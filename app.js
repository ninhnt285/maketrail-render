var express = require('express');
var router = require('./routes');

var app = express();

app.use(router);

app.listen(process.env.PORT);
