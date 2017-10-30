const _ = require('lodash');
const logger = require('../logger.js');
var moment = require('moment');
var today = moment().format("dddd, MMMM Do, YYYY");
var Mailgen = require('mailgen');

var mailGenerator = new Mailgen({
	theme: 'default',
	product: {
		// Appears in header & footer of e-mails
		name: 'LinkMeLater',
		link: 'tabmailer-174400.appspot.com',
		logo: 'https://tabmailer-174400.appspot.com/pages/images/favicon.ico'
	}
});




function generate_list_element(linkObject) {
	var listItem = {
		button: {
			color: '#22BC66',
			text: linkObject.link_title,
			link: linkObject.link_url
		}
	}
	return listItem;
}
const generate_digest_body = function(linkObjectArray) {

	var emailBody = {
		body: {
			title: 'Your LinkMeLater Digest for ' + today,
			action: [],
			outro: 'Need help, or have questions? Just email me at dgolant@gmail.com for now, while I set up a better system :)'
		}
	};

	_.each(linkObjectArray, function(linkObject) {
		emailBody.action.push(generate_list_element(linkObject));
	});

	var emailBodyGenerated = mailGenerator.generate(emailBody);
	return emailBodyGenerated;
}
module.exports = generate_digest_body;