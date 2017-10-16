<template>
    <div>
        <div class="dashboard-component-container border-secondary rounded">
            <div class="dashboard-component-header">
                <h2 class="display-5">Your Tab Heap</h2>
                <hr>
            </div>
            <div v-if="showTabHeap">
                <div class="dashboard-component-body tab-heap-body">
                    <div class="tab-container rounded container-fluid" v-for="tabObject in tabObjectsArray">
                        <h4 class="display-6">
                        <span>Title:</span> {{ tabObject.article_title ? tabObject.article_title : 'Page title unavailable... ' }}
                        </h4> Link:
                        <a :href="tabObject.article_url"> {{ tabObject.article_url }} </a>
                        <p>Added at: {{ generateDateTime(tabObject.datetime_added) }}</p>
                    </div>
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

    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment-with-locales.min.js"></script>
module.exports = {
    props: ['showTabHeap'],
    created: function() {
        EventBus.$on('tabsLoadedEvent', (tabs, cb) => {
            console.log('tabsLoadedEvent triggered and responded to by child!');
            this.setTabData(tabs, cb);
        });
    },
    data: function() {
        return {
            tabObjectsArray: [],
        }
    },
    methods: {
        setTabData: function(tabs, callback) {
            this.tabObjectsArray = tabs;
            console.log(this.tabObjectsArray);
            callback();
        },
        generateDateTime(timeInt) {
            var t = new Date(timeInt);
            var formattedTime = t.format("dd/mm/yyyy hh:MM:ss");
            return formattedTime;
        }
    },
    mounted: function() {},
    computed: {}
}
</script>