<template>
    <div class="signup step1">
        <h2 class="display-5 flexbox"> To get started, sign in below!</h2>
        <div class="g-signin2 flexbox" v-on:click="nextPage" data-onsuccess="onSignIn"></div>
    </div>
</template>
<script>
module.exports = {
    mounted: function() {
        // console.log('use this.$parent: ' + this.$parent);
    },
    methods: {
        nextPage: function(e) {
            router.push({ path: '/2' });
        }
    },
    updated: function() {
        // this.$parent.email = this.butt;
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