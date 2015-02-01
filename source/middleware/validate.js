var schemagic = require('schemagic');
var errors = require('nodeerrors');

module.exports = function (schema, options) {
	options = options || {};
	return function (req, res, next) {
		schemagic[schema].validate(req.body, options, function (err, result) {
			if (err) {
				return next(err);
			}
			if(!result.valid) {
				return next(errors.schema(result.errors, {body: req.body}));
			}
			next();
		});
	};
};