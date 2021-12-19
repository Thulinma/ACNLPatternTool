import {
  BitMatrix,
  DecodeHintType,
  DetectorResult,
  ResultPointCallback,
} from '@zxing/library/esm';
import Detector from "@zxing/library/esm/core/qrcode/detector/Detector";
import FinderPatternInfo from "@zxing/library/esm/core/qrcode/detector/FinderPatternInfo";
import AcFinderPatternFinder from "./AcFinderPatternFinder";


/**
 * Patched Detector for multi-QR reading.
 */
class MyDetector extends Detector {

  public detectMultiple(hints: Map<DecodeHintType, any>): Array<DetectorResult> {
    // @ts-ignore
    this.resultPointCallback = (hints === null || hints === undefined) ? null :
    /*(ResultPointCallback) */hints.get(DecodeHintType.NEED_RESULT_POINT_CALLBACK);
    const finder = new AcFinderPatternFinder(
      // @ts-ignore
      <BitMatrix>this.image,
      // @ts-ignore
      <ResultPointCallback>this.resultPointCallback
    );
    const infos = finder.findMultiple(hints);
    return this.processMultipleFinderPatternInfo(infos);
  }

  public processMultipleFinderPatternInfo(info: Array<FinderPatternInfo>): Array<DetectorResult> {
    return info.map(i => { return super.processFinderPatternInfo(i); });
  }
}

export default MyDetector;