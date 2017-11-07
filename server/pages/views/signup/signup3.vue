<template>
    <div class="signup step3">
        <div v-if="!completionMessage">
            <div class="form-group">
                <p style="color: rgba(0, 0, 0, 0.4)">Aaaaaand finally, all we need is the email at which you would like to receive your saved tabs when they are ready!</p>
                <br>
                <label for="email-address">Email Address:</label>
                <input class="form-control border border-primary rounded" placeholder="Your Email Address" type="email" @input="emailChanged" name="email-address" id="email-address">
            </div>
            <button class="btn btn-success btn-block" type="button" v-on:click="signupButtonSubmit" :disabled="isDisabled"> Click Here To Complete Sign Up!
            </button>
            <router-link class="btn btn-danger btn-block" to="/2">
                <i class="fa fa-arrow-left" aria-hidden="true"></i>
                BACK
            </router-link>
        </div>
        <div v-else>
            <div class="completionContainer alert" v-if="signupCompleted" v-bind:class="{ 'alert-success': completionSuccess, 'alert-danger': !completionSuccess }" role="alert">
                {{completionMessage}}
            </div>
            <div class="completionSuccess" v-if="signupCompleted && completionSuccess">
                <a href="/dashboard" class="btn btn-primary btn-block">
                    Account Settings
                </a>
            </div>
        </div>
    </div>
</template>
<script>
// import default as gapi from 'https://apis.google.com/js/platform.js'

module.exports = {
    data: function() {
        return {
            completionMessage: null,
            completionSuccess: false,
			signupCompleted: false
        }
    },
    computed: {
        isDisabled: function() {
            if (
                this.$parent.email &&
                document.getElementById("email-address") &&
                document.getElementById("email-address").value
            ) {
                return false;
            }

            if (document.getElementsByClassName("rlink")[0]) {
                document.getElementsByClassName("rlink")[0].style.cursor = "pointer";
                return true;
            }
        }
    },
    methods: {
        signupButtonSubmit: function() {
            var request = new XMLHttpRequest();
            request.open("POST", '/createUser', true);
            request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            var that = this;

            request.onreadystatechange = function() { //Call a function when the state changes.
                that.signUpRequestComplete = true;
                if (request.readyState == XMLHttpRequest.DONE && request.status == 200) {
                    // Request finished and returned 200

                    that.completionMessage = 'Thanks for signing up, look for an activation email in your inbox!';
                    that.completionSuccess = true;
					that.signupCompleted = true;
                } else if (request.readyState == XMLHttpRequest.DONE && request.status != 200) {
                    // Request finished and return a non-200
                    that.completionMessage = 'There was an issue signing up, please try again later.';
                    that.signupCompleted = true;
					that.completionSuccess = false;
                }
            }

            request.send(JSON.stringify({
                gapi_given_name: this.$parent.gapi_user_given_name,
                google_id_token: this.$parent.gapi_id_token,
                gapi_user_email: this.$parent.gapi_user_email,
                username: this.$parent.username,
                emailaddress: this.$parent.email
            }));
        },
        emailChanged: function(e) {
            this.$emit('email-changed', e.target.value);
        }
    },
    mounted: function() {}
}
</script>