var request = require('superagent');
var testConfig = require('./testConfig');
var expect = require('chai').expect;

describe('when testing pockets api', function () {

	describe('when creating pocket', function () {
		var pocket;
		before(function (done) {
			request
				.post(testConfig.server.url + '/api/v1/pockets')
				.send({
					name: 'super pocket',
				}).end(function (res) {
					pocket = res.body;
					done();
				});
		});

		it('should create pocket', function () {
			expect(pocket).to.be.an('object');
			expect(pocket.id).to.be.a('string');
			expect(pocket.name).to.equal('super pocket');
			expect(pocket.createdAt).to.be.a('string');
		});

		describe('when updating pocket', function () {
			var updatedPocket;
			before(function (done) {
				request
					.put(testConfig.server.url + '/api/v1/pockets/' + pocket.id)
					.send({
						id: 'abracadabra',
						name: 'updated pocket name',
						createdAt: 'new super string'
					})
					.end(function (res) {
						updatedPocket = res.body;
						done();
				});
			});
			it('should return updatedPocket', function () {
				expect(updatedPocket.name).to.equal('updated pocket name');
			});
			it('should not update id and createdAt fields', function () {
				expect(updatedPocket.createdAt).to.equal(pocket.createdAt);
				expect(updatedPocket.id).to.equal(pocket.id);
			});
		});
		describe('when retrieving pockets', function () {
			var listResponse;
			before(function (done) {
				request
					.get(testConfig.server.url + '/api/v1/pockets/')
					.end(function (res) {
						listResponse = res.body;
						done();
					});
			});
			it('should return list response', function () {
				expect(listResponse).to.have.property('items');
				expect(listResponse.items).to.be.an('array');
				expect(listResponse.count).to.be.a('number');
			});
			it('should include pocket info', function () {
				expect(listResponse.items[0]).to.have.property('id');
				expect(listResponse.items[0]).to.have.property('name');
				expect(listResponse.items[0]).to.have.property('createdAt');
			});
		});
		describe('when removing pocket', function () {
			var removeResponse;
			before(function (done) {
				request
					.del(testConfig.server.url + '/api/v1/pockets/' + pocket.id)
					.end(function (res) {
						removeResponse = res.body;
						done();
					});
			});
			it('should remove pocket', function () {
				expect(removeResponse).to.have.property('success').equal(true);
			});
		});
	});

	describe('when version 2.0', function () {
		describe('when creating pocket', function () {
				var pocket;
				before(function (done) {
					request
						.post(testConfig.server.url + '/api/v2/pockets')
						.send({
							name: 'super pocket',
							amount: 34,
							notes: 'My awesome super pocket'
						}).end(function (res) {
							pocket = res.body;
							done();
						});
				});

				it('should create pocket', function () {
					expect(pocket).to.be.an('object');
					expect(pocket.id).to.be.a('string');
					expect(pocket.name).to.equal('super pocket');
					expect(pocket.amount).to.equal(34);
					expect(pocket.notes).to.equal('My awesome super pocket');
					expect(pocket.createdAt).to.be.a('string');
				});

				describe('when updating pocket', function () {
					var updatedPocket;
					before(function (done) {
						request
							.put(testConfig.server.url + '/api/v2/pockets/' + pocket.id)
							.send({
								id: 'abracadabra',
								name: 'updated pocket name',
								amount: 23,
								notes: 'My awesome super pocket edited description',
								createdAt: 'new super string'
							})
							.end(function (res) {
								updatedPocket = res.body;
								done();
						});
					});
					it('should return updatedPocket', function () {
						expect(updatedPocket.name).to.equal('updated pocket name');
						expect(updatedPocket.amount).to.equal(23);
						expect(updatedPocket.notes).to.equal('My awesome super pocket edited description');
					});
					it('should not update id and createdAt fields', function () {
						expect(updatedPocket.createdAt).to.equal(pocket.createdAt);
						expect(updatedPocket.id).to.equal(pocket.id);
					});
				});
				describe('when retrieving pockets', function () {
					var listResponse;
					before(function (done) {
						request
							.get(testConfig.server.url + '/api/v2/pockets/')
							.end(function (res) {
								listResponse = res.body;
								done();
							});
					});
					it('should return list response', function () {
						expect(listResponse).to.be.an('array');
					});
					it('should include pocket info', function () {
						expect(listResponse[0]).to.have.property('id');
						expect(listResponse[0]).to.have.property('name');
						expect(listResponse[0]).to.have.property('amount');
						expect(listResponse[0]).to.have.property('notes');
						expect(listResponse[0]).to.have.property('createdAt');
					});
				});
				describe('when removing pocket', function () {
					var removeResponse;
					before(function (done) {
						request
							.del(testConfig.server.url + '/api/v2/pockets/' + pocket.id)
							.end(function (res) {
								removeResponse = res.body;
								done();
							});
					});
					it('should remove pocket', function () {
						expect(removeResponse).to.have.property('success').equal(true);
					});
				});
			});
	});
});