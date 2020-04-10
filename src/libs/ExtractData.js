//Apulian Red-Figure Loutrophoros|12038|ed5f9f87-a007-42a5-b4c8-dd6b588be10a

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
    name: name,
    full_name: full_name,
    url: url,
    link: link,
  };
}

export default extractData;
