import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '~/pages/Home.vue';
import Browse from '~/pages/Browse.vue';
import Editor from '~/pages/Editor';
import FAQ from '~/pages/FAQ.vue';
import Passports from '~/pages/Passports.vue';
import Updates from '~/pages/Updates.vue';
import Missing from '~/pages/Missing.vue';
import ModeratorIndex from '~/pages/moderator/Index.vue';
import ModeratorLogin from '~/pages/moderator/Login.vue';
import ModeratorDashboard from '~/pages/moderator/Dashboard.vue';
Vue.use(VueRouter);

const mode = "history";

const routes = [
  { path: "/", component: Home },
  { path: "/browse", component: Browse },
  { path: "/editor", component: Editor },
  { path: "/faq", component: FAQ },
  { path: "/passports", component: Passports },
  { path: "/updates", component: Updates },
  {
    path: "/moderator",
    component: ModeratorIndex,
    children: [
      {
        path: "login",
        component: ModeratorLogin
      },
      {
        path: "dashboard",
        component: ModeratorDashboard
      },
    ]
  },
  { path: "*", component: Missing }
];

const router = new VueRouter({
  mode,
  routes
});

export default router;