<template>
    <div class="signup step1">
        <h2 class="display-5 flexbox"> To get started, sign in below!</h2>
        <div class="g-signin2 flexbox" v-on:click="nextPage" data-onsuccess="onSignIn"></div>
    </div>
</template>
<script>
module.exports = {
    mounted: function() {
    },
    methods: {
        nextPage: function(e) {
            router.push({ path: '/2' });
        }
    },
    updated: function() {
    },
    data: function() {
        return {
            email: ''
        }
    },
    mounted: function() {
        if (window.gapi) window.gapi.platform.go();
    }
};
</script>