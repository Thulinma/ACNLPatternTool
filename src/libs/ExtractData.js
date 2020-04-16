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
export function extractData(dataString, size = 300, full_size = 1200) {
  let full_name, id, uuid, artist;
  [full_name, id, uuid, artist] = dataString.split("|");

  const url = `https://media.getty.edu/iiif/image/${uuid}/full/!${size},${size}/0/default.jpg`;
  const bigurl = `https://media.getty.edu/iiif/image/${uuid}/full/!${full_size},${full_size}/0/default.jpg`;
  const link = `https://www.getty.edu/art/collection/objects/tms:${id}`;

  return {
    short_name: truncateName(full_name),
    full_name: full_name,
    iiif_url: url,
    large_iiif_url: bigurl,
    artist: artist,
    webpage: link
  };
}

function truncateName(name) {
  if (name.length > 20) {
    name = name.substr(0, 19) + "…";
  }
  return name;
}

export async function getIIIFData(manifestURL, size = 150, full_size = 1200) {
  let manifest = await getIIIFManifest(manifestURL);
  if (!manifest) {
    return null;
  }

  let iiif_url = getIIIFThumbnail(manifest, size);
  let iiif_full_url = iiif_url.replace(
    `!${size},${size}`,
    `!${full_size},${full_size}`
  );

  let label = "";
  if (manifest.label) {
    label = manifest.label;
  }

  return {
    short_name: label,
    full_name: label,
    iiif_url: iiif_url,
    large_iiif_url: iiif_full_url,
    attribution: manifest.attribution,
    license: manifest.license,
    artist: null,
    webpage: null
  };
}

export async function getIIIFManifest(manifestURL) {
  let response = null;
  try {
    response = await axios.get(manifestURL);
  } catch (error) {}

  if (!response) {
    return null;
  }

  return response.data;
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
export function getIIIFThumbnail(manifest, size = 300) {
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

  //Somber path:  Doesn't have a thumbnail--choose the first image in the first sequence.
  else if (
    manifest.sequences &&
    manifest.sequences[0].canvases &&
    manifest.sequences[0].canvases[0].images &&
    manifest.sequences[0].canvases[0].images[0].resource &&
    manifest.sequences[0].canvases[0].images[0].resource.service
  ) {
    return `${manifest.sequences[0].canvases[0].images[0].resource.service["@id"]}/full/!${size},${size}/0/default.jpg`;
  }
  // sad path: we failed.
  return null;
}
