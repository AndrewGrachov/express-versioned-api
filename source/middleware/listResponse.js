var JSONStream = require('JSONStream');
var util = require('util');

module.exports = function (options, req, res, next) {
	var open;
	if (!options.old) {
		open = util.format('{"count": %d, "items":[',
								options.count
							);
	} else {
		open = util.format('{"code": 0, "%s": [', options.listName);
	}
	var sep = ',';
	var close = ']}';

	res.writeHead(200, {
		'content-type': 'application/json'
	});
	var pipe =  options.stream.pipe(JSONStream.stringify(open, sep, close)).pipe(res);
	pipe.on('error', function (err) {
		return next(err);
	});
};