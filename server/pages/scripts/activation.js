new Vue({
	el: '#activation-app',
	components: {
		'activate-user': httpVueLoader('/pages/views/activation/activateUser.vue')
	}
});