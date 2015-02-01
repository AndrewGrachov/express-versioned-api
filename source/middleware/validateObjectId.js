var ObjectId = require('mongodb').ObjectID;
var errors = require('nodeerrors');

module.exports = function (param) {
	return function (req, res, next) {
			try {
				ObjectId(req.params[param]);
			}
			catch (ex) {
				console.log('ex:', ex);
				return next(errors.InvalidObjectId(param));
			}
			next();
		}
	};