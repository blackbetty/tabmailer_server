<template>
	<div class="signup step1">
		<h2 class="display-5 flexbox"> To get started, sign up below!</h2>
		<div class='login-providers flexbox'>
			<div class="row">


				<a class="btn btn-social btn-twitter" href="/auth/twitter?redir=2&hash=true">
					<span class="fa fa-twitter"></span>
					Identify with Twitter
				</a>

				<a class="btn btn-social btn-github" href="/auth/github?redir=2&hash=true">
					<span class="fa fa-github"></span>
					Identify with Github
				</a>

			</div>
			<div class="row">
				<a class="btn btn-social btn-google" href="/auth/google?redir=2&hash=true">
					<span class="fa fa-google"></span>
					Identify with Google
				</a>
				<a class="btn btn-social btn-bitbucket" href="/auth/gitlab?redir=2&hash=true">
					<span class="fa fa-gitlab"></span>
					Identify with Gitlab
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
					path: "/2"
				});
			}
		},
		updated: function () {},
		data: function () {
			return {
				email: ""
			};
		},
		mounted: function () {
			// if (window.gapi) window.gapi.platform.go();
		}
	};
</script>