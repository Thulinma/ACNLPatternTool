import qs from "qs";
import Vue from "vue";
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const mode = "history";

const routes = [
  {
    path: "/",
    component: () => import(
      /* webpackChunkName: "Home" */
      "@/pages/Home.vue"
    ),
  },
  {
    path: "/browse",
    component: () => import(
      /* webpackChunkName: "Browse" */
      "@/pages/Browse"
    ),
  },
  {
    path: "/editor",
    component: () => import(
      /* webpackChunkName: "Editor" */
      "@/pages/Editor"
    ),
  },
  {
    path: "/faq",
    component: () => import(
      /* webpackChunkName: "FAQ" */
      "@/pages/FAQ"
    ),
   },
  {
    path: "/about",
    component: () => import(
      /* webpackChunkName: "About" */
      "@/pages/About"
    ),
   },
  {
    path: "/updates",
    component: () => import(
      /* webpackChunkName: "Updates" */
      "@/pages/Updates"
    ),
  },
  {
    path: "/moderator",
    component: () => import(
      /* webpackChunkName: "Moderator" */
      "@/pages/moderator/Index.vue"
    ),
    children: [
      {
        path: "login",
        component: () => import(
          /* webpackChunkName: "ModeratorLogin" */
          "@/pages/moderator/Login.vue"
        ),
      },
      {
        path: "dashboard",
        component: () => import(
          /* webpackChunkName: "ModeratorDashboard" */
          "@/pages/moderator/Dashboard.vue"
        ),
      },
    ]
  },
  {
    path: "*",
    component: () => import(
      /* webpackChunkName: "Missing" */
      "@/pages/Missing.vue"
    ),
  },
];

 export default new VueRouter({
    mode,
    routes,
    // replace default query parsing behavior
    parseQuery(query) {
        return qs.parse(query);
    },
    stringifyQuery(query) {
        const result = qs.stringify(query);
        return result ? ('?' + result) : '';
    }
});
