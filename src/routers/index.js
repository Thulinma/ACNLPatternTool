import VueRouter from "vue-router";
import Editor from '/pages/Editor.vue';

export default new VueRouter({
  mode: "history",
  routes: [
    { path: "*", component: Editor }
  ]
})
