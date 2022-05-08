import { PatternStorage } from "@/libs/storage";

export interface State {
  patternStorage: PatternStorage,
  initialized: boolean,
}

export const createDefaultState = (): State => ({
  patternStorage: {},
  initialized: false,
});

export default createDefaultState();