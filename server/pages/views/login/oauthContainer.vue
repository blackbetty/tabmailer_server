<template>
	<div class="login">
		<h2 class="display-5 flexbox" v-show="!userNotFound">Welcome back, login below!</h2>
		<h4 id="user-not-found-message" class="display-5 flexbox" v-show="userNotFound">User not found, try signing up <a href="" v-on:click="redirectToHome">here.</a></h4>
			<div class='login-providers flexbox'>
				<div class="row">
					<a class="btn btn-social btn-twitter" href="/auth/twitter?redir=login_successful">
						<span class="fa fa-twitter"></span>
						Login with Twitter
					</a>

					<a class="btn btn-social btn-github" href="/auth/github?redir=login_successful">
						<span class="fa fa-github"></span>
						Login with Github
					</a>

				</div>
				<div class="row">
					<a class="btn btn-social btn-google" href="/auth/google/?redir=login_successful">
						<span class="fa fa-google"></span>
						Login with Google
					</a>
					<a class="btn btn-social btn-bitbucket" href="/auth/gitlab/?redir=login_successful">
						<span class="fa fa-gitlab"></span>
						Login with Gitlab
					</a>
				</div>
			</div>
	</div>
</template>
<script>
	module.exports = {
		mounted: function () {
			this.userNotFound = this.userNotFoundCheck();
		},
		created: function(){
		},
		destroyed: function(){
		},
		methods: {
			userNotFoundCheck: function(){
				let queryPairs = window.location.search.substr(1).split('&');
				const params = new URLSearchParams(queryPairs[0]);
				return params.get('user_not_found') || false;
			},
			redirectToHome: function (){
				window.open(window.location.origin);
				self.close();
			}
		},
		updated: function () {},
		data: function () {
			return {
				userNotFound: false 
			}
		}
	};
</script>