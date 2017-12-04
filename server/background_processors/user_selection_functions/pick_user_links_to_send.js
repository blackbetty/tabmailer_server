require('dotenv').config();
var datastore_interface = require('../../utilities/datastore_interface.js');
const _ = require('lodash');
// var mail_sender = require('./mail_sender.js');
var moment = require('moment');
const logger = require('../../utilities/logger.js');
var cryptFunctions = require('../../utilities/data_utilities/crypt_functions.js');
const fetchAllActivatedUsers = require('../../utilities/data_utilities/fetch_activated_users.js');



function hasWhiteSpace(s) {
	return /\s/g.test(s);
}


// function filterUsersForDeliveryPreferenceMatch(users) {

// 	// Filter out users who shouldn't even be considered for an email today

// 	var dailyRecipients = _.filter(users, (user) => {
// 		return user.settings.frequency === 'DAILY';
// 	});

// 	var weeklyRecipientsForToday = _.filter(users, (user) => {
// 		return (user.settings.frequency === 'WEEKLY' && user.settings.frequency_day == moment().day());
// 	});

// 	var monthlyRecipientsForToday = _.filter(users, (user) => {
// 		return (user.settings.frequency === 'MONTHLY' && user.settings.frequency_day == moment().day());
// 	});

// 	var allValidRecipients = dailyRecipients.concat(weeklyRecipientsForToday, monthlyRecipientsForToday);
// 	return allValidRecipients;
// }
async function getActiveUsers() {
	logger.debug('Fetching active users initiated...');
	try {
		var activeUsers = await fetchAllActivatedUsers();
	} catch (error) {
		if (error) {
			logger.error('Error occurred while fetching activated users: ' + error);
		} else {
			logger.warning('Fetching all activated users returned no users');
		}
	}
	return activeUsers;
}

// outputs an array of recipients, their collections of links, and their email modes
// articles returned are at least a day old
function createDailyRandomLinkCollectionObjectCollection(users) {

	var linkCollectionObjectCollection = [];
	_.each(users, function (user) {
		var linkCollectionObject = {
			targetEmail: user.user_email,
			linkCollection: [],
			emailMode: user.settings.email_format
		};
		// not implemented yet
		var sendProbability = user.settings.send_probability ? user.settings.send_probability : 7;

		// if we're running in test mode might as well give us a 1/2 probability
		// need to fix this to be more deterministic later
		sendProbability = (process.env.LIVE_EMAIL != 'true') ? 1 : sendProbability;
		_.each(user.link_array, function (article) {
			// Article is at least a day old
			if (article.link_date_created < (Date.now() - 86400000)) {
				var sendDecision = Math.floor(Math.random() * sendProbability) + 1;
				logger.silly(`For user "${user.user_email}" sendDecision var is ${sendDecision} and sendProbability is ${sendProbability}`);
				if (sendDecision === sendProbability) {

					var articleObject = {
						link_url: cryptFunctions.decrypt(article.link_url),
						link_title: cryptFunctions.decrypt(article.link_title),
						link_id: article.link_id
					};
					
					linkCollectionObject.linkCollection.push(articleObject);
				}
			}
		});
		linkCollectionObjectCollection.push(linkCollectionObject);
	});
	return linkCollectionObjectCollection;
}






module.exports = async function () {
	var users = await getActiveUsers();
	// filter out all users who have 0 links preemptively, 
	// this may be unecessary with the SQL implementation
	var usersWithArticles = _.reject(users, (user) => {
		user.link_array.length === 0;
	});

	// Gets all users whose delivery preferences match today
	// deactivated for now because it requires re-work in SQL for a feature that I am 
	// not supporting yet
	// var allValidPotentialRecipients = filterUsersForDeliveryPreferenceMatch(usersWithArticles);
	var allValidPotentialRecipients = usersWithArticles;
	//OK I need to work on these names...
	var userLinkCollectionObjectCollectionForToday = createDailyRandomLinkCollectionObjectCollection(allValidPotentialRecipients);
	return userLinkCollectionObjectCollectionForToday;
};