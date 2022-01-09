import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { State } from "./state";
import DrawingTool from "@/libs/DrawingTool";

export default {
  isLoggedIn: (state): boolean => {
    return Boolean(state.token);
  },
  pendingHashes: (state): string[] => {
    const { pending } = state;
    const hashes = pending.map(i => new DrawingTool(i.bytes).pixelHash);
    return hashes;
  },
} as GetterTree<State, RootState>;
