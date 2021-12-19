import Encoder from "@zxing/library/esm/core/qrcode/encoder/Encoder";
import EncodeHintType from "@zxing/library/esm/core/EncodeHintType";
import BitArray from "@zxing/library/esm/core/common/BitArray";
import CharacterSetECI from "@zxing/library/esm/core/common/CharacterSetECI";
import ErrorCorrectionLevel from "@zxing/library/esm/core/qrcode/decoder/ErrorCorrectionLevel";
import Mode from "@zxing/library/esm/core/qrcode/decoder/Mode";
import Version from "@zxing/library/esm/core/qrcode/decoder/Version";
import ByteMatrix from "@zxing/library/esm/core/qrcode/encoder/ByteMatrix";
import QRCode from "@zxing/library/esm/core/qrcode/encoder/QRCode";
import ECBlocks from "@zxing/library/esm/core/qrcode/decoder/ECBlocks";
import MatrixUtil from "@zxing/library/esm/core/qrcode/encoder/MatrixUtil";
import WriterException from "@zxing/library/esm/core/WriterException";

// index number of current frame, index of final frame
type SequenceHint = [number, number, number];

export const STRUCTURED_APPEND = Symbol();

// @ts-expect-error
class MyEncoder extends Encoder {
  public static encode(
    content: Uint8Array,
    ecLevel: ErrorCorrectionLevel,
    hints: Map<EncodeHintType, any> = null,
    sequenceHint: SequenceHint = null,
  ): QRCode /*throws WriterException*/ {

    // Determine what character encoding has been specified by the caller, if any
    let encoding: string = Encoder.DEFAULT_BYTE_MODE_ENCODING;
    const hasEncodingHint: boolean = hints !== null && undefined !== hints.get(EncodeHintType.CHARACTER_SET);
    if (hasEncodingHint) {
      encoding = hints.get(EncodeHintType.CHARACTER_SET).toString();
    }

    // Pick an encoding mode appropriate for the content. Note that this will not attempt to use
    // multiple modes / segments even if that were more efficient. Twould be nice.
    const mode: Mode = Mode.BYTE;

    // This will store the header information, like mode and
    // length, as well as "header" segments like an ECI segment.
    const headerBits = new BitArray();

    // Append ECI segment if applicable
    if (mode === Mode.BYTE && (hasEncodingHint || Encoder.DEFAULT_BYTE_MODE_ENCODING !== encoding)) {
      const eci = CharacterSetECI.getCharacterSetECIByName(encoding);
      if (eci !== undefined) {
        // @ts-ignore
        this.appendECI(eci, headerBits);
      }
    }
    
    if (sequenceHint != null){
      headerBits.appendBits(3, 4); // structured extend
      headerBits.appendBits(sequenceHint[0], 4); // current frame number
      headerBits.appendBits(sequenceHint[1], 4); // last frame number
      headerBits.appendBits(sequenceHint[2], 8); // parity byte
    }

    // (With ECI in place,) Write the mode marker
    this.appendModeInfo(mode, headerBits);

    // Collect data within the main segment, separately, to count its size if needed. Don't add it to
    // main payload yet.
    const dataBits = new BitArray();
    // this.appendBytes(content, mode, dataBits, encoding);
    for (let i: number = 0; i < content.length; ++i) {
      const byte: number = content[i];
      dataBits.appendBits(byte, 8);
    }

    let version: Version;
    if (hints !== null && undefined !== hints.get(EncodeHintType.QR_VERSION)) {
      const versionNumber = Number.parseInt(hints.get(EncodeHintType.QR_VERSION).toString(), 10);
      version = Version.getVersionForNumber(versionNumber);
      // @ts-ignore
      const bitsNeeded = this.calculateBitsNeeded(mode, headerBits, dataBits, version);
      // @ts-ignore
      if (!this.willFit(bitsNeeded, version, ecLevel)) {
        throw new WriterException('Data too big for requested version');
      }
    } else {
      // @ts-ignore
      version = this.recommendVersion(ecLevel, mode, headerBits, dataBits);
    }

    const headerAndDataBits = new BitArray();
    headerAndDataBits.appendBitArray(headerBits);
    // Find "length" of main segment and write it
    const numLetters = mode === Mode.BYTE ? dataBits.getSizeInBytes() : content.length;
    this.appendLengthInfo(numLetters, version, mode, headerAndDataBits);
    // Put data together into the overall payload
    headerAndDataBits.appendBitArray(dataBits);

    const ecBlocks: ECBlocks = version.getECBlocksForLevel(ecLevel);
    const numDataBytes = version.getTotalCodewords() - ecBlocks.getTotalECCodewords();

    // Terminate the bits properly.
    this.terminateBits(numDataBytes, headerAndDataBits);

    // Interleave data bits with error correction code.
    const finalBits: BitArray = this.interleaveWithECBytes(headerAndDataBits,
      version.getTotalCodewords(),
      numDataBytes,
      ecBlocks.getNumBlocks());

    const qrCode = new QRCode();

    qrCode.setECLevel(ecLevel);
    qrCode.setMode(mode);
    qrCode.setVersion(version);

    //  Choose the mask pattern and set to "qrCode".
    const dimension = version.getDimensionForVersion();
    const matrix: ByteMatrix = new ByteMatrix(dimension, dimension);
    // @ts-ignore
    const maskPattern = this.chooseMaskPattern(finalBits, ecLevel, version, matrix);
    qrCode.setMaskPattern(maskPattern);

    // Build the matrix and set it to "qrCode".
    MatrixUtil.buildMatrix(finalBits, ecLevel, version, maskPattern, matrix);
    qrCode.setMatrix(matrix);

    return qrCode;
  }
}

export default MyEncoder;