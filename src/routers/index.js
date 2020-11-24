import offlineRouter from "./offline";
import onlineRouter from "./online";
import { ifOfflineVal } from "~/utils/if-env";

const selectedRouter = ifOfflineVal(offlineRouter, onlineRouter);

export default selectedRouter;