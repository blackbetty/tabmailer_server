var auth_container = httpVueLoader('./pages/views/login/oauth_container.vue');


var loginScreen = new Vue({
	el: '#app-login',
	components: {
		'auth-container': httpVueLoader('/pages/views/login/oauthContainer.vue')
	},
	data: function(){
		return {};
	},
	methods: {
		
	},
	computed: {
		
	}
}).$mount('#app-login');