<template>
	<div class="login">
		<h2 class="display-5 flexbox">Welcome back, login below!</h2>
		<div class='login-providers flexbox'>
			<div class="row">
				<a class="btn btn-social btn-twitter" href="/auth/twitter?redir=login">
					<span class="fa fa-twitter"></span>
					Login with Twitter
				</a>

				<a class="btn btn-social btn-github" href="/auth/github?redir=login">
					<span class="fa fa-github"></span>
					Login with Github
				</a>

			</div>
			<div class="row">
				<a class="btn btn-social btn-google" href="/auth/google/?redir=login">
					<span class="fa fa-google"></span>
					Login with Google
				</a>
				<a class="btn btn-social btn-bitbucket">
					<span class="fa fa-gitlab"></span>
					Login with Gitlab
				</a>

			</div>
		</div>
	</div>
</template>
<script>
	module.exports = {
		mounted: function () {},
		methods: {
			nextPage: function (e) {
				router.push({
					path: "/login"
				});
			}
		},
		updated: function () {},
		data: function () {}
	};
</script>