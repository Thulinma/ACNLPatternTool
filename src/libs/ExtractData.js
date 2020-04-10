const axios = require("axios");

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
export function extractData(dataString, size = 300) {
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

/**
 * Given the URL to a IIIF Manifest, return a url to a jpeg thumbnail.
 *
 * @param  {String} manifestURL The URL to a IIIF Manifest
 * @param  {Number} size Number in pixels on the longest side for the thumbnail.
 *                       ...note that this only works if the thumbnail has a IIIF
 *                       image service attached.
 * @return {String}             The URL to the thumbnail
 */
export async function getIIIFThumbnail(manifestURL, size = 300) {
  let response = null;
  try {
    response = await axios.get(manifestURL);
  } catch (error) {}

  if (!response) {
    return null;
  }

  const manifest = response.data;

  // Happiest path: has a IIIF Service.
  if (
    manifest.thumbnail &&
    manifest.thumbnail.service &&
    manifest.thumbnail.service["@context"] ==
      "http://iiif.io/api/image/2/context.json"
  ) {
    const thumbnailId = manifest.thumbnail.service["@id"];
    return `${manifest.thumbnail.service["@id"]}/full/!${size},${size}/0/default.jpg`;
  }

  // Happy path:  Has a thumbnail defined, but it's not IIIF-compatible
  else if (manifest.thumbnail) {
    return manifest.thumbnail["@id"];
  }

  // sad path: we failed.
  return null;
}
