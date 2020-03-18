// api
import axios from "axios";
const { API_URL } = process.env;

const api = (() => {
  return axios.create({
    baseURL: `${API_URL}`,
  timeout: 10000,
});
})();
// 'get' api method helper
const encodeQueryParams = (params) => {
  const keys = Object.keys(params);
  if (keys.length === 0) return "";
  return Object.keys(params).reduce((accum, curr, index) => {
    let query = accum;
    let param = curr;
    let value = params[curr]
    if (index > 0) query += "&";
    const encodedParam = encodeURIComponent(param);
    const encodedValue = encodeURIComponent(value);
    return query + `${encodedParam}=${encodedValue}`;
  }, "?");
};

// Upload
const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
  const response = await api.post('api.php', {pattern:pattData, styletag_a:styleA, styletag_b:styleB, styletag_c:styleC, typetag_a:typeA, typetag_b:typeB, typetag_c:typeC, nokids:(NSFW?"Y":"")});
  return response.data;
};

// Search
const search = async (q) => {
  const response = await api.get(`api.php${encodeQueryParams({q})}`);
  return response.data;
};

// Open single pattern
const view = async (hash) => {
  const response = await api.get(`api.php${encodeQueryParams({view: hash})}`);
  return response.data;
};

// Recent uploads
const recent = async () => {
  const response = await api.get('api.php');
  return response.data;
};

const tags_style = ['Natural','Cute','Sporty','Cool','Rustic','Hip','Harmonious','Elegant','Modern','Historical','Civic','Silly','Spooky','Sci-Fi','Aquatic','Floral','Animal','Holiday','Food','Brand'];
const tags_type = ['Path','Clothing','Hat','Wallpaper','Carpet','Furniture','Flag','Sign','Logo','Poster'];

export {
  upload,
  search,
  recent,
  view,
  tags_style,
  tags_type
};

