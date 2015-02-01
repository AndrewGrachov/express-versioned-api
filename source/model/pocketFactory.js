var ObjectId = require('mongodb').ObjectID;
var errors = require('nodeerrors');
var async = require('async');
var mapStream = require('map-stream');
var config = require('config');
var userFactory = require('./userFactory');

var entities = {
	entity: function (pocket) {
		var pocketEntity = {
			id: pocket._id,
			name: pocket.data.name,
			createdAt: pocket.createdAt
		};

		pocketEntity.id = pocket._id;
		return pocketEntity;
	},
	entity_v2: function (pocket) {
		var pocketEntity = {
			id: pocket._id,
			createdAt: pocket.createdAt,
			name: pocket.data.name,
			amount: pocket.data.amount || 0,
			notes: pocket.data.notes || ''
		};

		return pocketEntity;
	},
	pocketUser: function (pocketUser) {
		var pocketUser = userFactory.transform('entity', pocketUser.user);
		pocketUser.joined = pocketUser.createdAt;
		return pocketUser;
	}
};

function pocketFactory(mongo) {
	return {
		createPocket: function (data, callback) {
			var pocket = {
				data: data,
				createdAt: new Date()
			};
			mongo('pockets').save(pocket, {safe: true, new: true}, callback);
		},
		updatePocket: function (id, data, callback) {
			id = ObjectId(id);
			mongo('pockets').findAndModify({_id: id}, [], {$set: {data: data}}, {new: true}, function (err, pocket) {
				if (err) {
					return callback(err);
				}
				if (!pocket) {
					return callback(errors.notFound('pocket'));
				}
				return callback(err, pocket);
			});
		},
		removePocket: function (id, callback) {
			id = ObjectId(id);
			mongo('pockets').findAndModify({_id: id}, [], {}, {remove: true}, function (err, pocket) {
				if (err) {
					return callback(err);
				}
				if(!pocket) {
					return callback(errors.notFound('pocket'));
				}
				return callback(err, pocket);
			});
		},
		getPocketById: function (id, options, callback) {
			if (!callback) {
				callback = options;
				options = {};
			}
			id = ObjectId(id);

			mongo('pockets').findOne({_id: id}, fetchUsers);

			function fetchUsers(err, pocket) {
				if (err) {
					return callback(err);
				}
				if (!pocket) {
					return callback(errors.notFound('pocket'))
				}
				return mongo('users').find({_id: {$in: pocket.users}}, callback);
			}
		},
		getPockets: function (options, callback) {
			options = options || {};
			options.skip = options.skip || 0;
			options.limit = options.limit || config.POCKETLIST_LIMIT;

			mongo('pockets').count(function (err, count) {
				if (err) {
					return callback(err);
				}
				var stream = mongo('pockets')
							.find()
							.skip(options.skip)
							.limit(options.limit)
							.sort({createdAt: -1})
							.stream();
							

				return callback(null, {stream: stream, count: count});
			});

		},
		joinPocket: function (pocketId, user, callback) {
			pocketId = ObjectId(pocketId);
			var contextPocket;
			return async.waterfall([
				//insert fake user
				function createFakeUser(callback) {
					var doc = {
						_id: user.id,
						data: {
							avatarUrl: user.avatarUrl,
							email: user.email
						},
						createdAt: new Date()
					};
					mongo('users').save(doc, {new: true, safe: true}, callback);
				},
				function findPocket(user, count, callback) {
					mongo('pockets').findOne({_id: pocketId}, callback);
				},
				function checkExistingRelation(pocket, callback) {
					if (!pocket) {
						return callback(errors.notFound('pocket'));
					}
					contextPocket = pocket;
					mongo('pocketUsers').findOne({pocketId: pocket._id, userId: user.id}, callback);
				},
				function joinPocket(pocketUser, callback) {
					if (pocketUser) {
						return callback(errors.invalidOperation('already joined this pocket'));
					}
					var relationShip = {
						pocketId: contextPocket._id,
						userId: user.id,
						createdAt: new Date()
					};
					mongo('pocketUsers').save(relationShip, {new: true}, callback);
				}
			], callback);
		},
		leavePocket: function (pocketId, userId, callback) {
			pocketId = ObjectId(pocketId);
			userId = ObjectId(userId);
			mongo('pocketUsers').findAndModify({pocketId: pocketId, userId: userId}, [], {}, {remove: true}, function (err, pocketUser) {
				if (err) {
					return callback(err);
				}
				if (!pocketUser) {
					return mongo('pockets').findOne({_id: pocketId}, checkPocket);
					function checkPocket(err, pocket) {
						if (err) {
							return callback(err);
						}
						if (!pocket) {
							return errors.notFound('pocket');
						}
						return errors.invalidOperation('not in this pocket');
					}
				}
				return callback();
			});
		},
		getPocketUsers: function (pocketId, options, callback) {
			if (!callback) {
				callback = options;
				options = {};
			}

			options.limit = options.limit || config.POCKETUSERS_LIMIT;
			options.skip = options.skip || 0;

			pocketId = ObjectId(pocketId);
			async.waterfall([
				function findPocket(callback) {
					mongo('pockets').findOne({_id: pocketId}, callback);
				},
				function getPocketUsersCount(pocket, callback) {
					if (!pocket) {
						return callback(errors.notFound('pocket'));
					}
					mongo('pocketUsers').count({pocketId: pocket._id}, callback);
				},
				function getPocketUsers(count, callback) {
					var stream = mongo('pocketUsers')
						.find({pocketId: pocketId})
						.skip(options.skip)
						.limit(options.limit)
						.sort({createdAt: -1})
						.stream();
					
					var fetchUser = function (pocketUser, callback) {
						mongo('users').findOne({_id: pocketUser.userId}, function (err, user) {
							if (err) {
								return callback(err);
							}
							if (!user) {
								return callback();
							}
							return callback(null, {user: user, joined: pocketUser.createdAt});
						});
					};

					var pipe = stream.pipe(mapStream(fetchUser));
					return callback(null, {count: count, stream: pipe})
				}
			], callback);
		}
	}
};

pocketFactory.transform = function (type, pocket) {
	if (!entities[type]) {
		throw 'Invalid transform type ' + type;
	}
	return entities[type](pocket);
};

module.exports = pocketFactory;