import {
  PatternEntry
} from "@/libs/origin";

export interface State {
  resultsCache: Record<string, PatternEntry[]>,
  fetchedPagesCache: Record<string, number[]>
}

export const createDefaultState = (): State => ({
  resultsCache: {},
  fetchedPagesCache: {},
});

export default createDefaultState();