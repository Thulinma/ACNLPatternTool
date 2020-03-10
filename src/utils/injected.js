// the files that need to be reconstructed
const urls = Object.keys(process.injected).reduce((accum, curr) => {
  const stringified = JSON.stringify(process.injected[curr]);
  const blob = new Blob([stringified], {type: "model/gltf+json"});
  const url = URL.createObjectURL(blob);
  accum[curr] = url;
  return accum;
}, {});
export default urls;