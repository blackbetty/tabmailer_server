const request = require('request');
const logger = require('../logger.js');



module.exports = function(accessToken) {
    return new Promise((resolve, reject) => {

        var options = {
            url: 'https://www.googleapis.com/oauth2/v1/userinfo',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        };
        request(options, (error, response, body) => {
            if (error) {
                logger.debug(`Fetching googleUserID for access token ${accessToken} failed`, {
                    error_response: response
                });
                reject(error);
            } else {
                body = JSON.parse(body);
                // body.id is a googleUserID;
                resolve(body.id);
            }
        });
    });
}