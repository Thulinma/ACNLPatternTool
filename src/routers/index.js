import qs from "qs";
import Vue from "vue";
import VueRouter from 'vue-router';
import offlineRouter from "./offline";
import onlineRouter from "./online";
import { ifOfflineVal } from "@/utils/if-env";
Vue.use(VueRouter);

const selectedRouter = new VueRouter({
    ...ifOfflineVal(offlineRouter, onlineRouter),
    // replace default query parsing behavior
    parseQuery(query) {
        return qs.parse(query);
    },
    stringifyQuery(query) {
        const result = qs.stringify(query);
        return result ? ('?' + result) : '';
    }
});

export default selectedRouter;