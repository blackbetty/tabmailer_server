<template>
    <div>
        <div class="dashboard-component-container border-secondary rounded">
            <div class="dashboard-component-header">
                <h2 class="display-5">Your Tab Collection</h2>
                <hr>
            </div>
            <div v-if="showTabHeap">
                <div class="dashboard-component-body tab-heap-body">
                    <paginate-links for="tabObjectsArray" :limit="12" :show-step-links="true"></paginate-links>
                    <paginate name="tabObjectsArray" :list="tabObjectsArray" class="paginate-list" tab="div">
                        <div class="tab-container rounded container-fluid" v-for="tabObject in paginated('tabObjectsArray')">
                            <h4 class="display-6">
                        {{ tabObject.article_title ? tabObject.article_title : 'Page title unavailable... ' }}
                        </h4>
                            <a :href="tabObject.article_url"> {{ tabObject.article_url }} </a>
                            <p class="addedTime">Added on {{ generateDateTime(tabObject.datetime_added) }}</p>
                        </div>
                    </paginate>
                </div>
            </div>
            <div class="flexbox" v-else>
                <div class="loader">
                    Loading....
                </div>
            </div>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: ['showTabHeap'],
    created: function() {
        EventBus.$on('tabsLoadedEvent', (tabs, cb) => {
            // console.log('tabsLoadedEvent triggered and responded to by child!');
            this.setTabData(tabs, cb);
        });
    },
    data: function() {
        return {
            tabObjectsArray: [],
            paginate: ['tabObjectsArray']
        }
    },
    methods: {
        setTabData: function(tabs, callback) {
            this.tabObjectsArray = tabs;
            callback();
        },
        generateDateTime(timeInt) {
            var formattedTime = moment(timeInt).format("MMMM Do, YYYY [at] hh:mm a") //parse integer

            return formattedTime;
        }
    },
    mounted: function() {},
    computed: {}
}
</script>