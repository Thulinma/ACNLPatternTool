import Vue from "vue";
import VueRouter from "vue-router";
import Home from '/pages/Home.vue';
import Browse from '/pages/Browse.vue';
import Editor from '/pages/Editor.vue';
import FAQ from '/pages/FAQ.vue';
import Changelog from '/pages/Changelog.vue';
import Missing from "/pages/Missing.vue";
Vue.use(VueRouter);

const mode = "history";

const routes = [
  { path: `/`, component: Home },
  { path: `/browse`, component: Browse },
  { path: `/editor`, component: Editor },
  { path: `/faq`, component: FAQ },
  { path: `/changelog`, component: Changelog },
  { path: `*`, component: Missing }
];

const router = new VueRouter({
  mode,
  routes
});

export default router;