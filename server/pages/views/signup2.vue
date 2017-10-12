<!-- <script src="https://apis.google.com/js/platform.js" type="text/javascript"></script>
<meta name="google-signin-client_id" content="881057203535-i7f0fqflce385r6u0p41nvseto0k8gbk.apps.googleusercontent.com"> -->
<template>
    <div>
        <div>
            <div class="signup step2">
                <div class="form-group">
                    <p style="color: rgba(0, 0, 0, 0.4)">Now that we know who you are (<i>ooooh spoooooky</i>), we'll need a username to call you by. It can be your gmail if you like, it's just for recordkeeping.</p>
                    <label for="username">Username:</label>
                    <input class="form-control border border-primary rounded" placeholder="Your Username" type="username" @input="usernameChanged" name="username" id="username">
                </div>
                <router-link class="rlink btn btn-primary btn-block" :disabled="isDisabled" tag="button" to="/3">
                    NEXT
                </router-link>
                <router-link class="btn btn-danger btn-block" to="/1">
                    <span class="glyphicon glyphicon-arrow-left"></span>
                    < BACK </router-link>
            </div>
        </div>
    </div>
</template>
<script>


module.exports = {
    props: {
        gapiObj: {
            type: String,
            default: 'what is going on'
        }
    },
    computed: {
        isDisabled: function() {
            if (
                this.$parent.username &&
                document.getElementById("username") &&
                document.getElementById("username").value
            ) {
                console.log("HELLOOOOOW");
                return false;
            }

            if (document.getElementsByClassName("rlink")[0]) {
                document.getElementsByClassName("rlink")[0].style.cursor = "pointer";
                return true;
            }
        }
    },
    methods: {
        usernameChanged: function(e) {
            this.$emit('username-changed', e.target.value);
        }
    },
    data: function() {
        return {
            username: ''
        }
    }
}
</script>