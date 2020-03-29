import {
  BigInt,
  asUintN,
  bitwiseXor,
  multiply
} from "jsbi";

///Calculates FNV-1a 128-bit hash on a string, ArrayBuffer or Uint8Array.
function fnv1a128(v, start = 0, maxVal = 9000) {
  let hash = BigInt("144066263297769815596495629667062367629");
  const fnvPrime = BigInt("309485009821345068724781371");

  if ((typeof v) == "string"){
    const j = Math.min(start+maxVal, v.length);
    for (let i = start; i < j; i++) {
      hash = bitwiseXor(hash, BigInt(v.charCodeAt(i)));
      hash = asUintN(128, multiply(hash, fnvPrime));
    }
  }
  else if (v instanceof Uint8Array){
    const j = Math.min(start+maxVal, v.byteLength);
    for (let i = start; i < j; i++) {
      hash = bitwiseXor(hash, BigInt(v[i]));
      hash = asUintN(128, multiply(hash, fnvPrime));
    }
  }
  else if (v instanceof ArrayBuffer){
    const b = new Uint8Array(v);
    const j = Math.min(start+maxVal, b.byteLength);
    for (let i = start; i < j; i++) {
      hash = bitwiseXor(hash, BigInt(b[i]));
      hash = asUintN(128, multiply(hash, fnvPrime));
    }
  }
  return ("0000000000000000000000000000000" + hash.toString(16)).substr(-32);
}

export default fnv1a128;

