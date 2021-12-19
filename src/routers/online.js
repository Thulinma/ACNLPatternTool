import Home from '@/pages/Home.vue';
import Browse from '@/pages/Browse';
import Editor from '@/pages/Editor';
import FAQ from '@/pages/FAQ.vue';
import About from '@/pages/About.vue';
import Updates from '@/pages/Updates.vue';
import Missing from '@/pages/Missing.vue';
import ModeratorIndex from '@/pages/moderator/Index.vue';
import ModeratorLogin from '@/pages/moderator/Login.vue';
import ModeratorDashboard from '@/pages/moderator/Dashboard.vue';

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
  { path: "*", component: Missing }
];

const routerConfig = {
  mode,
  routes,
};

export default routerConfig;