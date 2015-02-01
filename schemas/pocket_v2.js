module.exports = {
	type: 'object',
	properties: {
		id: {
			type: 'string',
			description: 'pocket id. readonly',
			readonly: true,
			example: ''
		},
		name: {
			type: 'string',
			required: true
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
			description: 'Pocket creation date. readonly',
			readonly: true
		},
		amount: {
			type: 'number',
			description: 'Some amount?',
			required: true
		},
		note: {
			type: 'string'
		}
	}
};