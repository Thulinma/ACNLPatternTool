import {
  Exception,
  Result,
} from '@zxing/library/esm';


/**
 * Callback format for continuous decode scan.
 */
type AcDecodeContinuouslyCallback = (results: Array<Result>, error?: Exception) => any;
export default AcDecodeContinuouslyCallback;