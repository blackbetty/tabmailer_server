var gAuthInstance;
const FETCH_USER_TABS_URL = '/linksforuser';
const FETCH_USER_SETTINGS_URL = '/settings';

// runs immediately when gapi loads
var loadGapi = function() {
    gapi.load('client:auth2', {
        callback: function() {
            gapi.auth2.init().then(function() {
                gAuthInstance = gapi.auth2.getAuthInstance();

                if (gAuthInstance.isSignedIn.get()) {
                    console.log('this line got hit');
                    var googleUser = gAuthInstance.currentUser.get();
                    dashboardVueInstance.onSignIn(googleUser);
                } else {

                    gAuthInstance.signIn().then(function(googleUser) {
                        console.log(googleUser);
                        dashboardVueInstance.onSignIn(googleUser);

                    });
                }
            });
        },
        onerror: function() {
            // Handle loading error.
            alert('gapi.client failed to load!');
        },
        timeout: 5000, // 5 seconds.
        ontimeout: function() {
            // Handle timeout.
            alert('gapi.client could not load in a timely manner!');
        }
    });
}


// event bus instance
const EventBus = new Vue();

// This flow's parent component
var dashboardVueInstance = new Vue({
    el: '#app-dashboard',
    components: {
        'user-settings': httpVueLoader('/pages/views/dashboard/userSettings.vue'),
        'user-saved-tabs': httpVueLoader('/pages/views/dashboard/userSavedTabs.vue')
    },
    data: function() {
        return {
            showSettings: false,
            showTabHeap: false,
            credentialError: false
        }
    },
    methods: {
        onSignIn: function(googleUser) {
            var id_token = googleUser.getAuthResponse().id_token;
            //this call always hits production data (for now)
            this.sendRequestWithGoogleIDToken('GET', FETCH_USER_TABS_URL, id_token, function(success, res) {
                console.log('TABS reponse received!');
                if (success) {
                    console.log('TABS reponse true!');
                    EventBus.$emit('tabsLoadedEvent', JSON.parse(res).article_list, function() {
                        console.log('tabheapshown');
                        dashboardVueInstance.showTabHeap = true;
                    });
                } else {
                    console.log('TABS reponse false!');

                    // credentialErrorFillerVar Eventually this will have to be an actual functionality
                    var credentialErrorFillerVar = false;
                    if (credentialErrorFillerVar) {
                        dashboardVueInstance.credentialError = true;
                    }
                    console.log(res);
                }
            })
            this.sendRequestWithGoogleIDToken('GET', FETCH_USER_SETTINGS_URL, id_token, function(success, res) {
                console.info('SETTINGS reponse received!');
                if (success) {
                    console.info('SETTINGS reponse true!');
                    dashboardVueInstance.showSettings = true;
                } else {
                    console.info('SETTINGS reponse false!');
                    // credentialErrorFillerVar Eventually this will have to be an actual functionality
                    var credentialErrorFillerVar = false;
                    if (credentialErrorFillerVar) {

                        dashboardVueInstance.credentialError = true;
                    }
                }
            })
        },
        sendRequestWithGoogleIDToken: function(method, url, google_id_token, callback) {
            var xhr = new XMLHttpRequest();
            var req_body = {};
            if (method === "GET") {
                var urlWithParams = url + "?google_auth_token=" + google_id_token;
                // console.log(urlWithParams);
                xhr.open(method, urlWithParams, true);

            } else {
                console.log(google_id_token);
                req_body['google_auth_token'] = google_id_token;
                // console.log(req_body);
                xhr.open(method, url, true);

            }
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onload = function() {
                if (this.status === 401 && retry) {
                    // This status may indicate that the cached
                    // access token was invalid. Retry once with
                    // a fresh token.
                    retry = false;
                    return;
                } else if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                    callback(true, xhr.response);
                } else if (this.readyState == XMLHttpRequest.DONE && this.status != 200) {
                    console.log(xhr.response);
                    callback(false, xhr.reponse);
                }
            }

            // relies on req_body being undefined in the case of a get, sends an empty body
            // which on a GET gets ignored anyway
            xhr.send(JSON.stringify(req_body));
        }

    },
    mounted: function() {}
});