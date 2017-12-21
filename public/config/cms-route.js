/**
 * Created by lin on 2017/5/4.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);
const cmsList = resolve => {
    require.ensure(["../html/components/index-component.vue"], () => {
        resolve(require("../html/components/index-component.vue"))
    })
};
const routes = [
    { path: '/', component: cmsList }
];
export default new VueRouter({
    routes // （缩写）相当于 routes: routes
});