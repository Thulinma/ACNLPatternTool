
type Option<T> = {
  text: string,
  value: T
};

/**
 * Computes the available options at each index for an array of selected values.
 * The corresponding option of the selected value will always be included.
 * @param selVals values of the selected options
 * @param inclOpts inclusive options (multiple use)
 * @param exclOpts exclusive options (single use)
 */
export const computeOptsList = <T>(
  selVals: T[],
  inclOpts: Option<T>[],
  exclOpts: Option<T>[],
): Option<T>[][] => {
  // throw if exclusive and inclsive values are intersecting 
  const inclValsSet = new Set(
    inclOpts
      .map(opt => opt.value)
  );
  const exclValsSet = new Set(
    exclOpts
      .map(opt => opt.value)
  );
  const exclVals = [...exclValsSet];
  const intersection = new Set(
    [...inclValsSet]
      .filter(val => exclValsSet.has(val))
  );
  if (intersection.size > 0)
    throw new Error(`The following inclusive and exclusive values are being shared: ${[...intersection]}`);

  // throw if an exclusive value is used more than once
  const exclValOccs = [...exclValsSet]
    .map(excVal => selVals.filter(selVal => selVal === excVal).length);
  const reusedExclVals = new Array(exclVals.length)
    .fill(null)
    .map((_null, i) => [exclVals[i], exclValOccs[i]])
    .filter(([_exclVal, occ]) => occ > 1)
    .map(([exclVal]) => exclVal);
  if (reusedExclVals.length > 0)
    throw new Error(`The following exclusive values were selected more than once: ${reusedExclVals}`);

  // available options at each index;
  return selVals
    .map((_value, i) => {

      // values not at the current index
      const nonCurrVals = [
        ...selVals.slice(0, i),
        ...selVals.slice(i + 1, selVals.length),
      ];

      const unusedExclOpts = exclOpts
        .filter(opt => !nonCurrVals.includes(opt.value));
      return [...inclOpts, ...unusedExclOpts];
    });
};


type On = Record<string, Function>;

/**
 * Combines activator event callbacks.
 * Supports same-type activators.
 * @param ons
 * @returns
 */
export const combineOns = function (
  ...ons: On[]
): On {
  const callbacksMap = new Map<string, Function[]>();
  for (const on of ons)
    for (const [eventName, callback] of Object.entries(on))
      if (callbacksMap.has(eventName))
        (callbacksMap.get(eventName) as Function[]).push(callback);
      else callbacksMap.set(eventName, [callback]);
  const combinedOns = {} as Record<string, Function>;
  for (const [eventName, callbacks] of [...callbacksMap.entries()])
    combinedOns[eventName] = function(...args: any[]) {
      for (const callback of callbacks) callback.call(this, ...args);
    };
  return combinedOns;
};