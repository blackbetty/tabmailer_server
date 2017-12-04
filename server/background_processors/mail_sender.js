require('dotenv').config();
'use strict';
const nodemailer = require('nodemailer');
require('dotenv').config();
var mg = require('nodemailer-mailgun-transport');
const util = require('util');
const logger = require('../utilities/logger.js');



// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
	auth: {
		api_key: process.env.MAILGUNKEY,
		domain: process.env.MAILGUNDOMAIN, //'sandbox3249234.mailgun.org'
		port: 2525
	}
};

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

var testSend = function(emailRecipient, subject, emailBody, callback) {
	logger.info(`FAKING Sending email to ${emailRecipient}... `);
	logger.info('-----------EMAIL FAKED-----------');
	logger.info('Faked Body for user '+emailRecipient+':\n\t\t ' + emailBody
        +'\n\t\t -----------END FAKE-----------\n');
};
var liveSend = function(emailRecipient, subject, emailBody, callback) {
	logger.info(`Sending email to ${emailRecipient}... `);
	nodemailerMailgun.sendMail({
		from: 'LinkMeLater@dangolant.rocks',
		to: emailRecipient, // An array if you have multiple recipients.
		subject: subject,
		html: emailBody,
	}, function(err, info) {
		if (err) {
			logger.error('Error: ' + err);
		} else {
			logger.info('-----------EMAIL SENT-----------');
			logger.info('Response: ' + util.inspect(info));
		}
	});
};
var mail_sender = {

	sendEmail: function(emailRecipient, subject, emailBody, callback) {
		if (process.env.LIVE_EMAIL == 'true') {

			liveSend(emailRecipient, subject, emailBody, callback);
		} else {
			testSend(emailRecipient, subject, emailBody, callback);
		}
	}


};



module.exports = mail_sender;