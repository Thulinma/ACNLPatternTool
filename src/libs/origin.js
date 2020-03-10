// api
import axios from "axios";

const api = axios.create({
  baseURL: "/",
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

// front end api should be actions, not single api calls
// example, to be deleted
const actionName = async (parameters) => {
  // examples
  const response = await api.get(`/target_url${encodeQueryParams({})}`);
  // const response = await api.post(`target_url`, {
  //   // json data
  // });
  const {
    // unpack response data json fields
  } = response.data;
  // do stuff
  return {
    // relevant stuff
  }
};


export {
  // all function names
}