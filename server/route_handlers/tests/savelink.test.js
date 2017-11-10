const createUser = require('../create_user.js');
const saveLink = require('../savelink.js');
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


const googleID = 111;
const tabURL = 'www.testthisstuff.com';
const tabTitle = 'We\'re testing!';

const testUser = {
	email: 'testGolant@gmail.com',
	username: 'testyMcTestFace',
	googleID: 111
};

// creates a user
beforeEach((done) => {
	// Clears the database and adds some testing data.
	// Jest will wait for this promise to resolve before running tests.
	var allQuery = datastoreClient.createQuery(null, 'tabmailer_user').select('__key__');
	datastoreClient.runQuery(allQuery)
		.then((results) => {
			// Task entities found.		
			var entKeys = _.map(results[0], datastoreClient.KEY);
			datastoreClient.delete(entKeys).then(() => {
				logger.info('Cleared DB');
				createUser(testUser.email, testUser.username, testUser.googleID, callback);
			});
		});

	let callback = () => {
		done();
	};

});


describe('Saves a link for a user', () => {
	test(`which has the URL ${tabURL}`, done => {
		let callback = (error, user) => {
			// let checkSchema = {
			// 	'data':{
			// 		article_url: tabURL,
			// 		article_title: tabTitle
			// 	},
			// 	'key': {
			// 		'kind': 'article_id',
			// 		'namespace': undefined,
			// 		'path': ['article_id', undefined]
			// 	}
			// };

			let checkSchema = {
				article_url: tabURL,
				article_title: tabTitle,
				datetime_added: expect.any(Number)
			};
			expect(user.article_list).toContainEqual(checkSchema);
			done();
		};
		saveLink(googleID, tabURL, tabTitle, callback);
	});
});


describe('Saves 2 links for a user', () => {
	test('and both end up validate properly', done => {
		let url1 = 'www.charlie.com';
		let url2 = 'www.johnny.com';
		let called = 0;
		let checkSchema1 = {
			article_url: url1,
			article_title: tabTitle,
			datetime_added: expect.any(Number)
		};
		let checkSchema2 = {
			article_url: url2,
			article_title: tabTitle,
			datetime_added: expect.any(Number)
		};
		let completeTest = ()=>{
			if(called<1){
				called++;
			} else {
				done();
			}
		};
		let callback1 = (error, user) => {
			expect(user.article_list).toContainEqual(checkSchema1);

			completeTest(user);
		};
		let callback2 = (error, user) => {
			expect(user.article_list).toContainEqual(checkSchema2);
			completeTest(user);
		};
		saveLink(googleID, url1, tabTitle, callback1);
		saveLink(googleID, url2, tabTitle, callback2);

	});
});

afterEach((done) => {
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