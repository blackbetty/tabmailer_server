new Vue({
    el: '#app-dashboard',
    components: {
        'user-settings': httpVueLoader('/pages/views/dashboard/userSettings.vue'),
        'user-saved-tabs': httpVueLoader('/pages/views/dashboard/userSavedTabs.vue')
    }
});