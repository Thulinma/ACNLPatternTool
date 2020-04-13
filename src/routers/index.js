import Vue from "vue";
import VueRouter from "vue-router";
import Editor from "/pages/Editor.vue";
Vue.use(VueRouter);

const mode = "history";

const routes = [
  { path: `/`, component: Editor },
  { path: `/animal-crossing-artwork-generator/`, component: Editor }
];

const router = new VueRouter({
  mode,
  routes
});

export default router;
