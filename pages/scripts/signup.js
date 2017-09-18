
// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
const Foo = { template: '<div>foo</div>' }
const Bar = { template: '<div>bar</div>' }

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
  routes: routes // short for `routes: routes`
})


var signupScreen = new Vue({
    el: '#app-signup',
    router: router,
    data: {
        email: '',
        password: '',
        username: '',
        signUpRequestComplete: false,
        completionMessage: '',
        gapi_id_token:'',
        gapi_user_given_name:'',
        gapi_user_email:'',
        signupButtonBorderColor: 'gray'
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
                this.signupButtonBorderColor = 'black';
                return false;
            }
            this.signupButtonBorderColor = 'gray';
            return true;
        }
    }
})