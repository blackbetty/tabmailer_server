
var Signup_step1 = httpVueLoader('./pages/views/signup/signup1.vue');
var Signup_step2 = httpVueLoader('./pages/views/signup/signup2.vue');
var Signup_step3 = httpVueLoader('./pages/views/signup/signup3.vue');


var routes = [

	{ path: '/1', component: Signup_step1, alias: '/' },
	{ path: '/2', component: Signup_step2, props: { gapiObj: 'signupScreen.gapiObj' } },
	{ path: '/3', component: Signup_step3 }
];



// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = new VueRouter({
	routes: routes,
	// mode: 'history'
});


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
		gapiObject: '',
		slideCustom: null
	},
	methods: {
		emailChanged: function(newData) {
			this.email = newData;
		},
		usernameChanged: function(newData) {
			this.username = newData;
		}
	},
	computed: {
		isDisabled: function() {
			if (this.email && this.username && this.gapi_id_token && document.getElementById('email-address').validity.valid) {
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
}).$mount('#app-signup');