import qs from "qs";
import Vue from "vue";
import VueRouter from 'vue-router';
import Home from '@/pages/Home.vue';
import Browse from '@/pages/Browse';
import Editor from '@/pages/Editor';
import FAQ from '@/pages/FAQ';
import About from '@/pages/About';
import Updates from '@/pages/Updates';
import Missing from '@/pages/Missing.vue';
import ModeratorIndex from '@/pages/moderator/Index.vue';
import ModeratorLogin from '@/pages/moderator/Login.vue';
import ModeratorDashboard from '@/pages/moderator/Dashboard.vue';

Vue.use(VueRouter);

const mode = "history";

const routes = [
  { path: "/", component: Home },
  { path: "/browse", component: Browse },
  { path: "/editor", component: Editor },
  { path: "/faq", component: FAQ },
  { path: "/about", component: About },
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
  { path: "*", component: Missing },
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
