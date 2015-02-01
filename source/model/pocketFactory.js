var ObjectId = require('mongodb').ObjectID;
var errors = require('nodeerrors');
var async = require('async');
var mapStream = require('map-stream');
var config = require('config');

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
	}
};

function pocketFactory(mongo) {
	return {
		createPocket: function (data, callback) {
			var pocket = {
				data: data,
				createdAt: new Date(),
				users: []
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
				if (options.fetchUsers) {
					return mongo('users').find({_id: {$in: pocket.users}}, gotUsers);
				}
				return returnPocket();

				function returnPocket(err, users) {
					if (err) {
						return callback(err);
					}
					if (users) {
						pocket.users = users;
					}
					return callback(null, pocket);
				}
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
							
				if (!options.fetchUsers) {
					return callback(null, {stream: stream, count: count});
				}

				var fetchUsers = mapStream(function (pocket, callback) {
					mongo('users').find({_id: {$in: pocket.users}}).toArray(function (err, users) {
						if (err) {
							return callback(err);
						}
						pocket.users = users;
						return callback(null, pocket);
					});
				});
				return callback(null, {stream: stream.pipe(fetchUsers), count: count});
			});

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