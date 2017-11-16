var cron = require('cron');
const _ = require('lodash');
require('dotenv').config();
const logger = require('../../utilities/logger.js');
const mailSender = require('../mail_sender.js');
var datastoreInterface = require('../../utilities/datastore_interface.js');
var moment = require('moment');
const EMAIL_MODE_INDIVIDUAL = 'individual';
// const EMAIL_MODE_DIGEST = 'digest';
// const util = require('util');
const getTodaysUserLinkCollectionObjectsArray = require('../user_selection_functions/pick_user_links_to_send.js');
const emailBodyGenerator = require('../../utilities/email_utilities/email_body_generator.js');
const dropOneMaxArticleFromListByUrlAndTitle = require('../../utilities/data_utilities/remove_article_list_entries_by_values.js');
const dropArticleByID = require('../../utilities/data_utilities/remove_article_list_entry_by_id.js');
var cryptFunctions = require('../../utilities/data_utilities/crypt_functions.js');


// a user object has the following keys in this context
//
//             targetEmail: user.emailaddress,
//             linkCollection:[],
//             emailMode: user.settings.email_format
//
const DIGEST_SUBJECT = 'Your LinkMeLater Digest For ';
const INDIVIDUAL_SUBJECT = 'Your LinkMeLater Link For ';


// I hate myself as I am writing this
async function removeSentArticles(userLinkCollectionObjectsArray) {

	function updateArticleList(userObject) {
		// need to do this because the fetch returns an array
		// since the SELECT is technically not unique
		if (process.env.LIVE_EMAIL == 'true') {
			userObject = userObject[0];
			// replace this with a WHERE/FILTER at some point
			_.each(userLinkCollectionObjectsArray, function (userLCO) {
				if (userLCO.targetEmail == userObject.emailaddress) {
					_.each(userLCO.linkCollection, function (linkObject) {
						if(linkObject.link_id){
							userObject.article_list = dropArticleByID(userObject.article_list, linkObject.link_id);
						} else {
							// eventually I can remove this condition because all articles will have IDs
							
							userObject.article_list = dropOneMaxArticleFromListByUrlAndTitle(userObject.article_list, cryptFunctions.encrypt(linkObject.link_url), cryptFunctions.encrypt(linkObject.link_title));
						}
					});
				}
			});
			datastoreInterface.setValueForProperty(userObject, 'article_list', userObject.article_list, function (user) {
				logger.info(`Updated user "${user.username}" link collection to remove sent links`);
			});
		} else {
			userObject = userObject[0];
			// replace this with a WHERE/FILTER at some point
			_.each(userLinkCollectionObjectsArray, function (userLCO) {
				if (userLCO.targetEmail == userObject.emailaddress) {
					_.each(userLCO.linkCollection, function (linkObject) {
						
						if (linkObject.link_id) {
							logger.debug(`+Faked Deleting Article by ID ${linkObject.link_id} and title ${linkObject.link_title}`);
						} else {
							// eventually I can remove this condition because all articles will have IDs
							logger.debug(`Faked Deleting Article with url ${linkObject.link_url} and title ${linkObject.link_title}`);
						}

					});
				}
			});
			datastoreInterface.setValueForProperty(userObject, 'article_list', userObject.article_list, function (user) {
				logger.info(`Updated user "${user.username}" link collection to remove sent links`);
			});
		}
	}




	_.each(userLinkCollectionObjectsArray, function (userLCO) {

		datastoreInterface.fetchUserForPropertyAndValue('emailaddress', userLCO.targetEmail, updateArticleList);
	});
}
async function sendUserLinksJob() {
	var today = moment().format('dddd, MMMM Do, YYYY');
	var userLinkCollectionObjectsArray = await getTodaysUserLinkCollectionObjectsArray();
	try {
		var finalRecipientContentDataObject = await emailBodyGenerator.buildLMLEmailBodyCollection(userLinkCollectionObjectsArray);
	} catch (error) {
		logger.error('Generating email bodies failed for some reason:\n\t \t  ' + error);
		return;
	}

	// console.log("Final Recipient Object: " + util.inspect(finalRecipientContentDataObject));
	_.each(finalRecipientContentDataObject, function (user) {
		var subject = user.emailMode == EMAIL_MODE_INDIVIDUAL ? INDIVIDUAL_SUBJECT : DIGEST_SUBJECT;
		if (user.emailBodyCollection.length != 0 && user.linkCollection.length != 0) {
			_.each(user.emailBodyCollection, function (emailBody) {
				mailSender.sendEmail(user.targetEmail, subject + today, emailBody);
			});
		}
	});

	// this needs to be fixed at some point

	removeSentArticles(userLinkCollectionObjectsArray);
}


module.exports = sendUserLinksJob;