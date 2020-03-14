// api
import axios from "axios";
const { ORIGIN_URL } = process.env;

const api = (() => {
  return axios.create({
    baseURL: `${ORIGIN_URL}`,
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
const upload = async (pattData) => {
  const response = await api.post('api.php', {pattern:pattData});
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



export {
  upload,
  search,
  recent,
  view
};