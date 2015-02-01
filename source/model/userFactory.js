var entities = {
	entity: function (user) {
		var userEntity = {
			id: user._id,
			email: user.data.email,
			createdAt: user.data.createdAt,
			avatarUrl: user.data.avatarUrl,
			createdAt: user.createdAt
		};
		return userEntity;
	}
};

function userFactory(mongo) {

}

userFactory.transform = function (type, user) {
	if (!entities[type]) {
		throw 'Invalid transform type ' + type;
	}
	return entities[type](user);
};
module.exports = userFactory;