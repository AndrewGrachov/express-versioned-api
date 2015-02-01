var errors = require('nodeerrors');

module.exports = function (req, res, next) {
	['limit', 'skip', 'sort'].forEach(function (listParam) {
		if (req.query[listParam] && isNaN(parseInt(req.query[listParam]))) {
			return next(errors.invalidParameter(listParam, 'Should be number'));
		}
	});
	next();
}