module.exports = {
	'system': {
		message: 'Internal server error',
		http: 500
	},
	'notFound': {
		message: 'Target %s not found',
		args: ['objectName'],
		http: 404
	},
	'schema': {
		message: 'Error validating against schema',
		args: ['errors'],
		http: 409
	},
	'invalidObjectId': {
		message: 'Invalid object id parameter',
		http: 409
	},
	'invalidParameter': {
		message: 'Invalid parameter \"%s\". %s',
		http: 409,
		args: ['parameterName', 'reason']
	}
};