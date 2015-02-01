var JSONStream = require('JSONStream');

module.exports = function (options, req, res, next) {
	var open = '[';
	var sep = ',';
	var close = ']';

	res.writeHead(200, {
		'content-type': 'application/json'
	});
	var pipe =  options.stream.pipe(JSONStream.stringify(open, sep, close)).pipe(res);
	pipe.on('error', function (err) {
		return next(err);
	});
};
