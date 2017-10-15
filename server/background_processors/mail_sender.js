'use strict';
const nodemailer = require('nodemailer');
const os = require('os');
require('dotenv').config();
var mg = require('nodemailer-mailgun-transport');
const util = require('util');

// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
var auth = {
    auth: {
        api_key: process.env.MAILGUNKEY,
        domain: process.env.MAILGUNDOMAIN, //'sandbox3249234.mailgun.org'
        port: 2525
    }
}

var nodemailerMailgun = nodemailer.createTransport(mg(auth));

var mail_sender = {
    sendEmail: function(emailRecipient, subject, emailBody, callback) {
        console.log('EMAIL SENDING... ');
        console.log(emailRecipient);
        nodemailerMailgun.sendMail({
            from: 'TABMAILERADMIN@dangolant.rocks',
            to: emailRecipient, // An array if you have multiple recipients.
            subject: subject,
            text: emailBody,
        }, function(err, info) {
            if (err) {
                console.log('Error: ' + err);
            } else {
                console.log('-----------EMAIL SENT-----------');
                console.log('Response: ' + util.inspect(info));
            }
        });
    }


}



module.exports = mail_sender;