// api
import axios from "axios";
const { API_URL } = process.env;

const api = (() => {
  return axios.create({
    baseURL: `${API_URL}`,
    // accept cookies from origin
    // if same-site cookies are enabled, gets blocked by CORS on dev env
    // withCredentials: true,
  timeout: 10000,
});
})();

// 'get' api method helper
const encodeQueryParams = (params) => {
  const keys = Object.keys(params);
  if (keys.length === 0) return "";
  let paramsString = Object.keys(params).reduce((accum, curr, index) => {
      let query = accum;
      let param = curr;
      let value = params[curr]
      if (index > 0) query += "&";
      const encodedParam = encodeURIComponent(param);
      const encodedValue = encodeURIComponent(value);
      return query + `${encodedParam}=${encodedValue}`;
  }, "?");
  return paramsString;
};


// Recent uploads
const recent = async (options) => {
  const { start, nsfc, letsgetdangerous } = options
  const paramsStr = encodeQueryParams({
    recent: 1,
    start,
    nsfc,
    letsgetdangerous,
  });

  const response = await api.get(`api.php${paramsStr}`);
  return response.data;
};


const popular = async (options) => {
  const { start, nsfc, letsgetdangerous } = options;
  const paramsStr = encodeQueryParams({
    popular: 1,
    start,
    nsfc,
    letsgetdangerous,
  });

  const response = await api.get(`api.php${paramsStr}`);
  return response.data;
};


// Search
const search = async (query, options) => {
  const { start, nsfc, letsgetdangerous } = options;
  const params = encodeQueryParams({
    q: query,
    start,
    nsfc,
    letsgetdangerous,
  });

  const response = await api.get(`api.php${params}`);
  return response.data;
};


// Open single pattern
const view = async (hash) => {
  const response = await api.get(`api.php${encodeQueryParams({view: hash})}`);
  return response.data;
};


// Upload
const upload = async (pattData, styleA, styleB, styleC, typeA, typeB, typeC, NSFW) => {
  const response = await api.post('api.php', {
    pattern:pattData,
    styletag_a:styleA,
    styletag_b:styleB,
    styletag_c:styleC,
    typetag_a:typeA,
    typetag_b:typeB,
    typetag_c:typeC,
    nokids:(NSFW?"Y":"")
  });
  return response.data;
};


const modLogIn = async (username, password) => {
  try {
    const response = await api.post("api.php", {
      user: username,
      pass: password
    });
    if (response.data.error){
      throw new Error(response.data.error);
      return "";
    }
    return response.data.token;
  }
  catch (error) {
    if (error.response.status !== 401) throw error;
    return "";
  }
};


const modPending = async (token) => {
  const response = await api.get(`api.php${encodeQueryParams({modqueue: 1, token})}`);
  return response.data;
};


const modApprove = async (hash, options, token) => {
  const response = await api.post("api.php", {
    ...options,
    approve: hash,
    token,
  });
  return response.data;
};


// exporting as delete, delete is a keyword :(
const modDelete = async (hash, token) => {
  const response = await api.post("api.php", {
    wipepattern: hash,
    token: token
  });
  return response.data;
};


const tags_style = [
  'Natural',
  'Cute',
  'Sporty',
  'Cool',
  'Rustic',
  'Hip',
  'Harmonious',
  'Elegant',
  'Modern',
  'Historical',
  'Civic',
  'Silly',
  'Spooky',
  'Sci-Fi',
  'Aquatic',
  'Floral',
  'Animal',
  'Holiday',
  'Food',
  'Brand',
  'Video Game',
  'Anime',
  'Meme'
];

const tags_type = [
  'Path',
  'Clothing',
  'Hat',
  'Wallpaper',
  'Carpet',
  'Furniture',
  'Flag',
  'Sign',
  'Logo',
  'Poster'
];

export default {
  recent,
  popular,
  search,
  view,
  upload,
  modLogIn,
  modPending,
  modApprove,
  modDelete,
  tags_style,
  tags_type
};

