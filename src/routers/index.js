import Vue from "vue";
import VueRouter from "vue-router";
import Home from '/pages/Home.vue';
import Browse from '/pages/Browse.vue';
import Editor from '/pages/Editor.vue';
import Missing from "/pages/Missing.vue";

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  routes: [
    { path: "/", component: Home },
    { path: "/browse", component: Browse },
    { path: "/editor", component: Editor },
    { path: "*", component: Missing }
  ]
});