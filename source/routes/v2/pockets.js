var pocketFactory = require(ROOT + '/source/model/pocketFactory');
var schemagic = require('schemagic');
var validateSchema = require(ROOT + '/source/middleware/validate');
var validateListParams = require(ROOT + '/source/middleware/validateListParams');
var validateObjectId = require(ROOT + '/source/middleware/validateObjectId');
var listResponse = require(ROOT + '/source/middleware/plainArrayResponse');
var mapStream = require('map-stream');
var ObjectId = require('mongodb').ObjectID;

module.exports = function (app) {
	app.get('/api/v2/pockets',
		validateListParams, 
		function (req, res, next) {
			var listOptions = req.query;
			pocketFactory(req.mongo).getPockets(listOptions, function (err, result) {
				if (err) {
					return next(err);
				}
				var pipe = result.stream.pipe(mapStream(function (pocket, callback) {
					return callback(null, pocketFactory.transform('entity_v2', pocket));
				}));
				return listResponse({stream: pipe, count: result.count}, req, res, next);
			});
		}
	);
	app.get('/api/v2/pockets/:pocketId', function (req, res, next) {
		var pocketId = req.params.pocketId;
		pocketFactory(req.mongo).getPocket(pocketId, function(err, pocket) {
			if (err) {
				return next(err);
			}
			return pocketFactory.transform('entity_v2', pocket);
		});
	});
	app.post('/api/v2/pockets',
			 validateSchema('pocket_v2'), 
			 function (req, res, next) {
			 	pocketFactory(req.mongo).createPocket(req.body, function (err, pocket) {
			 		if (err) {
			 			return next(err);
			 		}
			 		return res.send(pocketFactory.transform('entity_v2', pocket));
			 	});
			}
		);
	app.put('/api/v2/pockets/:pocketId', 
			validateSchema('pocket_v2'), 
			validateObjectId('pocketId'),
			function (req, res, next) {
				var id = req.params.pocketId;
				pocketFactory(req.mongo).updatePocket(id, req.body, function (err, pocket) {
					if (err) {
						return next(err);
					}
					return res.send(pocketFactory.transform('entity_v2', pocket));
				});
			}
		);
	app.delete('/api/v2/pockets/:pocketId',
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

	app.post('/api/v2/pockets/:pocketId/users',
		validateObjectId('pocketId'),
		function (req, res, next) {
			//emulate logged user
			var user = {
				id: new ObjectId(),
				avatarUrl: 'http://fake-avatars.com/12.png',
				email: 'fakeEmail@email.com'
			};

			pocketFactory(req.mongo).joinPocket(req.params.pocketId, user, function (err) {
				if (err) {
					return next(err);
				}
				return res.send({success: true});
			});
		}
	);

	app.delete('/api/v2/pockets/:pocketId/users', 
		function (req, res, next) {
			var userId = req.query.userId;
			pocketFactory(req.mongo).leavePocket(req.params.pocketId, userId, function (err) {
				if (err) {
					return next(err);
				}
				return res.send({success: true});
			});
		}
	);
	app.get('/api/v2/pockets/:pocketId/users', 
		validateObjectId('pocketId'),
		function (req, res, next) {
			pocketFactory(req.mongo).getPocketUsers(req.params.pocketId, function (err, result) {
				if (err) {
					return next(err);
				}
				var pipe = result.stream.pipe(mapStream(function (pocketUser, callback) {
					var pocketUserEntity = pocketFactory.transform('pocketUser', pocketUser);
					return callback(null, pocketUserEntity);
				}));
				return listResponse({stream: pipe, count: result.count}, req, res, next);
			});
		}
	);
}