<template>
    <div>
        <div class="dashboard-component-container border-secondary rounded">
            <div class="dashboard-component-header">
                <h2 class="display-5">Your Tab Heap</h2>
                <hr>
            </div>
            <div v-if="showTabHeap">
                <div class="dashboard-component-body tab-heap-body">
                    {{ tabObjectsArray }}
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
        }
    },
    mounted: function() {},
    computed: {}
}
</script>