import Vue from "vue";
import VueRouter from "vue-router";
import Home from '/pages/Home.vue';
import Browse from '/pages/Browse.vue';
import Editor from '/pages/Editor.vue';
import FAQ from '/pages/FAQ.vue';
import Changelog from '/pages/Changelog.vue';
import Missing from "/pages/Missing.vue";
const { ORIGIN_URL } = process.env;

Vue.use(VueRouter);

export default (() => {
  const basePath = new URL(ORIGIN_URL).pathname.replace(/[/]$/, "");
  return new VueRouter({
    mode: "history",
    routes: [
      { path: `${basePath}/`, component: Home },
      { path: `${basePath}/browse`, component: Browse },
      { path: `${basePath}/editor`, component: Editor },
      { path: `${basePath}/faq`, component: FAQ },
      { path: `${basePath}/changelog`, component: Changelog },
      { path: `*`, component: Missing }
    ]
  });
})();
