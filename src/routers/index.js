import Vue from "vue";
import VueRouter from "vue-router";
import Home from '/pages/Home.vue';
import Browse from '/pages/Browse.vue';
import Editor from '/pages/Editor.vue';
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
      { path: `*`, component: Missing }
    ]
  });
})();