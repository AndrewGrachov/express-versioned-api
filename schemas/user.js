module.exports = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			required: true,
			example: '1234678'
		},
		name: {
			type: 'string',
			required: true
		},
		avatar: {
			type: 'string'
		}
	}
};