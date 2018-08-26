<template>
    <div>
        <div class="dashboard-component-container border-secondary rounded">
            <div class="dashboard-component-header">
                <h2 class="display-5">Your Tab Collection</h2>
                <hr>
            </div>
            <div v-if="true">
                <div class="dashboard-component-body tab-heap-body">
                    <div v-if="tabObjectsArray.length > 0">
                        <paginate-links for="tabObjectsArray" :limit="12" :show-step-links="true"></paginate-links>
                        <paginate name="tabObjectsArray" :list="tabObjectsArray" class="paginate-list" tab="div">
                            <div class="tab-container rounded container-fluid" v-for="tabObject in paginated('tabObjectsArray')" :key="tabObject.link_id">
                                <h4 class="display-6">
                        {{ tabObject.link_title ? tabObject.link_title : 'Page title unavailable... ' }}
                        </h4>
                                <a :href="tabObject.link_url"> {{ tabObject.link_url }} </a>
                                <p class="addedTime">Added on {{ generateDateTime(tabObject.link_date_created) }}</p>
                            </div>
                        </paginate>
                    </div>
                    <div v-else>
                            <h4 class="display-6">Looks like you haven't saved any tabs yet!</h4>
                    </div>
                </div>
            </div>
            <div class="flexbox" v-else>
				<img class="dash-loader" src="/pages/images/loader.svg"/>
            </div>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: [],
    created: function() {
		this.fetchTabData()
		.then((tabs) => { this.setTabData(tabs)})
		.catch((err) => {alert(err)});
    },
    data: function() {
        return {
            tabObjectsArray: [],
			paginate: ['tabObjectsArray'],
			showTabHeap: false
        }
    },
    methods: {
        setTabData: function(tabs) {
			this.tabObjectsArray = tabs;
			this.showTabHeap = true;
        },
        generateDateTime(timeInt) {
            var formattedTime = moment(timeInt).format("MMMM Do, YYYY [at] hh:mm a") //parse integer
            return formattedTime;
		},
		fetchTabData: function(){
			return new Promise((resolve, reject) => {
				var xhr = new XMLHttpRequest();
				const url = '/links';
				const method = 'GET';
				const async = true;
				xhr.open(method, url, async);
				xhr.setRequestHeader('Content-Type', 'application/json');
				xhr.onload = function() {
					if (this.status === 401 && retry) {
						// This status may indicate that the cached
						// access token was invalid. Retry once with
						// a fresh token.
						retry = false;
						reject();
					} else if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
						 resolve(JSON.parse(xhr.response));
					} else if (this.readyState == XMLHttpRequest.DONE && this.status != 200) {
						reject(xhr.response);
					}
				};
				// relies on req_body being undefined in the case of a get, sends an empty body
				// which on a GET gets ignored anyway
				xhr.send();
			})
		}
		
    },
    mounted: function() {},
    computed: {}
}
</script>