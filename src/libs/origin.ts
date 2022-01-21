// api
import axios from "axios";
const { API_URL } = env;

export interface PatternEntry {
  approved: string,
  author: string,
  bytes: string,
  f_type: string | null,
  f_type_a: string | null,
  f_type_b: string | null,
  featured: string,
  loweffort: string,
  mustretag: string,
  nokids: string,
  offensive: string,
  pattern_type: string,
  style_main: string | null,
  style_sub_a: string | null,
  style_sub_b: string | null,
  title: string,
  town: string,
  upload_date: string,
  url: string,
};

export interface UploadEntry extends PatternEntry {
  is_anime?: boolean,
  is_meme?: boolean,
  is_videogame?: boolean,
  feature?: boolean,
  retag?: boolean,
};

// 'get' api method helper
const encodeQueryParams = (params: any): string  => {
  const keys = Object.keys(params);
  if (keys.length === 0) return "";
  let paramsString = keys.reduce((accum, curr, index) => {
      let query = accum;
      let param = curr;
      let value = params[curr];
      if (value instanceof Array) {
        value = value.filter(v => v != null);
        if (value.length <= 0) return query;
        const encodedParam = encodeURIComponent(param) + "[]";
        const paramVal = value.reduce((accum, curr) => {
          const encodedValue = encodeURIComponent(curr);
          return `${accum}&${encodedParam}=${encodedValue}`;
        }, "");
        return query + `${paramVal}`;
      }
      else {
        if (index > 0) query += "&";
        const encodedParam = encodeURIComponent(param);
        const encodedValue = encodeURIComponent(value);
        return query + `${encodedParam}=${encodedValue}`;
      }
  }, "?");
  return paramsString;
};

const api = (() => {
  return axios.create({
    baseURL: `${API_URL}`,
    // accept cookies from origin
    // if same-site cookies are enabled, gets blocked by CORS on dev env
    // withCredentials: true,
    timeout: 10000,
  });
})();

export enum Sorting {
  Popular = "popular",
  Recent = "recent",
  Random = "",
}

/**
 * Retrieves a list of results.
 * @param options The browsing options.
 * @returns The number of results alongside the total count available for the query..
 */
export const browse = async ({
  q,
  a,
  t,
  st,
  tt,
  start,
  sorting,
}: {
  q: string,
  a: string,
  t: string,
  st: string,
  tt: string,
  start: string,
  sorting: Sorting,
}): Promise<{
  totalResultsCount: number,
  pageResults: PatternEntry[],
}> => {
  
  const params = {
    q,
    a,
    t,
    st,
    tt, 
    start,
  };
  
  // set the sort option
  if (sorting !== Sorting.Random)
    params[sorting] = 1;

  const encodedParams = encodeQueryParams(params);
  const response = await api.get(`api.php${encodedParams}`);
  
  // result count stored in headers for backwards compatibility with other api users
  const totalResultsCount = Number.parseInt(response.headers["x-result-count"]);
  const pageResults = response.data;
  return {
    totalResultsCount,
    pageResults,
  };
};


/**
 * Retrieves the byte data of an uploaded drawing tool.
 * @param hash The hash of an uploaded drawing tool.
 * @returns The byte data of the drawing tool.
 */
export const view = async (
  hash: string,
): Promise<string> => {
  const response = await api.get(`api.php${encodeQueryParams({view: hash})}`);
  return response.data;
};


/**
 * Publishes a pattern.
 * @param pattData The pattern byte data.
 * @param styleA A style tag.
 * @param styleB B style tag.
 * @param styleC C style tag.
 * @param typeA A type tag.
 * @param typeB B type tag.
 * @param typeC C type tag.
 * @param NSFW Whether pattern is NSFW.
 * @returns Confirmation object.
 */
export const upload = async (
  pattData: string,
  styleA: string,
  styleB: string,
  styleC: string,
  typeA: string,
  typeB: string,
  typeC: string,
  NSFW: boolean,
): Promise<{ error?: string, upload?: string }> => {
  const response = await api.post('api.php', {
    pattern: pattData,
    styletag_a: styleA,
    styletag_b: styleB,
    styletag_c: styleC,
    typetag_a: typeA,
    typetag_b: typeB,
    typetag_c: typeC,
    nokids: NSFW
      ? "Y"
      : "",
  });
  return response.data;
};


/**
 * Logs in a moderator.
 * @param username Moderator username.
 * @param password Moderator password.
 * @returns An authentication token.
 */
export const modLogIn = async (
  username: string,
  password: string,
): Promise<string> => {
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


/**
 * Retrieve a random slice of the pending queue.
 * @param token Authentication token.
 * @returns A random slice of the pending queue.
 */
export const modPending = async (
  token: string,
): Promise<PatternEntry[]> => {
  const response = await api.get(`api.php${encodeQueryParams({modqueue: 1, token})}`);
  return response.data;
};


/**
 * Approves a PatternEntry.
 * @param hash The hash of the DrawingTool belonging of an PatternEntry.
 * @param options The uploading uptions.
 * @param token Authentication token.
 * @returns Confirmation object.
 */
export const modApprove = async (
  hash: string,
  options: UploadEntry,
  token: string,
): Promise<{ approved: boolean }> => {
  const response = await api.post("api.php", {
    ...options,
    approve: hash,
    token,
  });
  return response.data;
};


/**
 * Deletes a PatternEntry.
 * @param hash The hash of the DrawingTool of a PatternEntry.
 * @param token Authentication token.
 * @returns Confirmation object.
 */
export const modDelete = async (
  hash: string,
  token: string,
): Promise<{ deleted: boolean }> => {
  const response = await api.post("api.php", {
    wipepattern: hash,
    token: token
  });
  return response.data;
};


export enum StyleTag {
  Natural = "Natural",
  Cute = "Cute",
  Sporty = "Sporty",
  Cool = "Cool",
  Rustic = "Rustic",
  Hip = "Hip",
  Harmonious = "Harmonious",
  Elegant = "Elegant",
  Modern = "Modern",
  Historical = "Historical",
  Civic = "Civic",
  Silly = "Silly",
  Spooky = "Spooky",
  SciFi = "Sci-Fi",
  Aquatic = "Aquatic",
  Floral = "Floral",
  Animal = "Animal",
  Holiday = "Holiday",
  Food = "Food",
  Brand = "Brand",
  VideoGame = "Video Game",
  Anime = "Anime",
  Meme = "Meme",
}

export enum TypeTag {
  Path = "Path",
  Clothing = "Clothing",
  Hat = "Hat",
  Wallpaper = "Wallpaper",
  Carpet = "Carpet",
  Furniture = "Furniture",
  Flag = "Flag",
  Sign = "Sign",
  Logo = "Logo",
  Poster = "Poster",
}


export default {
  view,
  browse,
  upload,
  modLogIn,
  modPending,
  modApprove,
  modDelete,
};