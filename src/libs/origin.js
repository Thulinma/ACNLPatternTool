// api
import axios from "axios";

const api = axios.create({
  baseURL: "https://thulinma.com/acnh/",
  timeout: 10000,
});

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
const search = async () => {
  const response = await api.get('api.php');
  return response.data;
};


export {
  upload,
  search
}

