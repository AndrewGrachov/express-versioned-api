var express = require('express');
var config = require('config');
var app = express();
var bodyParser = require('body-parser');
var reqMongo = require('./source/middleware/req.mongo');
global.ROOT = __dirname;

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
app.use(bodyParser.json());
app.use(reqMongo);

var routes = require('./source/routes/v1');
var routes_v2 = require('./source/routes/v2');
routes(app);
routes_v2(app);

var server = app.listen(process.env.PORT || config.app.port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server is listening at http://%s:%s', host, port);
	if (process.send) {
		process.send('online');
	}
});