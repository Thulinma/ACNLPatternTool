import { MutationTree } from "vuex";
import { State, createDefaultState } from "./state";
import {
  PatternItem,
  saveToPatternStorage,
  deleteFromPatternStorage,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/libs/storage";


export default {
  reset(state: State): void {
    Object.assign(state, createDefaultState());
  },
  init(state): void {
    if (state.initialized)
      return;
    state.patternStorage = loadFromLocalStorage();
    state.initialized = true;
  },
  add(state: State, patternItems: PatternItem[]): void {
    for (const patternItem of patternItems)
      saveToPatternStorage(state.patternStorage, patternItem);
    saveToLocalStorage(state.patternStorage);
  },
  remove(state: State, patternItems: PatternItem[]): void {
    for (const patternItem of patternItems)
      deleteFromPatternStorage(state.patternStorage, patternItem);
    saveToLocalStorage(state.patternStorage);
  },
} as MutationTree<State>;
