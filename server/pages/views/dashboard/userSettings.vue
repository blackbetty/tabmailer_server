<template>
	<div>
		<transition name="expand">
			<div class="settingsChangedAlert alert alert-success alert-dismissible fade show" v-if="settingsUpdateSucceeded" role="alert">
				<button type="button" class="close" v-on:click="settingsUpdateSucceeded=false" data-dismiss="alert" aria-label="Close">
					<span aria-hidden="true">&times;</span>
				</button>
				<strong>Settings Updated Successfully!</strong>
			</div>
		</transition>
		<div class="settingsChangedAlert alert alert-danger alert-dismissible fade show" v-if="settingsUpdateFailed" role="alert">
			<button type="button" class="close" v-on:click="settingsUpdateFailed=false" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
			<strong>Something went wrong updating your settings...</strong> please try again later
		</div>
		<div class="dashboard-component-container border-secondary rounded">
			<div class="dashboard-component-header settings-header">
				<h2 class="display-5" style="display: inline">Settings</h2>
				<hr>
			</div>
			<div v-if="showSettings">
				<div class="dashboard-component-body settings-body">
					<div class="form-group">
						<br>
						<div>
							<label for="email-format-container">Email format:</label>
							<div id="email-format-container" class="container-fluid">
								<div class="form-check">
									<label class="form-check-label">
										<input class="form-check-input" type="radio" name="emailFormatRadios" id="emailFormatRadios1" value="INDIVIDUAL" v-model="emailFormatSetting" checked> Individual Links
									</label>
								</div>
								<div class="form-check">
									<label class="form-check-label">
										<input class="form-check-input" type="radio" name="emailFormatRadios" id="emailFormatRadios2" value="DIGEST" v-model="emailFormatSetting"> Digest Mode
									</label>
								</div>
							</div>
						</div>
						<!-- <div class="disabledDiv">
							<p>Coming soon....</p>
							<label for="email-dropdown-container">How frequently do you want TabMailer to check your account?</label>
							<div class="dropdown-container" id="email-dropdown-container">
								<button @click="dropdownMenuShow = !dropdownMenuShow">
									{{ dropdownSelected }}
								</button>
								<i class="fa fa-caret-down" aria-hidden="true"></i>
								<div class="dd" v-if="dropdownMenuShow">
									<div @click="setDropdownSelected('Daily')" class="disabled">
										<span>Daily</span>
									</div>
									<div @click="setDropdownSelected('Weekly')" class="disabled">
										<span>Weekly</span>
									</div>
									<div @click="setDropdownSelected('Monthly')" class="disabled">
										<span>Monthly</span>
									</div>
								</div>
							</div>
						</div> -->
						<!-- <br> -->
						<br>
						<hr>
						<br>
						<label for="targetEmailSetting">Email address</label>
						<input v-model="userEmail" type="email" class="form-control" id="targetEmailSetting" aria-describedby="emailHelp" placeholder="Enter new email">
						<small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
						<br>
						<div class="alert alert-info" v-if="userEmail.trim()!=''" role="alert">
							<strong>Heads up!</strong> Due to security concerns, you must press the above button and confirm any changes to your email settings. All other settings auto-save.
						</div>
						<button v-on:click="handleEmailSettingChanges" :disabled="!emailButtonEnabled" type="submit" class="btn btn-primary">Save And Send Confirmation</button>
						<br>
						<br>
					</div>
				</div>
			</div>
			<div class="flexbox" v-else>
				<img class="dash-loader" src="/pages/images/loader.svg"/>
			</div>
		</div>
	</div>
</template>
<script>
const POST_USER_SETTINGS_URL = '/settings';
const POST_USER_EMAIL_URL = '/email';
module.exports = {
	props: ['showSettings'],
	created: function() {
		EventBus.$on('settingsLoadedEvent', (settings, callback) => {
			this.setSettingsData(settings, callback);
		});
	},
	data: function() {
		return {
			dropdownMenuShow: false,
			dropdownSelected: 'Daily',
			userEmail: '',
			closeTabSetting: true,
			emailFormatSetting: 'INDIVIDUAL',
			emailFrequencySetting: 'DAILY',
			emailValid: false,
			settingsUpdateSucceeded: false,
			settingsUpdateFailed: false
		}
	},
	methods: {
		setDropdownSelected: function(val) {
			this.dropdownSelected = val;
			this.dropdownMenuShow = false;
		},
		is_email: function(email) {
			// stolen from SO because I hate regexes
			var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			return emailReg.test(email);
		},
		sendRequestWithGoogleIDToken: function(method, url, google_id_token, postKey, postValue, callback) {
			var xhr = new XMLHttpRequest();
			var req_body = {};
			if (method === "GET") {
				var urlWithParams = url + "?google_id_token=" + google_id_token;

				xhr.open(method, urlWithParams, true);

			} else {

				req_body['google_id_token'] = google_id_token;
				req_body[postKey] = postValue;
				req_body['newKey'] = postKey;
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

					callback(false, xhr.reponse);
				}
			}

			// relies on req_body being undefined in the case of a get, sends an empty body
			// which on a GET gets ignored anyway
			xhr.send(JSON.stringify(req_body));
		},
		postSettingsChange: function(settingName, settingValue, callback) {
			var scopedPost = id_token => {
				this.sendRequestWithGoogleIDToken('POST',
					POST_USER_SETTINGS_URL,
					id_token,
					settingName,
					settingValue,
					function(success, res) {
						callback(success, res);
					}
				);
			}
			if (gAuthInstance.isSignedIn.get()) {
				var googleUser = gAuthInstance.currentUser.get();
				//just so I don't have two massive blocks that do the same thing
				scopedPost(googleUser.getAuthResponse().id_token);
			} else {
				gAuthInstance.signIn().then(function(googleUser) {
					scopedPost(googleUser.getAuthResponse().id_token);
				});
			}
		},
		postEmailChange: function(emailValue, callback) {
			var scopedPost = id_token => {
				this.sendRequestWithGoogleIDToken('POST',
					POST_USER_EMAIL_URL,
					id_token,
					'emailaddress',
					emailValue,
					function(success, res) {
						callback(success, res);
					}
				);
			}
			if (gAuthInstance.isSignedIn.get()) {
				console.log('hit Gauth Instance ');
				var googleUser = gAuthInstance.currentUser.get();
				//just so I don't have two massive blocks that do the same thing
				scopedPost(googleUser.getAuthResponse().id_token);
			} else {
				console.log('hit Gauth Instance ');
				gAuthInstance.signIn().then(function(googleUser) {
					scopedPost(googleUser.getAuthResponse().id_token);
				});
			}
		},
		handleTabSettingChanges: function(setting, previousSetting) {

			this.postSettingsChange('close_tab', setting, (success, response) => {
				if (success) {

					this.settingsUpdateSucceeded = true;

					setTimeout(() => {
						this.settingsUpdateSucceeded = false;
					}, 2000);
				} else {
					this.settingsUpdateFailed = true;

					setTimeout(() => {
						this.settingsUpdateFailed = false;
					}, 2000);
				}
			});
		},
		handleEmailFormatChanges: function(setting, previousSetting){
			this.postSettingsChange('email_format', setting, (success, response) => {
				if (success) {

					this.settingsUpdateSucceeded = true;

					setTimeout(() => {
						this.settingsUpdateSucceeded = false;
					}, 2000);
				} else {
					this.settingsUpdateFailed = true;

					setTimeout(() => {
						this.settingsUpdateFailed = false;
					}, 2000);
				}
			});
		},
		handleEmailSettingChanges: function() {

			this.postEmailChange(this.userEmail, (success, response) => {
				if (success) {
					this.settingsUpdateSucceeded = true;

					setTimeout(() => {
						this.settingsUpdateSucceeded = false;
					}, 2000);
				} else {
					this.settingsUpdateFailed = true;

					setTimeout(() => {
						this.settingsUpdateFailed = false;
					}, 2000);
				}
			});
		},
		setSettingsData: function(settingsObj, callback) {

			// If it's empty, we just leave the data at the defaults
			if (Object.keys(settingsObj).length === 0 && settingsObj.constructor === Object) {
				// leave default
				this.unwatchSettings = this.$watch('closeTabSetting', this.handleTabSettingChanges);
				this.unwatchSettings = this.$watch('emailFormatSetting', this.handleEmailFormatChanges);
			} else {
				this.closeTabSetting = settingsObj.close_tab;
				this.emailFormatSetting = settingsObj.email_format;
				this.emailFrequencySetting = settingsObj.run_frequency;
				this.unwatchSettings = this.$watch('closeTabSetting', this.handleTabSettingChanges);
				this.unwatchSettings = this.$watch('emailFormatSetting', this.handleEmailFormatChanges);
				// Will add these back in once they do something
				// this.$watch('emailFrequencySetting', this.handleSettingsChanges);
			}
			callback();
		}
	},
	destroyed: function() {
		// this.unwatchSettings();

	},
	computed: {
		emailButtonEnabled: function() {
			if (this.is_email(this.userEmail.trim())) {
				return true;
			}
			return false;
		}
	},
	updated: function() {}
}
</script>