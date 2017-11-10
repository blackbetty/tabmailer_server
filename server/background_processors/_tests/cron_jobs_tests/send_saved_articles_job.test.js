// const createUser = require('../../../route_handlers/create_user.js');
// const saveLink = require('../../../route_handlers/savelink.js');
// var server = require('../../../app.js');
// const util = require('util');
// const Datastore = require('@google-cloud/datastore');
// const _ = require('lodash');
// const logger = require('../../../utilities/logger.js');
// const sendSavedArticlesJob = require('../../cron_jobs/send_saved_articles_job.js');

// // Instantiates a client
// const projectId = 'tabmailer-174400';
// const datastoreClient = Datastore({
// 	projectId: projectId
// });
// const googleID = 111;
// const tabURL = 'www.testthisstuff.com';
// const tabTitle = 'We\'re testing!';

// const testUser = {
// 	email: 'testGolant@gmail.com',
// 	username: 'testyMcTestFace',
// 	googleID: 111
// };


// beforeEach((done) => {
// 	// Clears the database and adds some testing data.
// 	// Jest will wait for this promise to resolve before running tests.
// 	var allQuery = datastoreClient.createQuery(null, 'tabmailer_user').select('__key__');
// 	datastoreClient.runQuery(allQuery)
// 		.then((results) => {
// 			// Task entities found.		
// 			var entKeys = _.map(results[0], datastoreClient.KEY);
// 			datastoreClient.delete(entKeys).then(() => {
// 				logger.info('Cleared DB');
// 				createUser(testUser.email, testUser.username, testUser.googleID, callback);
// 			});
// 		});

// 	var completionCounter = 0;
// 	let callback = () => {
// 		for (var i = 0; i<30; i++) {
// 			console.log('calling save url');
// 			saveLink(googleID, 'www.randomurl.com', i, callback2);
// 		}
// 	};

// 	let callback2 = (error, user) => {
// 		if (completionCounter == 29) {
// 			done();
// 		} else {
// 			console.log(completionCounter);
// 			completionCounter++;
// 		}
// 	};
// });



// describe('logs out an email to this fake user and logs out deletion', () => {
// 	test('and both can\'t be tested well right now', done => {
// 		sendSavedArticlesJob();
// 		// done();
// 	});
// });

// afterAll((done) => {
// 	// Clears the database and adds some testing data.
// 	// Jest will wait for this promise to resolve before running tests.
// 	var allQuery = datastoreClient.createQuery(null, 'tabmailer_user').select('__key__');
// 	datastoreClient.runQuery(allQuery)
// 		.then((results) => {
// 			// Task entities found.		
// 			var entKeys = _.map(results[0], datastoreClient.KEY);
// 			datastoreClient.delete(entKeys).then(() => {
// 				logger.info('Cleared DB');
// 				done();
// 			});
// 		});
// });