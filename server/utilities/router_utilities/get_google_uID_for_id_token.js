const logger = require('../logger.js');
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
const gapiClient = new auth.OAuth2(process.env.GAPI_CLIENT_ID, '', '');

module.exports = function(id_token) {
    return new Promise((resolve, reject) => {
        gapiClient.verifyIdToken(
            id_token,
            process.env.GAPI_CLIENT_ID,
            function(error, login) {
                if (e) {
                    logger.debug(`Fetching googleUserID for ID Token ${id_token} failed`, {
                        error_response: e
                    });
                    reject(e);
                } else {
                    var payload = login.getPayload();
                    if (payload.error) {
                        logger.debug(`Fetching googleUserID for ID Token ${id_token} failed`, {
                            error_response: payload.error
                        });
                        reject(payload.error);
                    } else {
                        resolve(payload['sub']);
                    }
                }

            });
    });
}