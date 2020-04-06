import LZString from "lz-string";

// pool the injected gltfs together, save on size
let {
  clothing_stand,
  // clothing (ACNL)
  dress_half,
  dress_long,
  dress_none,
  shirt_half,
  shirt_long,
  shirt_none,
  shirt_nrml,
  // easel
  easel,
  // hats (ACNL)
  hat,
  hornhat,
  // hats (ACNH)
  brimmed_cap,
  brimmed_hat,
  knit_cap,
  // clothing (ACNH)
  dress_acnh_short,
  dress_acnh_long,
  dress_acnh_none,
  dress_round,
  dress_balloon,
  robe,
  tank_pro,
  tank_simp,
  tee_short,
  dressshirt_long,
  sweater,
  hoodie,
  coat,
} = process.injected;

const getObjectUrl = (compStr) => {
  let bin = LZString.decompressFromUTF16(compStr);
  let bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i){bytes[i] = bin.charCodeAt(i);};
  const blob = new Blob([bytes], {type: "application/octet-stream"});
  const url = URL.createObjectURL(blob);
  return url;
};

export default {
  getObjectUrl,
  clothing_stand,
  dress_half,
  dress_long,
  dress_none,
  shirt_half,
  shirt_long,
  shirt_none,
  shirt_nrml,
  easel,
  hat,
  hornhat,
  brimmed_cap,
  brimmed_hat,
  knit_cap,
  dress_acnh_short,
  dress_acnh_long,
  dress_acnh_none,
  dress_round,
  dress_balloon,
  robe,
  tank_pro,
  tank_simp,
  tee_short,
  dressshirt_long,
  sweater,
  hoodie,
  coat,
};

