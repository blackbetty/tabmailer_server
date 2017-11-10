const createUser = require('../create_user.js');
// var request = require('supertest');
var server = require('../../app.js');
const util = require('util');
const Datastore = require('@google-cloud/datastore');
const _ = require('lodash');
// Instantiates a client
const projectId = 'tabmailer-174400';
const datastoreClient = Datastore({
	projectId: projectId
});

const logger = require('../../utilities/logger.js');

const testUser = {
	email: 'dgolant@gmail.com',
	username: 'testyMcTestFace',
	googleID: 111
};


beforeAll((done) => {
	// Clears the database and adds some testing data.
	// Jest will wait for this promise to resolve before running tests.
	var allQuery = datastoreClient.createQuery(null,'tabmailer_user').select('__key__');
	datastoreClient.runQuery(allQuery)
		.then((results) => {
			// Task entities found.		
			var entKeys = _.map(results[0], datastoreClient.KEY);
			datastoreClient.delete(entKeys).then(() => {
				logger.info('Cleared DB');
				done();
			});
		});
});
describe('Creates a user', ()=>{
	test(`whose name is ${testUser.username}`, done => {
		let callback = (user) => {
			expect(user.data.username).toBe(testUser.username);
			done();
		};
		createUser(testUser.email, testUser.username, testUser.googleID, callback);
	});
});

afterAll((done) => {
	// Clears the database and adds some testing data.
	// Jest will wait for this promise to resolve before running tests.
	var allQuery = datastoreClient.createQuery(null, 'tabmailer_user').select('__key__');
	datastoreClient.runQuery(allQuery)
		.then((results) => {
			// Task entities found.		
			var entKeys = _.map(results[0], datastoreClient.KEY);
			datastoreClient.delete(entKeys).then(() => {
				logger.info('Cleared DB');
				done();
			});
		});
});