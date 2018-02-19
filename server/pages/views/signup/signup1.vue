<template>
	<div class="signup step1">
		<h2 class="display-5 flexbox"> To get started, sign in below!</h2>
		<!-- <div class="g-signin2 flexbox" v-on:click="nextPage" data-onsuccess="onSignIn"></div> -->
		<div class='login-providers flexbox'>
			<div class="row">

				<a class="btn btn-social btn-facebook">
					<span class="fa fa-facebook"></span>
					Sign in with facebook
				</a>

				<a class="btn btn-social btn-github">
					<span class="fa fa-github"></span>
					Sign in with Github
				</a>

			</div>
			<div class="row">

				<a class="btn btn-social btn-google">
					<span class="fa fa-google"></span>
					Sign in with Google
				</a>

				<a class="btn btn-social btn-bitbucket">
					<span class="fa fa-gitlab"></span>
					Sign in with Gitlab
				</a>

			</div>
		</div>
	</div>
</template>
<script>
module.exports = {
  mounted: function() {},
  methods: {
    nextPage: function(e) {
      router.push({ path: "/2" });
    }
  },
  updated: function() {},
  data: function() {
    return {
      email: ""
    };
  },
  mounted: function() {
    if (window.gapi) window.gapi.platform.go();
  }
};
</script>