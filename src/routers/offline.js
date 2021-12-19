import Vue from "vue";
import Editor from '@/pages/Editor';

const mode = "history";

const routes = [
  { path: `/`, component: Editor },
];

const routerConfig = {
  mode,
  routes,
};

export default routerConfig;