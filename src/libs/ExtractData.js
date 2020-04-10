/**
 * The return data format for the extractData() function
 *
 * @typedef {Object} ParsedData
 * @property {string} full_name The complete artwork name
 * @property {string} short_name The name to apply to the artwork.
 *                         It will be truncated to 20 characters.
 * @property {string} iiif_url The IIIF url value
 * @property {string} webpage A link to the collection page for the artwork
 */

/**
 * Given a string in the correct format, extract out the fields needed
 *
 * Example of the data structure:
 *
 *  Apulian Red-Figure Loutrophoros|12038|ed5f9f87-a007-42a5-b4c8-dd6b588be10a
 *
 * @param  {String} dataString A pipe-delimited record
 * @param  {Number} size       The number of pixels on the longest side for the IIIF image
 * @return {ParsedData}            The data parsed into a usable form.
 */
function extractData(dataString, size = 300) {
  let full_name, id, uuid;
  [full_name, id, uuid] = dataString.split("|");

  const url = `https://media.getty.edu/iiif/image/${uuid}/full/!${size},${size}/0/default.jpg`;
  const link = `https://www.getty.edu/art/collection/objects/tms:${id}`;

  let name = full_name;
  if (name.length > 20) {
    name = name.substr(0, 17) + "...";
  }
  return {
    short_name: name,
    full_name: full_name,
    iiif_url: url,
    webpage: link,
  };
}

export default extractData;
