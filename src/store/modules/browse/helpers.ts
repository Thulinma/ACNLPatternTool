import {
  Sorting,
  StyleTag,
  TypeTag,
  browse,
} from "@/libs/origin";

export interface SearchOptions {
  titleFilter: string,
  authorFilter: string,
  townFilter: string,
  styleTagsFilter: [(StyleTag | null), (StyleTag | null), (StyleTag | null)],
  typeTagsFilter: [(TypeTag | null), (TypeTag | null), (TypeTag | null)],
  sorting: Sorting,
};

export interface ApiSearchOptions extends SearchOptions {
  originPageNumber: number,
}

export type BrowseSearchOptions = Parameters<typeof browse>[0];

// resolve inconsistencies between api and store
export const optionsMap: Partial<{
  [key in keyof ApiSearchOptions]: keyof BrowseSearchOptions;
}> = {
  titleFilter: "q",
  authorFilter: "a",
  townFilter: "t",
  styleTagsFilter: "st",
  typeTagsFilter: "tt",
  originPageNumber: "start",
};


// should be applied before making api call
export const remappedOptions = (
  options: ApiSearchOptions
): BrowseSearchOptions => {
  const copy: BrowseSearchOptions | ApiSearchOptions = Object.assign({}, options);
  const optionsMapKeys = Object.keys(optionsMap);
  for (let key of optionsMapKeys) {
    if (!(key in copy))
      continue;
    // key needs to be remapped
    const source = key;
    const target = optionsMap[key];
    copy[target] = copy[source];
    delete copy[source];
  }
  return copy as unknown as BrowseSearchOptions;
};

// maps properties to correct options before api call
export const correctOptions = (
  options: ApiSearchOptions,
): BrowseSearchOptions => {
  return remappedOptions(options);
};


export const createOptions = (): SearchOptions => ({
  titleFilter: "",
  authorFilter: "",
  townFilter: "",
  styleTagsFilter: [null, null, null],
  typeTagsFilter: [null, null, null],
  sorting: Sorting.Random,
});


/**
 * Makes a clone / deep copy of the options.
 */
export const cloneOptions = (
  options: SearchOptions,
): SearchOptions => {
  return JSON.parse(JSON.stringify(options));
};
