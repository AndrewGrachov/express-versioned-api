var pocketFactory = require(ROOT + '/source/model/pocketFactory');
var schemagic = require('schemagic');
var validateSchema = require(ROOT + '/source/middleware/validate');
var validateListParams = require(ROOT + '/source/middleware/validateListParams');
var validateObjectId = require(ROOT + '/source/middleware/validateObjectId');
var listResponse = require(ROOT + '/source/middleware/listResponse');
var mapStream = require('map-stream');

module.exports = function (app) {
	app.get('/api/v1/pockets',
		validateListParams, 
		function (req, res, next) {
			var listOptions = req.query;
			pocketFactory(req.mongo).getPockets(listOptions, function (err, result) {
				if (err) {
					return next(err);
				}
				var pipe = result.stream.pipe(mapStream(function (pocket, callback) {
					return callback(null, pocketFactory.transform('entity', pocket));
				}));
				return listResponse({stream: pipe, count: result.count}, req, res, next);
			});
		}
	);
	app.get('/api/v1/pockets/:pocketId', function (req, res, next) {
		var pocketId = req.params.pocketId;
		pocketFactory(req.mongo).getPocket(pocketId, function(err, pocket) {
			if (err) {
				return next(err);
			}
			return pocketFactory.transform('entity', pocket);
		});
	});
	app.post('/api/v1/pockets',
			 validateSchema('pocket'), 
			 function (req, res, next) {
			 	pocketFactory(req.mongo).createPocket(req.body, function (err, pocket) {
			 		if (err) {
			 			return next(err);
			 		}
			 		return res.send(pocketFactory.transform('entity', pocket));
			 	});
			}
		);
	app.put('/api/v1/pockets/:pocketId', 
			validateSchema('pocket'), 
			validateObjectId('pocketId'),
			function (req, res, next) {
				var id = req.params.pocketId;
				console.log('before putting pocket');
				pocketFactory(req.mongo).updatePocket(id, req.body, function (err, pocket) {
					if (err) {
						console.log('error:', err);
						return next(err);
					}
					return res.send(pocketFactory.transform('entity', pocket));
				});
			}
		);
	app.delete('/api/v1/pockets/:pocketId',
			validateObjectId('pocketId'), 
			function (req, res, next) {
				pocketFactory(req.mongo).removePocket(req.params.pocketId, function (err) {
					if (err) {
						return next(err);
					}
					return res.send({success: true});
				});
			}
		);

	app.post('/api/v1/pockets/:pocketId/user', function () {
		return res.send({fakeJoin: true});
	});
	app.delete('/api/v1/pockets/:pocketId/user', function () {
		return res.send({fakeLeave: true});
	});
}