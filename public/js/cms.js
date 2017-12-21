/**
 * Created by lin on 2017/4/17.
 */
require('./../css/cms.less');
require('element-ui/lib/theme-default/index.css');
import Vue from 'vue';
import vue_resource from 'vue-resource';
// import ElementUI from 'element-ui';
import router from '../config/cms-route';
require('lodash');
Vue.use(vue_resource);
// Vue.use(ElementUI);
new Vue({
    router,
    el:"#app",
    data () {
        return {
        }
    },
    methods:{
    
    },
    mounted:function () {
    
    }
});