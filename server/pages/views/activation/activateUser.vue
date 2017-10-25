<template>
    <div id="activation-response" class="container">
        <div class="success-alert" v-if="activationSuccess">
            <div class="alert alert-success">
                <h2 class="display-5">User Activated Successfully!</h2>
                <br>
                <p>You're ready to start savin' some tabbies! Feel free to check out your account settings at that there link below!</p>
            </div>
            <a href="/dashboard" class="btn btn-primary btn-block" role="button" aria-disabled="true">Account Settings</a>
        </div>
        <div v-else>
            <div class="alert alert-danger">
                <h2 class="display-5">Activating this user failed!</h2>
                <br>
                <p>It appears the activation link you used was invalid, please try again later.</p>
            </div>
        </div>
    </div>
</template>
<script>
module.exports = {
    data: function() {
        return {
        }
    },
    methods: {
        getCookie: function(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            if (parts.length === 2) return parts.pop().split(";").shift();
        },
        deleteCookie: function(name) {
            document.cookie = name + '=; max-age=0; path=/;';
        },
        parseObjectFromCookie: function(cookie) {
            var decodedCookie = decodeURIComponent(cookie);
            return JSON.parse(decodedCookie);
        }
    },
    mounted: function() {

    },
    computed: {
        activationSuccess() {
            var dataCookie = this.getCookie('tabmailer_data');
            this.deleteCookie('tabmailer_data');

            if (dataCookie) {
                var data = this.parseObjectFromCookie(dataCookie);
                return true;
            } else {
                // define later
                return false;
            }
        }
    }
}
</script>