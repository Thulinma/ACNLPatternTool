import Vue from "vue";
import VueRouter from "vue-router";
import Editor from '/pages/Editor';
Vue.use(VueRouter);

const mode = "history";

const routes = [
  { path: `/`, component: Editor },
];

const router = new VueRouter({
  mode,
  routes
});

export default router;