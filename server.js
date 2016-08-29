var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var cors = require('cors');
var conn = mongoose.connection;
var config = require('./config/database.js');
db=mongoose.connect(config.url);
app.configure(function() {
	app.use(express.logger('dev')); // log every request to the console
	app.use(express.bodyParser()); // get information from html forms
	app.use(function(req, res, next) {
	    res.setHeader('Access-Control-Allow-Origin', 'http://localhost');
	    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	    next();
	});
	app.use(express.static(__dirname + '/html'));
});
require('./app/routes.js')(app);
app.listen(port);
console.log('###################################');
console.log('Node Server Started at port ' + port);
console.log('###################################');
