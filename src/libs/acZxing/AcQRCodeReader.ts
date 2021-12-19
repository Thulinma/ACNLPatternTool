import {
  BinaryBitmap,
  DecodeHintType,
  QRCodeReader,
  Result,
  DecoderResult,
  BarcodeFormat,
  ResultMetadataType,
} from '@zxing/library/esm';
import ResultPoint from "@zxing/library/esm/core/ResultPoint";
import AcDetector from "./AcDetector";
import QRCodeDecoderMetaData from "@zxing/library/esm/core/qrcode/decoder/QRCodeDecoderMetaData";

/**
 * Patched QRCodeReader for multi-QR reading.
 */
class MyQRCodeReader extends QRCodeReader {

  public decodeMultiple(image: BinaryBitmap, hints?: Map<DecodeHintType, any>): Array<Result> {
    let decoderResults: Array<DecoderResult>;
    let decoderResultsPoints: Array<Array<ResultPoint>>;
    if (hints !== undefined && hints !== null && undefined !== hints.get(DecodeHintType.PURE_BARCODE)) {
      // @ts-ignore
      const bits = MyQRCodeReader.extractPureBits(image.getBlackMatrix());
      decoderResults = [this.getDecoder().decodeBitMatrix(bits, hints)];
      // @ts-ignore
      decoderResultsPoints = [(<ResultPoint>QRCodeReader.NO_POINTS)];
    }
    else {
      const detectorResults = new AcDetector(image.getBlackMatrix()).detectMultiple(hints);
      decoderResults = detectorResults.map((detectorResult) => {
        return this.getDecoder().decodeBitMatrix(detectorResult.getBits(), hints);
      });
      decoderResultsPoints = detectorResults.map((detectorResult) => {
        return detectorResult.getPoints();
      });
    }

    const results: Array<Result> = decoderResults.map((decoderResult, index) => {
      if (decoderResult.getOther() instanceof QRCodeDecoderMetaData) {
        (<QRCodeDecoderMetaData>decoderResult.getOther()).applyMirroredCorrection(decoderResultsPoints[index]);
      }
      const result = new Result(
        decoderResult.getText(),
        decoderResult.getRawBytes(),
        undefined, decoderResultsPoints[index],
        BarcodeFormat.QR_CODE, undefined
      );
      const byteSegments: Array<Uint8Array> = decoderResult.getByteSegments();
      if (byteSegments !== null) {
        result.putMetadata(ResultMetadataType.BYTE_SEGMENTS, byteSegments);
      }
      const ecLevel: string = decoderResult.getECLevel();
      if (ecLevel !== null) {
        result.putMetadata(ResultMetadataType.ERROR_CORRECTION_LEVEL, ecLevel);
      }
      if (decoderResult.hasStructuredAppend()) {
        result.putMetadata(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE,
          decoderResult.getStructuredAppendSequenceNumber());
        result.putMetadata(ResultMetadataType.STRUCTURED_APPEND_PARITY,
          decoderResult.getStructuredAppendParity());
      }
      return result;
    });

    return results;
  }

}

export default MyQRCodeReader;