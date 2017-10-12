// 0. If using a module system (e.g. via vue-cli), import Vue and VueRouter and then call `Vue.use(VueRouter)`.

// 1. Define route components.
// These can be imported from other files
var Signup_step1 = httpVueLoader('./pages/views/signup1.vue');
var Signup_step2 = httpVueLoader('./pages/views/signup2.vue');
var Signup_step3 = httpVueLoader('./pages/views/signup3.vue');

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
var routes = [

    { path: '/1', component: Signup_step1, alias: '/' },
    { path: '/2', component: Signup_step2, props: { gapiObj: 'signupScreen.gapiObj' } },
    { path: '/3', component: Signup_step3 }
]

// Vue.component('app-signup1', Signup_step1);
// Vue.component('app-signup2', Signup_step2);
// Vue.component('app-signup3', Signup_step3);


// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
    routes: routes
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
        gapi_id_token: '',
        gapi_user_given_name: '',
        gapi_user_email: '',
        signupButtonBorderColor: 'gray',
        gapiObject: ''
    },
    methods: {
        emailChanged: function(newData) {
            this.email = newData;
        },
        usernameChanged: function(newData) {
            this.username = newData;
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
    },
    components: {
        'appSignup1': Signup_step1,
        'appSignup2': Signup_step2,
        'appSignup3': Signup_step3
    }
}).$mount('#app-signup')