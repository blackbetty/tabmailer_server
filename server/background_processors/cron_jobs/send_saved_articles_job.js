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
	var linksToDeleteIDArray = _.flatten(_.map(userLinkCollectionObjectsArray, (userLinkCollectionObject) => {
		return _.map(userLinkCollectionObject.linkCollection, 'link_id');
	}));
	var userEmailsArray = _.map(userLinkCollectionObjectsArray, 'targetEmail');

	var log_msg = `Faked deleting links with IDs: ${linksToDeleteIDArray} for users: ${userEmailsArray}`;
	var log_level = 'info';

	if (process.env.LIVE_EMAIL == 'true') {
		log_level = 'info';
		log_msg = `Deleted links with IDs: ${linksToDeleteIDArray} for users: ${userEmailsArray}`;

		datastoreInterface.transaction(function (trx) {
			trx('links').whereIn('link_id', linksToDeleteIDArray).returning('link_id').delete()
				.then(
					(link_ids) => {
						log_msg = `Deleted links with IDs: ${link_ids} for users: ${userEmailsArray}`;
						trx.commit();
						logger.log(log_level, log_msg);
					}
				).catch((reason) => {
					logger.error('Deleting Links Failed: ' + reason);
					trx.rollback();
				});
		});
	} else {
		var x = 1;
		logger.log(log_level, log_msg);
		x = 2;
	}
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