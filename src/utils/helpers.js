/**
 * Computes the available options at each index for an array of selected values.
 * The corresponding option of the selected value will always be included.
 * @template T
 * @param {Array<T>} selVals values of the selected options
 * @param {Array<{ text: string, value: T }>} inclOpts inclusive options (multiple use)
 * @param {Array<{ text: string, value: T }} exclOpts exclusive options (single use)
 */
 export const computeOptsList = (selVals, inclOpts, exclOpts) => {
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
      return [ ...inclOpts, ...unusedExclOpts];
    });
};

/**
 * Combines activator event callbacks.
 * Supports same-type activators.
 * @param {Array<{ [key: string] : Function }>} ons
 * @returns { [key: string] : Function }
 */
export const combineOns = function (...ons) {
  /**@type {Map<string, Array<Function>} */
  const callbacksMap = new Map();
  for (const on of ons)
    for (const [eventName, callback] of Object.entries(on))
      if (callbacksMap.has(eventName))
        callbacksMap.get(eventName).push(callback);
      else callbacksMap.set(eventName, [callback]);
  const combinedOns = {};
  for (const [eventName, callbacks] of [...callbacksMap.entries()])
    combinedOns[eventName] = function (...args) {
      for (const callback of callbacks) callback.call(this, ...args);
    };
  return combinedOns;
};