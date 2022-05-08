import { GetterTree } from "vuex";
import { RootState } from "@/store/types";
import { State } from "./state";
import { PatternItem } from "@/libs/storage";


export default {
  patternItems(state): PatternItem[] {
    return Object.values(state.patternStorage);
  },
} as GetterTree<State, RootState>;
