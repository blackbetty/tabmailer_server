var cron = require('cron');
const _ = require('lodash');
require('dotenv').config();
const logger = require('../../utilities/logger.js');
const mailSender = require('../mail_sender.js');
var datastoreInterface = require('../../utilities/datastore_interface.js');
var moment = require('moment');
const EMAIL_MODE_INDIVIDUAL = 'individual';
const EMAIL_MODE_DIGEST = 'digest';
const util = require('util');
var today = moment().format("dddd, MMMM Do, YYYY");
const getTodaysUserLinkCollectionObjectsArray = require('../user_selection_functions/pick_user_links_to_send.js');
const emailBodyGenerator = require('../../utilities/email_utilities/email_body_generator.js');
const dropOneMaxArticleFromListByUrlAndTitle = require('../../utilities/data_utilities/remove_article_list_entries_by_values.js')


// a user object has the following keys in this context
//
//             targetEmail: user.emailaddress,
//             linkCollection:[],
//             emailMode: user.settings.email_format
//
const DIGEST_SUBJECT = 'Your LinkMeLater Digest For ' + today;
const INDIVIDUAL_SUBJECT = 'Your LinkMeLater Link For ' + today;


// I hate myself as I am writing this
async function removeSentArticles(userLinkCollectionObjectsArray) {

	function updateArticleList(userObject) {
		// need to do this because the fetch returns an array
		// since the SELECT is technically not unique
		userObject = userObject[0];
		// replace this with a WHERE/FILTER at some point
		_.each(userLinkCollectionObjectsArray, function(userLCO) {
			if (userLCO.targetEmail == userObject.emailaddress) {
				_.each(userLCO.linkCollection, function(linkObject) {
					userObject.article_list = dropOneMaxArticleFromListByUrlAndTitle(userObject.article_list, linkObject.link_url, linkObject.link_title);
				});
			}
		});
		datastoreInterface.setValueForProperty(userObject, 'article_list', userObject.article_list, function(user) {
			logger.info(`Updated user "${userObject.username}" link collection to remove sent links`);
		})
	}




	_.each(userLinkCollectionObjectsArray, function(userLCO) {
		datastoreInterface.fetchUserForPropertyAndValue('emailaddress', userLCO.targetEmail, updateArticleList);
	});
}
async function sendUserLinksJob() {
	var userLinkCollectionObjectsArray = await getTodaysUserLinkCollectionObjectsArray();
	try {
		var finalRecipientContentDataObject = await emailBodyGenerator.buildLMLEmailBodyCollection(userLinkCollectionObjectsArray);
	} catch (error) {
		logger.error("Generating email bodies failed for some reason:\n\t \t  " + error);
		return;
	}

	// console.log("Final Recipient Object: " + util.inspect(finalRecipientContentDataObject));
	_.each(finalRecipientContentDataObject, function(user) {
		var subject = user.emailMode == EMAIL_MODE_INDIVIDUAL ? INDIVIDUAL_SUBJECT : DIGEST_SUBJECT;
		if (user.emailBodyCollection.length != 0 && user.linkCollection.length !=0) {
			_.each(user.emailBodyCollection, function(emailBody) {
				mailSender.sendEmail(user.targetEmail, subject, emailBody);
			});
		}
	});

	// this needs to be fixed at some point
	if (process.env.LIVE_EMAIL == 'true') {
		removeSentArticles(userLinkCollectionObjectsArray);
	} else {
		logger.info(`FAKE removed sent links`);
	}

}

module.exports = new cron.CronJob('0 0 * * *', sendUserLinksJob, null, true, 'America/Los_Angeles');