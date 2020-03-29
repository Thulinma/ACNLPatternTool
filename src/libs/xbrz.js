// modified version of @daelsepara's PixelFilterJS's xbrz filter
// original: https://github.com/daelsepara/PixelFilterJS/blob/master/js/filters/xbrz.js

// generates image with xbrz filter and applies it to the same canvas
async function applyFilter(input, output) {
  const filter = new Filter();
  //Apply filter
  const inData = input.getContext('2d').getImageData(0, 0, input.width, input.height);
  filter.Apply(inData.data, inData.width, inData.height, 4, true);
  let newPreview = new ImageData(Common.SizeX, Common.SizeY);
  newPreview.data.set(Common.ScaledImage);
  output.getContext('2d').putImageData(newPreview, 0, 0);
}

// Zenju's XBRz nX family of filters
let ScaleSize = class {

	constructor(scaler) {

		this.scaler = scaler;
		this.size = scaler.Scale();
	}
}

let ImagePointer = class {

	constructor(imageData) {

		this._imageData = imageData;
		this._offset = 0;
	}

	Position(offset) {

		this._offset = offset;
	}

	GetPixel() {

		return this._imageData[this._offset];
	}

	SetPixel(val) {

		this._imageData[this._offset] = val;
	}
}

let BlendType = class {

	// These blend types must fit into 2 bits.
	static get BlendNone() {

		return 0; //do not blend
	}

	static get BlendNormal() {

		return 1; //a normal indication to blend
	}

	static get BlendDominant() {

		return 2; //a strong indication to blend
	}
}

let BlendResult = class {

	constructor() {

		this.f = BlendType.BlendNone;
		this.g = BlendType.BlendNone;
		this.j = BlendType.BlendNone;
		this.k = BlendType.BlendNone;
	}

	Reset() {

		this.f = BlendType.BlendNone;
		this.g = BlendType.BlendNone;
		this.j = BlendType.BlendNone;
		this.k = BlendType.BlendNone;
	}
}

let ScalerCfg = class {

	// These are the default values:
	constructor() {

		this.luminanceWeight = 1.0;
		this.equalColorTolerance = 30.0;
		this.dominantDirectionThreshold = 3.6;
		this.steepDirectionThreshold = 2.2;
	}
}

let Tuple = class {

	constructor(i, j) {

		this.I = i;
		this.J = j;
	}
}

let Constants = class {

	static get Configuration() {

		return this.hasOwnProperty('_Configuration') ? this._Configuration : new ScalerCfg();
	}

	static get MAX_ROTS() {

		return this.hasOwnProperty('_MAX_ROTS') ? this._MAX_ROTS : 4;
	}

	static get MAX_SCALE() {

		return this.hasOwnProperty('_MAX_SCALE') ? this._MAX_SCALE : 6;
	}

	static get MAX_SCALE_SQUARED() {

		return this.hasOwnProperty('_MAX_SCALE_SQUARED') ? this._MAX_SCALE_SQUARED : this.MAX_SCALE * this.MAX_SCALE;
	}

	static get MATRIX_ROTATION() {

		return this.hasOwnProperty('_MATRIX_ROTATION') ? this._MATRIX_ROTATION : [];
	}

	static set MATRIX_ROTATION(v) {

		this._MATRIX_ROTATION = v;
	}

	static get USE_INTERP() {

		return this.hasOwnProperty('_USE_INTERP') ? this._USE_INTERP : false;
	}
}

let Utility = class {

	static getByte(val, N) {

		return (val >>> (8 * N)) & 0xff;
	}

	static _Square(value) {

		return (value * value);
	}
}

let ColorDistanceARGB = class {

	static val(i, luminanceWeight) {

		const r_diff = Utility.getByte(i, 2) * 2 - 255;
		const g_diff = Utility.getByte(i, 1) * 2 - 255;
		const b_diff = Utility.getByte(i, 0) * 2 - 255;

		const k_b = 0.0593; //ITU-R BT.2020 conversion
		const k_r = 0.2627; //
		const k_g = 1 - k_b - k_r;

		const scale_b = 0.5 / (1.0 - k_b);
		const scale_r = 0.5 / (1.0 - k_r);

		const y = k_r * r_diff + k_g * g_diff + k_b * b_diff; //[!], analog YCbCr!
		const c_b = scale_b * (b_diff - y);
		const c_r = scale_r * (r_diff - y);

		return parseFloat(Math.sqrt(Utility._Square(y * luminanceWeight) + Utility._Square(c_b) + Utility._Square(c_r)));
	}

	static DistYCbCr(pix1, pix2, lumaWeight) {

		//http://en.wikipedia.org/wiki/YCbCr#ITU-R_BT.601_conversion
		//YCbCr conversion is a matrix multiplication => take advantage of linearity by subtracting first!
		let rDiff = Common.Red(pix1) - Common.Red(pix2);
		let gDiff = Common.Green(pix1) - Common.Green(pix2);
		let bDiff = Common.Blue(pix1) - Common.Blue(pix2);

		const kB = 0.0722; //ITU-R BT.709 conversion
		const kR = 0.2126; //
		const kG = 1 - kB - kR;

		const scaleB = 0.5 / (1.0 - kB);
		const scaleR = 0.5 / (1.0 - kR);

		let y = kR * rDiff + kG * gDiff + kB * bDiff; //[!], analog YCbCr!
		let cB = scaleB * (bDiff - y);
		let cR = scaleR * (rDiff - y);

		return Math.sqrt(Utility._Square(lumaWeight * y) + Utility._Square(cB) + Utility._Square(cR));
	}

	static DistYCbCrBuffer(pix1, pix2, luminanceWeight) {

		const r_diff = (Common.Red(pix1) - Common.Red(pix2));
		const g_diff = (Common.Green(pix1) - Common.Green(pix2));
		const b_diff = (Common.Blue(pix1) - Common.Blue(pix2));

		let i = (((r_diff + 255) / 2) << 16) | //slightly reduce precision (division by 2) to squeeze value into single byte
			(((g_diff + 255) / 2) << 8) |
			((b_diff + 255) / 2);

		return this.val(i, luminanceWeight);
	}

	static dist(pix1, pix2, luminanceWeight) {

		if (Constants.USE_INTERP)
			return this.DistYCbCr(pix1, pix2, luminanceWeight);

		const a1 = Common.Alpha(pix1) / 255.0;
		const a2 = Common.Alpha(pix2) / 255.0;

		const d = this.DistYCbCrBuffer(pix1, pix2, luminanceWeight);

		if (a1 < a2)
			return a1 * d + 255 * (a2 - a1);
		else
			return a2 * d + 255 * (a1 - a2);

		//alternative?
		//return (a1 * a2 * Utility._Square(d) + Utility._Square(255 * (a1 - a2))) >>> 0;
	}
}

let IColorDist = class {

	_ColorDist(pix1, pix2, luminanceWeight) {

		return pix1 == pix2 ? 0 : ColorDistanceARGB.dist(pix1, pix2, luminanceWeight);
	}

	_(col1, col2) {

		return this._ColorDist(col1, col2, Constants.Configuration.luminanceWeight);
	}
}

let IColorEq = class {

	constructor(a) {

		this._eqColorThres = a;
	}

	_(col1, col2) {

		return ColorDistanceARGB.dist(col1, col2, Constants.Configuration.luminanceWeight) < this._eqColorThres;
	}
}

let Kernel_3X3 = class {

	constructor() {

		this._ = new Array(3 * 3);
		this._.fill(0);
	}
}

let Kernel_4X4 = class {

	constructor() {

		this.a = 0;
		this.b = 0;
		this.c = 0;
		this.d = 0;
		this.e = 0;
		this.f = 0;
		this.g = 0;
		this.h = 0;
		this.i = 0;
		this.j = 0;
		this.k = 0;
		this.l = 0;
		this.m = 0;
		this.n = 0;
		this.o = 0;
		this.p = 0;
	}
}

/*
input kernel area naming convention:
-----------------
| A | B | C | D |
----|---|---|---|
| E | F | G | H | //evalute the four corners between F, G, J, K
----|---|---|---| //input pixel is at position F
| I | J | K | L |
----|---|---|---|
| M | N | O | P |
-----------------
*/

let RotationDegree = class {

	static get Rot0() {

		return 0;
	}

	static get Rot90() {

		return 1;
	}

	static get Rot180() {

		return 2;
	}

	static get Rot270() {

		return 3;
	}
}

let Rot = class {

	static get _() {

		return this.hasOwnProperty('_rot') ? this._rot : 0;
	}

	// Cache the 4 rotations of the 9 positions, a to i.
	static Initialize() {

		this._rot = new Array(9 * 4);

		this.a = 0, this.b = 1, this.c = 2, this.d = 3, this.e = 4, this.f = 5, this.g = 6, this.h = 7, this.i = 8;

		this.deg0 = [
			this.a, this.b, this.c,
			this.d, this.e, this.f,
			this.g, this.h, this.i
		];

		this.deg90 = [
			this.g, this.d, this.a,
			this.h, this.e, this.b,
			this.i, this.f, this.c
		];

		this.deg180 = [
			this.i, this.h, this.g,
			this.f, this.e, this.d,
			this.c, this.b, this.a
		];

		this.deg270 = [
			this.c, this.f, this.i,
			this.b, this.e, this.h,
			this.a, this.d, this.g
		];

		this.rotation = [this.deg0, this.deg90, this.deg180, this.deg270];

		for (let rotDeg = 0; rotDeg < 4; rotDeg++)
			for (let x = 0; x < 9; x++)
				this._rot[(x << 2) + rotDeg] = this.rotation[rotDeg][x];
	}
}

let BlendInfo = class {

	static GetTopL(b) {

		return b & 0x03;
	}

	static GetTopR(b) {

		return (b >> 2) & 0x03;
	}

	static GetBottomR(b) {

		return (b >> 4) & 0x03;
	}

	static GetBottomL(b) {

		return (b >> 6) & 0x03;
	}

	static SetTopL(b, bt) {

		return b | bt;
	}

	static SetTopR(b, bt) {

		return b | (bt << 2);
	}

	static SetBottomR(b, bt) {

		return b | (bt << 4);
	}

	static SetBottomL(b, bt) {

		return b | (bt << 6);
	}

	static Rotate(b, rotDeg) {

		let l = (rotDeg) << 1;
		let r = 8 - l;

		return (b << l) | (b >> r);
	}
}

let Alpha = class {

	static Grad(m, n, dstPtr, col) {

		dstPtr.SetPixel(Interpolate.Interpolate2P2Q(col, dstPtr.GetPixel(), m, n));
	}

	static Blend(m, n, dstPtr, col) {

		if (Constants.USE_INTERP) {

			this.Grad(m, n, dstPtr, col);

		} else {

			let calcColor = function (colFront, colBack) {

				return (colFront * weightFront + colBack * weightBack) / weightSum;
			}

			let p = dstPtr.GetPixel();

			const weightFront = Common.Alpha(col) * m;
			const weightBack = Common.Alpha(p) * (n - m);
			const weightSum = weightFront + weightBack;

			if (weightSum == 0) {

				dstPtr.SetPixel(0);

			} else {

				let a = weightSum / n;
				let r = calcColor(Common.Red(col), Common.Red(p));
				let g = calcColor(Common.Green(col), Common.Green(p));
				let b = calcColor(Common.Blue(col), Common.Blue(p));

				dstPtr.SetPixel(Common.ARGBINT(a, r, g, b));
			}
		}
	}
}

let OutputMatrix = class {

	constructor(scale, output, outWidth) {

		this._n = (scale - 2) * (Constants.MAX_ROTS * Constants.MAX_SCALE_SQUARED);
		this._output = new ImagePointer(output);
		this._outWidth = outWidth;
		this._nr = 0;
		this._outi = 0;
	}

	Move(rotDeg, outi) {

		this._nr = this._n + rotDeg * Constants.MAX_SCALE_SQUARED;
		this._outi = outi;
	}

	Reference(i, j) {

		let rot = Constants.MATRIX_ROTATION[this._nr + parseInt(i * Constants.MAX_SCALE + j)];
		this._output.Position(this._outi + rot.J + rot.I * this._outWidth);

		return this._output;
	}
}

let Scaler_2X = class {

	constructor() {

		this._SCALE = 2;
	}

	Scale() {

		return this._SCALE;
	}

	BlendLineShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
	}

	BlendLineSteep(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
	}

	BlendLineSteepAndShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(1, 0), col);
		Alpha.Blend(1, 4, output.Reference(0, 1), col);
		Alpha.Blend(5, 6, output.Reference(1, 1), col); //[!] fixes 7/8 used in xBR
	}

	BlendLineDiagonal(col, output) {

		Alpha.Blend(1, 2, output.Reference(1, 1), col);
	}

	BlendCorner(col, output) {

		//model a round corner
		Alpha.Blend(21, 100, output.Reference(1, 1), col); //exact: 1 - pi/4 = 0.2146018366
	}
}

let Scaler_3X = class {

	constructor() {

		this._SCALE = 3;
	}

	Scale() {

		return this._SCALE;
	}

	BlendLineShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
	}

	BlendLineSteep(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
	}

	BlendLineSteepAndShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(2, 0), col);
		Alpha.Blend(1, 4, output.Reference(0, 2), col);
		Alpha.Blend(3, 4, output.Reference(2, 1), col);
		Alpha.Blend(3, 4, output.Reference(1, 2), col);
		output.Reference(2, 2).SetPixel(col);
	}

	BlendLineDiagonal(col, output) {

		Alpha.Blend(1, 8, output.Reference(1, 2), col); //conflict with other rotations for this odd scale
		Alpha.Blend(1, 8, output.Reference(2, 1), col);
		Alpha.Blend(7, 8, output.Reference(2, 2), col); //
	}

	BlendCorner(col, output) {

		//model a round corner
		Alpha.Blend(45, 100, output.Reference(2, 2), col); //exact: 0.4545939598
		//Alpha.Blend( 7, 256, output.Reference(2, 1), col); //0.02826017254 -> negligible + avoid conflicts with other rotations for this odd scale
		//Alpha.Blend( 7, 256, output.Reference(1, 2), col); //0.02826017254
	}
}

let Scaler_4X = class {

	constructor() {

		this._SCALE = 4;
	}

	Scale() {

		return this._SCALE;
	}

	BlendLineShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 2, 3), col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 3).SetPixel(col);
	}

	BlendLineSteep(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		Alpha.Blend(3, 4, output.Reference(3, this._SCALE - 2), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
		output.Reference(3, this._SCALE - 1).SetPixel(col);
	}

	BlendLineSteepAndShallow(col, output) {

		Alpha.Blend(3, 4, output.Reference(3, 1), col);
		Alpha.Blend(3, 4, output.Reference(1, 3), col);
		Alpha.Blend(1, 4, output.Reference(3, 0), col);
		Alpha.Blend(1, 4, output.Reference(0, 3), col);
		Alpha.Blend(1, 3, output.Reference(2, 2), col); //[!] fixes 1/4 used in xBR
		output.Reference(3, 3).SetPixel(col);
		output.Reference(3, 2).SetPixel(col);
		output.Reference(2, 3).SetPixel(col);
	}

	BlendLineDiagonal(col, output) {

		Alpha.Blend(1, 2, output.Reference(this._SCALE - 1, this._SCALE / 2), col);
		Alpha.Blend(1, 2, output.Reference(this._SCALE - 2, this._SCALE / 2 + 1), col);
		output.Reference(this._SCALE - 1, this._SCALE - 1).SetPixel(col);
	}

	BlendCorner(col, output) {

		// model a round corner
		Alpha.Blend(68, 100, output.Reference(3, 3), col); //exact: 0.6848532563
		Alpha.Blend(9, 100, output.Reference(3, 2), col); //0.08677704501
		Alpha.Blend(9, 100, output.Reference(2, 3), col); //0.08677704501
	}
}

let Scaler_5X = class {

	constructor() {

		this._SCALE = 5;
	}

	Scale() {

		return this._SCALE;
	}

	BlendLineShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 3, 4), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 2, 3), col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 3).SetPixel(col);
		output.Reference(this._SCALE - 1, 4).SetPixel(col);
		output.Reference(this._SCALE - 2, 4).SetPixel(col);
	}

	BlendLineSteep(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(1, 4, output.Reference(4, this._SCALE - 3), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		Alpha.Blend(3, 4, output.Reference(3, this._SCALE - 2), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
		output.Reference(3, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 2).SetPixel(col);
	}

	BlendLineSteepAndShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		Alpha.Blend(2, 3, output.Reference(3, 3), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
		output.Reference(3, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 1).SetPixel(col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 3).SetPixel(col);
	}

	BlendLineDiagonal(col, output) {

		Alpha.Blend(1, 8, output.Reference(this._SCALE - 1, this._SCALE / 2), col);
		Alpha.Blend(1, 8, output.Reference(this._SCALE - 2, this._SCALE / 2 + 1), col);
		Alpha.Blend(1, 8, output.Reference(this._SCALE - 3, this._SCALE / 2 + 2), col);
		Alpha.Blend(7, 8, output.Reference(4, 3), col);
		Alpha.Blend(7, 8, output.Reference(3, 4), col);
		output.Reference(4, 4).SetPixel(col);
	}

	BlendCorner(col, output) {

		//model a round corner
		Alpha.Blend(86, 100, output.Reference(4, 4), col); //exact: 0.8631434088
		Alpha.Blend(23, 100, output.Reference(4, 3), col); //0.2306749731
		Alpha.Blend(23, 100, output.Reference(3, 4), col); //0.2306749731
		//Alpha.Blend(1, 64, output.Reference(4, 2), col); //0.01676812367 -> negligible + avoid conflicts with other rotations for this odd scale
		//Alpha.Blend(1, 64, output.Reference(2, 4), col); //0.01676812367
	}
}

let Scaler_6X = class {

	constructor() {

		this._SCALE = 6;
	}

	Scale() {

		return this._SCALE;
	}

	BlendLineShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 3, 4), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 2, 3), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 3, 5), col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 3).SetPixel(col);
		output.Reference(this._SCALE - 1, 4).SetPixel(col);
		output.Reference(this._SCALE - 1, 5).SetPixel(col);
		output.Reference(this._SCALE - 2, 4).SetPixel(col);
		output.Reference(this._SCALE - 2, 5).SetPixel(col);
	}

	BlendLineSteep(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(1, 4, output.Reference(4, this._SCALE - 3), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		Alpha.Blend(3, 4, output.Reference(3, this._SCALE - 2), col);
		Alpha.Blend(3, 4, output.Reference(5, this._SCALE - 3), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
		output.Reference(3, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 1).SetPixel(col);
		output.Reference(5, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 2).SetPixel(col);
		output.Reference(5, this._SCALE - 2).SetPixel(col);
	}

	BlendLineSteepAndShallow(col, output) {

		Alpha.Blend(1, 4, output.Reference(0, this._SCALE - 1), col);
		Alpha.Blend(1, 4, output.Reference(2, this._SCALE - 2), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 1), col);
		Alpha.Blend(3, 4, output.Reference(1, this._SCALE - 2), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 1, 0), col);
		Alpha.Blend(1, 4, output.Reference(this._SCALE - 2, 2), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 1, 1), col);
		Alpha.Blend(3, 4, output.Reference(this._SCALE - 2, 3), col);
		output.Reference(2, this._SCALE - 1).SetPixel(col);
		output.Reference(3, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 1).SetPixel(col);
		output.Reference(5, this._SCALE - 1).SetPixel(col);
		output.Reference(4, this._SCALE - 2).SetPixel(col);
		output.Reference(5, this._SCALE - 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 2).SetPixel(col);
		output.Reference(this._SCALE - 1, 3).SetPixel(col);
	}

	BlendLineDiagonal(col, output) {

		Alpha.Blend(1, 2, output.Reference(this._SCALE - 1, this._SCALE / 2), col);
		Alpha.Blend(1, 2, output.Reference(this._SCALE - 2, this._SCALE / 2 + 1), col);
		Alpha.Blend(1, 2, output.Reference(this._SCALE - 3, this._SCALE / 2 + 2), col);
		output.Reference(this._SCALE - 2, this._SCALE - 1).SetPixel(col);
		output.Reference(this._SCALE - 1, this._SCALE - 1).SetPixel(col);
		output.Reference(this._SCALE - 1, this._SCALE - 2).SetPixel(col);
	}

	BlendCorner(col, output) {

		//model a round corner
		Alpha.Blend(97, 100, output.Reference(5, 5), col); //exact: 0.9711013910
		Alpha.Blend(42, 100, output.Reference(4, 5), col); //0.4236372243
		Alpha.Blend(42, 100, output.Reference(5, 4), col); //0.4236372243
		Alpha.Blend(6, 100, output.Reference(5, 3), col); //0.05652034508
		Alpha.Blend(6, 100, output.Reference(3, 5), col); //0.05652034508
	}
}

let Filter = class {

	constructor() {

		Constants.MATRIX_ROTATION = new Array((Constants.MAX_SCALE - 1) * Constants.MAX_SCALE_SQUARED * Constants.MAX_ROTS);

		for (let n = 2; n < Constants.MAX_SCALE + 1; n++) {
			for (let r = 0; r < Constants.MAX_ROTS; r++) {

				let nr = (n - 2) * (Constants.MAX_ROTS * Constants.MAX_SCALE_SQUARED) + r * Constants.MAX_SCALE_SQUARED;

				for (let i = 0; i < Constants.MAX_SCALE; i++) {
					for (let j = 0; j < Constants.MAX_SCALE; j++) {

						Constants.MATRIX_ROTATION[nr + i * Constants.MAX_SCALE + j] = this._BuildMatrixRotation(r, i, j, n);
					}
				}
			}
		}

		Rot.Initialize();
	}

	_BuildMatrixRotation(rotDeg, i, j, n) {

		let iOld = 0;
		let jOld = 0;

		if (rotDeg == 0) {

			iOld = i;
			jOld = j;

		} else {

			//old coordinates before rotation!
			let old = this._BuildMatrixRotation(rotDeg - 1, i, j, n);

			iOld = n - 1 - old.J;
			jOld = old.I;
		}

		return new Tuple(iOld, jOld);
	}

	Apply(Input, srcx, srcy, scale, threshold) {

		scale = Math.max(2, Math.min(scale, 6));

		// make a zero-filled buffer of the given size
		Init.Init(srcx, srcy, scale, scale, threshold);
	

		let src = Common.ToArray(Input, srcx, srcy);
		let dst = new Uint32Array(Common.SizeX * Common.SizeY);

		switch (scale) {

			case 3:

				this.ScaleImage(new ScaleSize(new Scaler_3X()), src, dst, srcx, srcy, 0, srcy)

				break;

			case 4:
				this.ScaleImage(new ScaleSize(new Scaler_4X()), src, dst, srcx, srcy, 0, srcy)

				break;

			case 5:

				this.ScaleImage(new ScaleSize(new Scaler_5X()), src, dst, srcx, srcy, 0, srcy)

				break;

			case 6:

				this.ScaleImage(new ScaleSize(new Scaler_6X()), src, dst, srcx, srcy, 0, srcy)

				break;

			default:

				this.ScaleImage(new ScaleSize(new Scaler_2X()), src, dst, srcx, srcy, 0, srcy)

				break;
		}

		Common.ToImage(Common.ScaledImage, dst, Common.SizeX, Common.SizeY);
	}

	_FillBlock(trg, trgi, pitch, col, blockWidth, blockHeight) {

		for (let y = 0; y < blockHeight; ++y, trgi += pitch)
			for (let x = 0; x < blockWidth; ++x)
				trg[trgi + x] = col;
	}

	_PreProcessCorners(kernel, blendResult, preProcessCornersColorDist) {

		blendResult.Reset();

		if ((kernel.f == kernel.g && kernel.j == kernel.k) || (kernel.f == kernel.j && kernel.g == kernel.k))
			return;

		let dist = preProcessCornersColorDist;

		let weight = 4.0;
		let jg = dist._(kernel.i, kernel.f) + dist._(kernel.f, kernel.c) + dist._(kernel.n, kernel.k) + dist._(kernel.k, kernel.h) + weight * dist._(kernel.j, kernel.g);
		let fk = dist._(kernel.e, kernel.j) + dist._(kernel.j, kernel.o) + dist._(kernel.b, kernel.g) + dist._(kernel.g, kernel.l) + weight * dist._(kernel.f, kernel.k);

		let dominantGradient;

		if (jg < fk) {

			dominantGradient = Constants.Configuration.dominantDirectionThreshold * jg < fk;

			if (kernel.f != kernel.g && kernel.f != kernel.j)
				blendResult.f = dominantGradient ? BlendType.BlendDominant : BlendType.BlendNormal;

			if (kernel.k != kernel.j && kernel.k != kernel.g)
				blendResult.k = dominantGradient ? BlendType.BlendDominant : BlendType.BlendNormal;

		} else if (fk < jg) {

			dominantGradient = Constants.Configuration.dominantDirectionThreshold * fk < jg;

			if (kernel.j != kernel.f && kernel.j != kernel.k)
				blendResult.j = dominantGradient ? BlendType.BlendDominant : BlendType.BlendNormal;

			if (kernel.g != kernel.f && kernel.g != kernel.k)
				blendResult.g = dominantGradient ? BlendType.BlendDominant : BlendType.BlendNormal;
		}
	}

	/*
	input kernel area naming convention:
	-------------
	| A | B | C |
	----|---|---|
	| D | E | F | //input pixel is at position E
	----|---|---|
	| G | H | I |
	-------------
	*/

	blendPixel(scaler, rotDeg, ker, trgi, blendInfo, scalePixelColorEq, scalePixelColorDist, outputMatrix) {

		let b = ker._[Rot._[(1 << 2) + (rotDeg)]];
		let c = ker._[Rot._[(2 << 2) + (rotDeg)]];
		let d = ker._[Rot._[(3 << 2) + (rotDeg)]];
		let e = ker._[Rot._[(4 << 2) + (rotDeg)]];
		let f = ker._[Rot._[(5 << 2) + (rotDeg)]];
		let g = ker._[Rot._[(6 << 2) + (rotDeg)]];
		let h = ker._[Rot._[(7 << 2) + (rotDeg)]];
		let i = ker._[Rot._[(8 << 2) + (rotDeg)]];

		let blend = BlendInfo.Rotate(blendInfo, rotDeg);

		if ((BlendInfo.GetBottomR(blend)) >= BlendType.BlendNormal) {

			let eq = function (pix1, pix2) {

				return scalePixelColorEq._(pix1, pix2);
			}

			let dist = function (pix1, pix2) {

				return scalePixelColorDist._(pix1, pix2);
			}

			let doLineBlend = function () {

				if (BlendInfo.GetBottomR(blend) >= BlendType.BlendDominant)
					return true;

				//make sure there is no second blending in an adjacent rotation for this pixel: handles insular pixels, mario eyes
				if (BlendInfo.GetTopR(blend) != BlendType.BlendNone && !eq(e, g))
					return false;

				if (BlendInfo.GetBottomL(blend) != BlendType.BlendNone && !eq(e, c))
					return false;

				//no full blending for L-shapes; blend corner only (handles "mario mushroom eyes")
				if (!eq(e, i) && eq(g, h) && eq(h, i) && eq(i, f) && eq(f, c))
					return false;

				return true;
			}

			let px = dist(e, f) <= dist(e, h) ? f : h;

			let output = outputMatrix;

			output.Move(rotDeg, trgi);

			if (doLineBlend()) {

				let fg = dist(f, g); //test sample: 70% of values max(fg, hc) / min(fg, hc) are between 1.1 and 3.7 with median being 1.9
				let hc = dist(h, c); //

				let haveShallowLine = Constants.Configuration.steepDirectionThreshold * fg <= hc && e != g && d != g;
				let haveSteepLine = Constants.Configuration.steepDirectionThreshold * hc <= fg && e != c && b != c;

				if (haveShallowLine) {

					if (haveSteepLine) {

						scaler.BlendLineSteepAndShallow(px, output);

					} else {

						scaler.BlendLineShallow(px, output);
					}

				} else {

					if (haveSteepLine) {

						scaler.BlendLineSteep(px, output);

					} else {

						scaler.BlendLineDiagonal(px, output);
					}
				}

			} else {

				scaler.BlendCorner(px, output);
			}
		}
	}

	ScaleImage(scaleSize, src, trg, srcWidth, srcHeight, yFirst, yLast) {

		let x, y, blendResult, sM1, s0, sP1, sP2, xM1, xP1, xP2;

		yFirst = Math.max(yFirst, 0);
		yLast = Math.min(yLast, srcHeight);

		if (yFirst >= yLast || srcWidth <= 0)
			return;

		let trgWidth = srcWidth * scaleSize.size;

		//temporary buffer for "on the fly preprocessing"
		let preProcBuffer = new Uint8ClampedArray(srcWidth);
		preProcBuffer.fill(0);

		let ker3, ker4;

		let preProcessCornersColorDist = new IColorDist();

		//initialize preprocessing buffer for first row:
		//detect upper left and right corner blending
		//this cannot be optimized for adjacent processing
		//stripes; we must not allow for a memory race condition!
		if (yFirst > 0) {

			y = yFirst - 1;

			sM1 = srcWidth * Math.max(y - 1, 0);
			s0 = srcWidth * y; // center line
			sP1 = srcWidth * Math.min(y + 1, srcHeight - 1);
			sP2 = srcWidth * Math.min(y + 2, srcHeight - 1);

			for (x = 0; x < srcWidth; ++x) {

				xM1 = Math.max(x - 1, 0);
				xP1 = Math.min(x + 1, srcWidth - 1);
				xP2 = Math.min(x + 2, srcWidth - 1);

				ker4 = new Kernel_4X4();

				// read sequentially from memory as far as possible
				ker4.a = src[sM1 + xM1];
				ker4.b = src[sM1 + x];
				ker4.c = src[sM1 + xP1];
				ker4.d = src[sM1 + xP2];

				ker4.e = src[s0 + xM1];
				ker4.f = src[s0 + x];
				ker4.g = src[s0 + xP1];
				ker4.h = src[s0 + xP2];

				ker4.i = src[sP1 + xM1];
				ker4.j = src[sP1 + x];
				ker4.k = src[sP1 + xP1];
				ker4.l = src[sP1 + xP2];

				ker4.m = src[sP2 + xM1];
				ker4.n = src[sP2 + x];
				ker4.o = src[sP2 + xP1];
				ker4.p = src[sP2 + xP2];

				blendResult = new BlendResult();

				this._PreProcessCorners(ker4, blendResult, preProcessCornersColorDist); // writes to blendResult

				/*
				preprocessing blend result:
				---------
				| F | G | //evalute corner between F, G, J, K
				----|---| //input pixel is at position F
				| J | K |
				---------
				*/

				preProcBuffer[x] = BlendInfo.SetTopR(preProcBuffer[x], blendResult.j);

				if (x + 1 < srcWidth)
					preProcBuffer[x + 1] = BlendInfo.SetTopL(preProcBuffer[x + 1], blendResult.k);
			}
		}

		let equalColorTolerance = Constants.Configuration.equalColorTolerance;
		let scalePixelColorEq = new IColorEq(equalColorTolerance);
		let scalePixelColorDist = new IColorDist();
		let outputMatrix = new OutputMatrix(scaleSize.size, trg, trgWidth);

		let total = yLast - yFirst;
		let current = 0;

		for (y = yFirst; y < yLast; ++y) {

			//consider MT "striped" access
			let trgi = scaleSize.size * y * trgWidth;

			sM1 = srcWidth * Math.max(y - 1, 0);
			s0 = srcWidth * y; //center line
			sP1 = srcWidth * Math.min(y + 1, srcHeight - 1);
			sP2 = srcWidth * Math.min(y + 2, srcHeight - 1);

			let blendXy1 = 0;

			for (x = 0; x < srcWidth; ++x, trgi += scaleSize.size) {

				xM1 = Math.max(x - 1, 0);
				xP1 = Math.min(x + 1, srcWidth - 1);
				xP2 = Math.min(x + 2, srcWidth - 1);

				ker4 = new Kernel_4X4();

				//read sequentially from memory as far as possible
				ker4.a = src[sM1 + xM1];
				ker4.b = src[sM1 + x];
				ker4.c = src[sM1 + xP1];
				ker4.d = src[sM1 + xP2];

				ker4.e = src[s0 + xM1];
				ker4.f = src[s0 + x];
				ker4.g = src[s0 + xP1];
				ker4.h = src[s0 + xP2];

				ker4.i = src[sP1 + xM1];
				ker4.j = src[sP1 + x];
				ker4.k = src[sP1 + xP1];
				ker4.l = src[sP1 + xP2];

				ker4.m = src[sP2 + xM1];
				ker4.n = src[sP2 + x];
				ker4.o = src[sP2 + xP1];
				ker4.p = src[sP2 + xP2];

				//evaluate the four corners on bottom-right of current pixel
				//blend_xy for current (x, y) position
				let blendXy = 0;

				{
					blendResult = new BlendResult();

					this._PreProcessCorners(ker4, blendResult, preProcessCornersColorDist); // writes to blendResult

					/*
					preprocessing blend result:
					---------
					| F | G | //evaluate corner between F, G, J, K
					----|---| //current input pixel is at position F
					| J | K |
					---------
					*/

					//all four corners of (x, y) have been determined at
					//this point due to processing sequence!
					blendXy = BlendInfo.SetBottomR(preProcBuffer[x], blendResult.f);

					//set 2nd known corner for (x, y + 1)
					blendXy1 = BlendInfo.SetTopR(blendXy1, blendResult.j);
					//store on current buffer position for use on next row
					preProcBuffer[x] = blendXy1;

					//set 1st known corner for (x + 1, y + 1) and
					//buffer for use on next column
					blendXy1 = BlendInfo.SetTopL(0, blendResult.k);

					//set 3rd known corner for (x + 1, y)
					if (x + 1 < srcWidth)
						preProcBuffer[x + 1] = BlendInfo.SetBottomL(preProcBuffer[x + 1], blendResult.g);
				}

				//fill block of size scale * scale with the given color
				//place *after* preprocessing step, to not overwrite the
				//results while processing the the last pixel!
				this._FillBlock(trg, trgi, trgWidth, ker4.f, scaleSize.size, scaleSize.size);

				//blend four corners of current pixel
				if (blendXy == 0)
					continue;

				const a = 0,
					b = 1,
					c = 2,
					d = 3,
					e = 4,
					f = 5,
					g = 6,
					h = 7,
					i = 8;

				//read sequentially from memory as far as possible
				ker3 = new Kernel_3X3();

				ker3._[a] = ker4.a;
				ker3._[b] = ker4.b;
				ker3._[c] = ker4.c;

				ker3._[d] = ker4.e;
				ker3._[e] = ker4.f;
				ker3._[f] = ker4.g;

				ker3._[g] = ker4.i;
				ker3._[h] = ker4.j;
				ker3._[i] = ker4.k;

				this.blendPixel(scaleSize.scaler, RotationDegree.Rot0, ker3, trgi, blendXy, scalePixelColorEq, scalePixelColorDist, outputMatrix);
				this.blendPixel(scaleSize.scaler, RotationDegree.Rot90, ker3, trgi, blendXy, scalePixelColorEq, scalePixelColorDist, outputMatrix);
				this.blendPixel(scaleSize.scaler, RotationDegree.Rot180, ker3, trgi, blendXy, scalePixelColorEq, scalePixelColorDist, outputMatrix);
				this.blendPixel(scaleSize.scaler, RotationDegree.Rot270, ker3, trgi, blendXy, scalePixelColorEq, scalePixelColorDist, outputMatrix);
			}

			current++;

			// notify({ ScalingProgress: current / total });
		}
	}
}


// static class methods for common filter operations
class Common {

    static get Threshold() {

        return this.hasOwnProperty('_Threshold') ? this._Threshold : false;
    }

    static set Threshold(v) {

        this._Threshold = v;
    }

    static get ScaleX() {

        return this.hasOwnProperty('_ScaleX') ? this._ScaleX : parseInt(0);
    }

    static set ScaleX(v) {

        this._ScaleX = parseInt(v);
    }

    static get ScaleY() {

        return this.hasOwnProperty('_ScaleY') ? this._ScaleY : parseInt(0);
    }

    static set ScaleY(v) {

        this._ScaleY = parseInt(v);
    }

    static get SizeX() {

        return this.hasOwnProperty('_SizeX') ? this._SizeX : parseInt(0);
    }

    static set SizeX(v) {

        this._SizeX = parseInt(v);
    }

    static get SizeY() {

        return this.hasOwnProperty('_SizeY') ? this._SizeY : parseInt(0);
    }

    static set SizeY(v) {

        this._SizeY = parseInt(v);
    }

    static get ScaledImage() {

        return this.hasOwnProperty('_ScaledImage') ? this._ScaledImage : [];
    }

    static set ScaledImage(v) {

        this._ScaledImage = v;
    }

    static Copy(dst, src, Length) {

        for (let i = 0; i < Length; i++)
            dst[i] = this._Clip8(src[i]);
    }

    static Copy2D(dst, src, dstx, dsty, srcx, srcy) {

        const Channels = 4;

        let xdim = Math.min(srcx, dstx);
        let ydim = Math.min(srcy, dsty);

        for (let y = 0; y < ydim; y++)
            for (let x = 0; x < xdim; x++)
                for (let Channel = 0; Channel < Channels; Channel++)
                    dst[(y * dstx + x) * Channels + Channel] = src[(y * srcx + x) * Channels + Channel];
    }

    static CopyPadded(src, srcx, srcy, scale) {

        const Channels = 4;

        let dim = Math.max(srcx, srcy);
        dim = Common.NextPow(dim, scale);

        let dst = new Uint8ClampedArray(dim * dim * Channels);

        Common.Copy2D(dst, src, dim, dim, srcx, srcy);

        return dst;
    }

    static CopyCropped(dst, src, dstx, dsty, srcx, srcy) {

        Common.Copy2D(dst, src, dstx, dsty, srcx, srcy);
    }

    static ToArray(Input, srcx, srcy) {

        let dst = new Uint32Array(srcx * srcy);

        let Channels = 4;

        for (let y = 0; y < srcy; y++) {

            for (let x = 0; x < srcx; x++) {

                let index = y * srcx + x;
                let pixel = index * Channels;

                let r = Input[pixel];
                let g = Input[pixel + 1];
                let b = Input[pixel + 2];
                let a = Input[pixel + 3];

                dst[index] = this.ARGBINT(a, r, g, b);
            }
        }

        return dst;
    }

    static ToImage(dst, src, srcx, srcy) {

        let Channels = 4;

        for (let y = 0; y < srcy; y++) {
            for (let x = 0; x < srcx; x++) {

                let index = y * srcx + x;
                let pixel = index * Channels;

                dst[pixel] = this.Red(src[index]);
                dst[pixel + 1] = this.Green(src[index]);
                dst[pixel + 2] = this.Blue(src[index]);
                dst[pixel + 3] = this.Alpha(src[index]);
            }
        }
    }

    static _CLR(Input, srcx, srcy, x, y) {

        const Channels = 4;

        if (y >= 0 && y < srcy && x >= 0 && x < srcx) {

            let index = (y * srcx + x) * Channels;

            let r = Input[index];
            let g = Input[index + 1];
            let b = Input[index + 2];
            let a = Input[index + 3];

            return this.ARGBINT(a, r, g, b);
        }

        return 0;
    }

    static CLR(Input, srcx, srcy, x, y, dx = 0, dy = 0) {

        let xx = parseInt(x + dx);
        let yy = parseInt(y + dy);

        xx = Math.max(0, Math.min(srcx - 1, xx));
        yy = Math.max(0, Math.min(srcy - 1, yy));

        return this._CLR(Input, srcx, srcy, xx, yy);
    }

    static Alpha(rgb) {

        return parseInt(rgb >>> 24);
    }

    static Red(rgb) {

        return parseInt((rgb >>> 0 & 0x00FF0000) >> 16);
    }

    static Green(rgb) {

        return parseInt((rgb >>> 0 & 0x0000FF00) >> 8);
    }

    static Blue(rgb) {

        return parseInt(rgb >>> 0 & 0x000000FF);
    }

    static Brightness(rgb) {

        let dwordC = rgb & 0xFFFFFF;

        return this._Clip8((this.Red(dwordC) * 3 + this.Green(dwordC) * 3 + this.Blue(dwordC) * 2) >> 3);
    }

    static Luminance(rgb) {

        let r = parseFloat(this.Red(rgb));
        let g = parseFloat(this.Green(rgb));
        let b = parseFloat(this.Blue(rgb));

        return parseInt(0.299 * r + 0.587 * g + 0.114 * b);
    }

    static ChromaU(rgb) {

        let r = parseFloat(this.Red(rgb));
        let g = parseFloat(this.Green(rgb));
        let b = parseFloat(this.Blue(rgb));

        return parseInt(0.5 * r - 0.418688 * g - 0.081312 * b + 127.5);
    }

    static ChromaV(rgb) {

        let r = parseFloat(this.Red(rgb));
        let g = parseFloat(this.Green(rgb));
        let b = parseFloat(this.Blue(rgb));

        return parseInt(-0.168736 * r - 0.331264 * g + 0.5 * b + 127.5);
    }

    static IsLike(pixel1, pixel2) {

        if (!this.Threshold)
            return pixel1 == pixel2;

        const _LUMINANCE_TRIGGER = 48;
        const _CHROMA_U_TRIGGER = 7;
        const _CHROMA_V_TRIGGER = 6;

        let delta = this.Luminance(pixel1) - this.Luminance(pixel2);

        if (Math.abs(delta) > _LUMINANCE_TRIGGER)
            return false;

        delta = this.ChromaV(pixel1) - this.ChromaV(pixel2);

        if (Math.abs(delta) > _CHROMA_V_TRIGGER)
            return false;

        delta = this.ChromaU(pixel1) - this.ChromaU(pixel2);

        return Math.abs(delta) <= _CHROMA_U_TRIGGER;
    }

    static IsNotLike(pixel1, pixel2) {

        return !this.IsLike(pixel1, pixel2);
    }

    static _Clip8(color) {

        return Math.max(0, Math.min(255, color));
    }

    static _Write4RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B) {

        if (x >= 0 && x < sizex && y >= 0 && y < sizey) {

            const Channels = 4;

            let dx = x * this.ScaleX;
            let dy = y * this.ScaleY;

            dx += (Pixel == 2 || Pixel == 4) ? 1 : 0;
            dy += (Pixel == 3 || Pixel == 4) ? 1 : 0;

            let dst = (dy * sizex * this.ScaleX + dx) * Channels;

            Output[dst] = this._Clip8(R);
            Output[dst + 1] = this._Clip8(G);
            Output[dst + 2] = this._Clip8(B);
            Output[dst + 3] = this._Clip8(A);
        }
    }

    static Write4RGBA(Output, sizex, sizey, x, y, Pixel, argb) {

        let R = this.Red(argb);
        let G = this.Green(argb);
        let B = this.Blue(argb);
        let A = this.Alpha(argb);

        this._Write4RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B);
    }

    static _Write9RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B) {
        if (x >= 0 && x < sizex && y >= 0 && y < sizey) {

            const Channels = 4;

            let deltax = 0;
            let deltay = 0;

            if (Pixel == 2 || Pixel == 5 || Pixel == 8) {

                deltax = 1;
            }

            if (Pixel == 3 || Pixel == 6 || Pixel == 9) {

                deltax = 2;
            }

            if (Pixel == 4 || Pixel == 5 || Pixel == 6) {

                deltay = 1;
            }

            if (Pixel == 7 || Pixel == 8 || Pixel == 9) {

                deltay = 2;
            }

            let dx = x * this.ScaleX + deltax;
            let dy = y * this.ScaleY + deltay;

            let dst = (dy * sizex * this.ScaleX + dx) * Channels;

            Output[dst] = this._Clip8(R);
            Output[dst + 1] = this._Clip8(G);
            Output[dst + 2] = this._Clip8(B);
            Output[dst + 3] = this._Clip8(A);
        }
    }

    static Write9RGBA(Output, sizex, sizey, x, y, Pixel, argb) {

        let R = this.Red(argb);
        let G = this.Green(argb);
        let B = this.Blue(argb);
        let A = this.Alpha(argb);

        this._Write9RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B);
    }

    static _Write16RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B) {

        if (x >= 0 && x < sizex && y >= 0 && y < sizey) {

            const Channels = 4;

            let deltax = 0;
            let deltay = 0;

            /*
            01 02 03 04
            05 06 07 08
            09 10 11 12
            13 14 15 16
            */

            if (Pixel == 2 || Pixel == 6 || Pixel == 10 || Pixel == 14) {

                deltax = 1;
            }

            if (Pixel == 3 || Pixel == 7 || Pixel == 11 || Pixel == 15) {

                deltax = 2;
            }

            if (Pixel == 4 || Pixel == 8 || Pixel == 12 || Pixel == 16) {

                deltax = 3;
            }

            if (Pixel == 5 || Pixel == 6 || Pixel == 7 || Pixel == 8) {

                deltay = 1;
            }

            if (Pixel == 9 || Pixel == 10 || Pixel == 11 || Pixel == 12) {

                deltay = 2;
            }

            if (Pixel == 13 || Pixel == 14 || Pixel == 15 || Pixel == 16) {

                deltay = 3;
            }

            let dx = x * this.ScaleX + deltax;
            let dy = y * this.ScaleY + deltay;

            let dst = (dy * sizex * this.ScaleX + dx) * Channels;

            Output[dst] = this._Clip8(R);
            Output[dst + 1] = this._Clip8(G);
            Output[dst + 2] = this._Clip8(B);
            Output[dst + 3] = this._Clip8(A);
        }
    }

    static Write16RGBA(Output, sizex, sizey, x, y, Pixel, argb) {

        let R = this.Red(argb);
        let G = this.Green(argb);
        let B = this.Blue(argb);
        let A = this.Alpha(argb);

        this._Write16RGBA(Output, sizex, sizey, x, y, Pixel, A, R, G, B);
    }

    static WriteMagnify(Input, Output, sizex, sizey, x, y) {

        const Channels = 4;

        let x0 = x * this.ScaleX;
        let y0 = y * this.ScaleY;

        for (let deltay = 0; deltay < this.ScaleY; deltay++) {
            for (let deltax = 0; deltax < this.ScaleX; deltax++) {

                let dx = x0 + deltax;
                let dy = y0 + deltay;

                let dst = (dy * sizex * this.ScaleX + dx) * Channels;

                let index = (y * sizex + x) * Channels;

                for (let Channel = 0; Channel < Channels; Channel++) {

                    Output[dst + Channel] = Input[index + Channel];
                }
            }
        }
    }

    static RGBINT(r, g, b) {

        return parseInt((this._Clip8(r) << 16) + (this._Clip8(g) << 8) + this._Clip8(b));
    }

    static ARGBINT(a, r, g, b) {

        return ((((((a) >>> 0) << 24) >>> 0) | (((r) << 16) + ((g) << 8) + ((b)))) >>> 0);
    }

    static Truncate(color) {

        return this._Clip8(color);
    }

    static NextPow(v, scale) {

        let dim = 1;

        for (let i = 0; i < 10; i++) {

            if (v <= dim)
                break;

            dim *= scale;
        }

        return dim;
    }
}

// brightness control
class Brightness {

    static AdjustBrightness(color, level) {

        return Common.Truncate(color + level);
    }
}

// color interpolation
class Interpolate {

    static Interpolate3P(pixel1, pixel2, pixel3) {

        let r = parseInt(parseInt(Common.Red(pixel1) + Common.Red(pixel2) + Common.Red(pixel3)) / 3);
        let g = parseInt(parseInt(Common.Green(pixel1) + Common.Green(pixel2) + Common.Green(pixel3)) / 3);
        let b = parseInt(parseInt(Common.Blue(pixel1) + Common.Blue(pixel2) + Common.Blue(pixel3)) / 3);
        let a = parseInt(parseInt(Common.Alpha(pixel1) + Common.Alpha(pixel2) + Common.Alpha(pixel3)) / 3);

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate2P(pixel1, pixel2) {

        let r = parseInt(parseInt(Common.Red(pixel1) + Common.Red(pixel2)) >> 1);
        let g = parseInt(parseInt(Common.Green(pixel1) + Common.Green(pixel2)) >> 1);
        let b = parseInt(parseInt(Common.Blue(pixel1) + Common.Blue(pixel2)) >> 1);
        let a = parseInt(parseInt(Common.Alpha(pixel1) + Common.Alpha(pixel2)) >> 1);

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate2P1Q(pixel1, pixel2, quantifier) {

        let r = parseInt(parseInt(Common.Red(pixel1) * (1.0 - quantifier) + Common.Red(pixel2) * quantifier));
        let g = parseInt(parseInt(Common.Green(pixel1) * (1.0 - quantifier) + Common.Green(pixel2) * quantifier));
        let b = parseInt(parseInt(Common.Blue(pixel1) * (1.0 - quantifier) + Common.Blue(pixel2) * quantifier));
        let a = parseInt(parseInt(Common.Alpha(pixel1) * (1.0 - quantifier) + Common.Alpha(pixel2) * quantifier));

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate2P2Q(pixel1, pixel2, quantifier1, quantifier2) {

        let total = (quantifier1 + quantifier2);

        let r = parseInt(((Common.Red(pixel1) * quantifier1 + Common.Red(pixel2) * quantifier2)) / total);
        let g = parseInt(((Common.Green(pixel1) * quantifier1 + Common.Green(pixel2) * quantifier2)) / total);
        let b = parseInt(((Common.Blue(pixel1) * quantifier1 + Common.Blue(pixel2) * quantifier2)) / total);
        let a = parseInt(((Common.Alpha(pixel1) * quantifier1 + Common.Alpha(pixel2) * quantifier2)) / total);

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate3P3Q(pixel1, pixel2, pixel3, quantifier1, quantifier2, quantifier3) {

        let total = parseInt(quantifier1 + quantifier2 + quantifier3);

        let r = parseInt((Common.Red(pixel1) * quantifier1 + Common.Red(pixel2) * quantifier2 + Common.Red(pixel3) * quantifier3) / total);
        let g = parseInt((Common.Green(pixel1) * quantifier1 + Common.Green(pixel2) * quantifier2 + Common.Green(pixel3) * quantifier3) / total);
        let b = parseInt((Common.Blue(pixel1) * quantifier1 + Common.Blue(pixel2) * quantifier2 + Common.Blue(pixel3) * quantifier3) / total);
        let a = parseInt((Common.Alpha(pixel1) * quantifier1 + Common.Alpha(pixel2) * quantifier2 + Common.Alpha(pixel3) * quantifier3) / total);

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate4P(pixel1, pixel2, pixel3, pixel4) {

        let r = parseInt((Common.Red(pixel1) + Common.Red(pixel2) + Common.Red(pixel3) + Common.Red(pixel4)) >> 2);
        let g = parseInt((Common.Green(pixel1) + Common.Green(pixel2) + Common.Green(pixel3) + Common.Green(pixel4)) >> 2);
        let b = parseInt((Common.Blue(pixel1) + Common.Blue(pixel2) + Common.Blue(pixel3) + Common.Blue(pixel4)) >> 2);
        let a = parseInt((Common.Alpha(pixel1) + Common.Alpha(pixel2) + Common.Alpha(pixel3) + Common.Alpha(pixel4)) >> 2);

        return Common.ARGBINT(a, r, g, b);
    }

    static Interpolate4P4Q(pixel1, pixel2, pixel3, pixel4, quantifier1, quantifier2, quantifier3, quantifier4) {

        let total = parseInt(quantifier1 + quantifier2 + quantifier3 + quantifier4);

        let r = parseInt((Common.Red(pixel1) * quantifier1 + Common.Red(pixel2) * quantifier2 + Common.Red(pixel3) * quantifier3 + Common.Red(pixel4) * quantifier4) / total);
        let g = parseInt((Common.Green(pixel1) * quantifier1 + Common.Green(pixel2) * quantifier2 + Common.Green(pixel3) * quantifier3 + Common.Green(pixel4) * quantifier4) / total);
        let b = parseInt((Common.Blue(pixel1) * quantifier1 + Common.Blue(pixel2) * quantifier2 + Common.Blue(pixel3) * quantifier3 + Common.Blue(pixel4) * quantifier4) / total);
        let a = parseInt((Common.Alpha(pixel1) * quantifier1 + Common.Alpha(pixel2) * quantifier2 + Common.Alpha(pixel3) * quantifier3 + Common.Alpha(pixel4) * quantifier4) / total);

        return Common.ARGBINT(a, r, g, b);
    }

    static Mixpal(c1, c2) {

        return (this.Interpolate2P2Q(c1, c2, 3, 1));
    }

    static Fix(n, min, max) {

        return Math.max(Math.min(n, max), min);
    }

    static Unmix(c1, c2) {

        /* A variant of an unsharp mask, without the blur part. */

        let ra = Common.Red(c1);
        let ga = Common.Green(c1);
        let ba = Common.Blue(c1);
        let aa = Common.Alpha(c1);

        let rb = Common.Red(c2);
        let gb = Common.Green(c2);
        let bb = Common.Blue(c2);
        let ab = Common.Alpha(c2);

        let r = ((this.Fix((ra + (ra - rb)), 0, 255) + rb) >> 1);
        let g = ((this.Fix((ga + (ga - gb)), 0, 255) + gb) >> 1);
        let b = ((this.Fix((ba + (ba - bb)), 0, 255) + bb) >> 1);
        let a = ((this.Fix((aa + (aa - ab)), 0, 255) + ab) >> 1);

        return Common.ARGBINT(a, r, g, b);
    }
}

// image flips
class Flip {

    static FlipUD(src, sizex, sizey) {

        const Channels = 4;

        if (src.length > 0) {

            for (let y = 0; y < sizey / 2; y++) {
                for (let x = 0; x < sizex; x++) {

                    let index = (y * sizex + x) * Channels;
                    let rev = ((sizey - y - 1) * sizex + x) * Channels;

                    for (let Channel = 0; Channel < Channels; Channel++) {

                        let temp = src[index + Channel];
                        src[index + Channel] = src[rev + Channel];
                        src[rev + Channel] = temp;
                    }
                }
            }
        }
    }

    static FlipLR(src, sizex, sizey) {

        const Channels = 4;

        if (src.length > 0) {

            for (let y = 0; y < sizey; y++) {
                for (let x = 0; x < sizex / 2; x++) {

                    let index = (y * sizex + x) * Channels;
                    let rev = (y * sizex + (sizex - x - 1)) * Channels;

                    for (let Channel = 0; Channel < Channels; Channel++) {

                        let temp = src[index + Channel];
                        src[index + Channel] = src[rev + Channel];
                        src[rev + Channel] = temp;
                    }
                }
            }
        }
    }
}

class Rotate {

    static Transpose(dst, src, srcx, srcy) {

        const Channels = 4;

        for (let y = 0; y < srcy; y++) {
            for (let x = 0; x < srcx; x++) {
                for (let Channel = 0; Channel < Channels; Channel++) {

                    dst[(x * srcy + y) * Channels + Channel] = src[(y * srcx + x) * Channels + Channel];
                }
            }
        }
    }

    static Rotate90(dst, src, srcx, srcy) {

        this.Transpose(dst, src, srcx, srcy);

        Flip.FlipUD(dst, srcy, srcx);
    }

    static Rotate180(dst, src, srcx, srcy) {

        const Channels = 4;

        Common.Copy(dst, src, srcx * srcy * Channels);

        Flip.FlipUD(dst, srcx, srcy);

        Flip.FlipLR(dst, srcx, srcy);
    }

    static Rotate270(dst, src, srcx, srcy) {

        Flip.FlipUD(src, srcx, srcy);

        this.Transpose(dst, src, srcx, srcy);
    }
}

class Kreed {

    static Conc2D(c00, c01, c10, c11) {

        let result = 0;

        let acAreAlike = Common.IsLike(c00, c10);

        let x = acAreAlike ? 1 : 0;
        let y = (Common.IsLike(c01, c10) && !(acAreAlike)) ? 1 : 0;

        let adAreAlike = Common.IsLike(c00, c11);

        x += adAreAlike ? 1 : 0;
        y += (Common.IsLike(c01, c11) && !(adAreAlike)) ? 1 : 0;

        if (x <= 1)
            result++;

        if (y <= 1)
            result--;

        return (result);
    }
}

class ReverseAA {

    static Clamp(v, min, max) {

        return parseInt(Math.min(max, Math.max(v, min)));
    }

    static FullClamp(value) {

        return Common._Clip8(value);
    }

    static _ReverseAntiAlias(b1, b, d, e, f, h, h5, d0, f4) {

        let n1 = b1;
        let n2 = b;
        let s = e;
        let n3 = h;
        let n4 = h5;
        let aa = n2 - n1;
        let bb = s - n2;
        let cc = n3 - s;
        let dd = n4 - n3;

        let tilt = (7 * (bb + cc) - 3 * (aa + dd)) / 16;

        let m = (s < 128) ? 2 * s : 2 * (255 - s);

        m = Math.min(m, 2 * Math.abs(bb));
        m = Math.min(m, 2 * Math.abs(cc));

        tilt = this.Clamp(tilt, -m, m);

        let s1 = s + tilt / 2;
        let s0 = s1 - tilt;

        n1 = d0;
        n2 = d;
        s = s0;
        n3 = f;
        n4 = f4;
        aa = n2 - n1;
        bb = s - n2;
        cc = n3 - s;
        dd = n4 - n3;

        tilt = (7 * (bb + cc) - 3 * (aa + dd)) / 16;

        m = (s < 128) ? 2 * s : 2 * (255 - s);

        m = Math.min(m, 2 * Math.abs(bb));
        m = Math.min(m, 2 * Math.abs(cc));

        tilt = this.Clamp(tilt, -m, m);

        let e1 = s + tilt / 2;
        let e0 = e1 - tilt;

        s = s1;
        bb = s - n2;
        cc = n3 - s;

        tilt = (7 * (bb + cc) - 3 * (aa + dd)) / 16;

        m = (s < 128) ? 2 * s : 2 * (255 - s);

        m = Math.min(m, 2 * Math.abs(bb));
        m = Math.min(m, 2 * Math.abs(cc));

        tilt = this.Clamp(tilt, -m, m);

        let e3 = s + tilt / 2;
        let e2 = e3 - tilt;

        return { rd: this.FullClamp(e0), gn: this.FullClamp(e1), bl: this.FullClamp(e2), alpha: this.FullClamp(e3) };
    }
}

// image initialization
class Init {

    static Buffer(Length, c) {

        const Channels = 4;

        let buffer = new Uint8ClampedArray(Length * Channels);

        for (let i = 0; i < Length; i++) {

            let index = i * Channels;

            buffer[index] = parseInt(c);
            buffer[index + 1] = parseInt(c);
            buffer[index + 2] = parseInt(c);
            buffer[index + 3] = 255;
        }

        return buffer;
    }

    static New(x, y) {

        return this.Buffer(x * y, 0);
    }

    static Init(srcx, srcy, FilterScaleX, FilterScaleY, ComparisonThreshold) {

        Common.ScaleX = FilterScaleX;
        Common.ScaleY = FilterScaleY;
        Common.SizeX = srcx * FilterScaleX;
        Common.SizeY = srcy * FilterScaleY;
        Common.Threshold = ComparisonThreshold;

        Common.ScaledImage = this.New(Common.SizeX, Common.SizeY);
    }
}

module.exports = {
	applyFilter,
}
