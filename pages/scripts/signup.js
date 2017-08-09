var signupScreen = new Vue({
    el: '#app-signup',
    data: {
        email: '',
        password: '',
        username: '',
        signUpRequestComplete: false,
        completionMessage: '',
        gapi_id_token:'',
        gapi_user_given_name:'',
        gapi_user_email:''
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
                } else if (request.readyState == XMLHttpRequest.DONE && request.status != 200) {
                    // Request finished and return a non-200
                    that.completionMessage = 'There was an issue signing up, please try again later.';
                }
            }

            request.send(JSON.stringify({
                gapi_given_name: this.gapi_user_given_name,
                gapi_token: this.gapi_id_token,
                gapi_user_email: this.gapi_user_email,
                username: this.username,
                emailaddress: this.email
            }));
        },
        onSignIn: function(googleUser) {
            var profile = googleUser.getBasicProfile();
            var id_token = googleUser.getAuthResponse().id_token;

            this.gapi_id_token = id_token;
            this.gapi_user_email = profile.getEmail();
            this.gapi_user_given_name = profile.getName();
        }
    },
    computed: {
        isDisabled: function() {
            if (this.email && this.username && this.gapi_id_token && document.getElementById("email-address").validity.valid) {
                return false;
            }
            return true;
        }
    }
})