<template>
    <div>
        <div class="dashboard-component-container border-secondary rounded">
            <div class="dashboard-component-header settings-header">
                <h2 class="display-5" style="display: inline">Settings <small style="color: lightgrey">(WIP + Disabled)</small> </h2>
                <hr>
            </div>
            <div v-if="showSettings">
                <div class="dashboard-component-body settings-body disabledDiv">
                    <div class="form-group">
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
                        <br>
                        <label for="tab-closure-container">Close tab on saving</label>
                        <div id="tab-closure-container" class="container-fluid">
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="radio" name="tabClosureRadios" id="tabClosureRadios1" value="true" checked> Yes
                                </label>
                            </div>
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="radio" name="tabClosureRadios" id="tabClosureRadios2" value="false"> No
                                </label>
                            </div>
                        </div>
                        <br>
                        <label for="email-format-container">Email format:</label>
                        <div id="email-format-container" class="container-fluid">
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="radio" name="emailFormatRadios" id="emailFormatRadios1" value="individual" checked> Individual Links
                                </label>
                            </div>
                            <div class="form-check">
                                <label class="form-check-label">
                                    <input class="form-check-input" type="radio" name="emailFormatRadios" id="emailFormatRadios2" value="digest"> Digest Mode
                                </label>
                            </div>
                        </div>
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
                        <button :disabled="!emailButtonEnabled" type="submit" class="btn btn-primary">Save And Send Confirmation</button>
                        <br>
                        <br>
                    </div>
                </div>
            </div>
            <div class="flexbox" v-else>
                <div class="loader">
                    Loading....
                </div>
            </div>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: ['showSettings'],
    created: function() {
        EventBus.$on('settingsLoadedEvent', (settings, callback) => {
            // console.log('settingsLoadedEvent triggered and responded to by child!');
            this.setSettingsData(settings, callback);
        });
    },
    data: function() {
        return {
            dropdownMenuShow: false,
            dropdownSelected: 'Daily',
            userEmail: '',
            closeTabSetting: true,
            emailFormatSetting: 'individual',
            emailFrequencySetting: 'DAILY',
            emailValid: false
        }
    },
    methods: {
        setDropdownSelected: function(val) {
            this.dropdownSelected = val;
            this.dropdownMenuShow = false;
        },
        is_email: function(email) {
            var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            return emailReg.test(email);
        },
        setSettingsData: function(settingsObj, callback) {

            // If it's empty, we just leave the data at the defaults
            if (Object.keys(settingsObj).length === 0 &&
                settingsObj.constructor === Object) {
                // leave default
            } else {
                this.closeTabSetting = settingsObj.close_tab;
                this.emailFormatSetting = settingsObj.email_format;
                this.emailFrequencySetting = settingsObj.frequency;
            }
            callback();
        }
    },
    mounted: function() {

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