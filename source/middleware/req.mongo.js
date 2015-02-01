var thunky = require('thunky');
var mongodb = require('mongodb');
var config = require('config');

function getDb(callback) {
	return mongodb.connect(config.mongodb.url, config.mongodb.options, callback);
}

var connect = thunky(getDb);

module.exports = function (req, res, next) {
	connect(function (err, client) {
		if (err) {
			return next(err);
		}
		req.mongo = function (collectionName) {
			return client.collection(collectionName);
		};
		next();
	});
}