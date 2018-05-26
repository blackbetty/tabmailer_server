var gAuthInstance;
const FETCH_USER_TABS_URL = '/linksforuser';
const FETCH_USER_SETTINGS_URL = '/settings';


// event bus instance
const EventBus = new Vue();

// This flow's parent component
var dashboardVueInstance = new Vue({
	el: '#app-dashboard',
	components: {
		'user-settings': httpVueLoader('/pages/views/dashboard/userSettings.vue'),
		'user-saved-tabs': httpVueLoader('/pages/views/dashboard/userSavedTabs.vue')
	},
	created: function(){
	},
	data: function() {
		return {
			showSettings: false,
			showTabHeap: false,
			credentialError: false
		};
	},
	methods: {
		loadSettings: function () {			
			this.sendRequest('GET', FETCH_USER_SETTINGS_URL, function (success, res) {

				if (success) {

					EventBus.$emit('settingsLoadedEvent', JSON.parse(res), function () {

						dashboardVueInstance.showSettings = true;
					});
				} else {

					// credentialErrorFillerVar Eventually this will have to be an actual functionality
					var credentialErrorFillerVar = false;
					if (credentialErrorFillerVar) {

						dashboardVueInstance.credentialError = true;
					}
				}
			});
		},
		sendRequest: function(method, url, callback) {
			var xhr = new XMLHttpRequest();
			var req_body = {};
			xhr.open(method, url, true);
			xhr.setRequestHeader('Content-Type', 'application/json');
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

					callback(false, xhr.reponse);
				}
			};

			// relies on req_body being undefined in the case of a get, sends an empty body
			// which on a GET gets ignored anyway
			xhr.send(JSON.stringify(req_body));
		}

	},
	mounted: function() {
		this.loadSettings();
	}
});