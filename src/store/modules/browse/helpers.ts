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

export type Copy = {
  [Property in keyof ApiSearchOptions]: ApiSearchOptions[Property];
}

export type BrowseSearchOptions = Parameters<typeof browse>[0];

// resolve inconsistencies between api and store
export const optionsMap: {
  [Property in keyof ApiSearchOptions]: keyof BrowseSearchOptions;
} = {
  titleFilter: "q",
  authorFilter: "a",
  townFilter: "t",
  styleTagsFilter: "st",
  typeTagsFilter: "tt",
  originPageNumber: "start",
  sorting: "sorting",
};


// should be applied before making api call
export const remappedOptions = (
  options: ApiSearchOptions
): BrowseSearchOptions => {
  const remapped = {} as BrowseSearchOptions;
  for (const [sourceKey, value] of Object.entries(options)) {
    // @ts-ignore
    const remappedKey = optionsMap[sourceKey] as (keyof BrowseSearchOptions);
    remapped[remappedKey] = value;
  };
  return remapped;
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
