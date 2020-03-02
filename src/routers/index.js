import Vue from "vue";
import VueRouter from "vue-router";
import Editor from '/pages/Editor.vue';

Vue.use(VueRouter);

export default new VueRouter({
  mode: "history",
  routes: [
    { path: "*", component: Editor }
  ]
})