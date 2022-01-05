import ACNLFormat from "@/libs/ACNLFormat";
import ACNHFormat from "@/libs/ACNHFormat";
import ModelUrlData, {
  easel,
  tankSimp,
  dressShirtLong,
  teeShort,
  tankPro,
  sweater,
  hoodie,
  coat,
  dressAcnhShort,
  dressAcnhNone,
  dressAcnhLong,
  dressBalloon,
  dressRound,
  robe,
  brimmedCap,
  knitCap,
  brimmedHat,
  dressHalf,
  dressLong,
  dressNone,
  shirtHalf,
  shirtLong,
  shirtNone,
  hat,
  hornHat,
} from "@/models";


export enum ModelType {
  Cloth,
  Top,
  Hat,
  Standee,
};

export interface TypeInfo {
  name: string,
  size: number,
  texSize: number,
  sections: [number, number, number, number],
  mask?: number[],
  transform?: Function,
};

export enum AcnlTypes {
  LongSleevedDress,
  ShortSleevedDress,
  SleevelessDress,
  LongSleevedShirt,
  ShortSleevedShirt,
  SleevelessShirt,
  Hat,
  HornedHat,
  Standee,
  Plain,
};

export enum AcnhTypes {
  Plain,
  Pro,
  Tank,
  LongSleevedDressShirt,
  ShortSleevedTee,
  TankPro,
  Sweater,
  Hoodie,
  Coat,
  ShortSleevedDress,
  SleevelessDress,
  LongSleevedDress,
  BalloonHemDress,
  RoundDress,
  Robe,
  BrimmedCap,
  KnitCap,
  BrimmedHat,
  // acnl repeat types
  ShortSleevedDressAcnl,
  LongSleeveDressAcnl,
  SleevelessDressAcnl,
  ShortSleevedShirtAcnl,
  LongSleevedShirtAcnl,
  SleevelessShirtAcnl,
  HatAcnl,
  HornedHatAcnl,
};


export const acnlTypeInfoToModelType = new Map<TypeInfo, ModelType>([
  [ACNLFormat.typeInfo[AcnlTypes.LongSleevedDress], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.ShortSleevedDress], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.SleevelessDress], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.LongSleevedShirt], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.ShortSleevedShirt], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.SleevelessShirt], ModelType.Top],
  [ACNLFormat.typeInfo[AcnlTypes.Hat], ModelType.Hat],
  [ACNLFormat.typeInfo[AcnlTypes.HornedHat], ModelType.Hat],
  [ACNLFormat.typeInfo[AcnlTypes.Standee], ModelType.Standee],
  [ACNLFormat.typeInfo[AcnlTypes.Plain], ModelType.Cloth],
]);


export const acnhTypeInfoToModelType = new Map<TypeInfo, ModelType>([
  [ACNHFormat.typeInfo[AcnhTypes.Plain], ModelType.Cloth],
  [ACNHFormat.typeInfo[AcnhTypes.Pro], ModelType.Cloth],
  [ACNHFormat.typeInfo[AcnhTypes.Tank], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedDressShirt], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedTee], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.TankPro], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.Sweater], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.Hoodie], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.Coat], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedDress], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessDress], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedDress], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.BalloonHemDress], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.RoundDress], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.Robe], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.BrimmedCap], ModelType.Hat],
  [ACNHFormat.typeInfo[AcnhTypes.KnitCap], ModelType.Hat],
  [ACNHFormat.typeInfo[AcnhTypes.BrimmedHat], ModelType.Hat],
  // acnl repeat types
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedDressAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleeveDressAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessDressAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedShirtAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedShirtAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessShirtAcnl], ModelType.Top],
  [ACNHFormat.typeInfo[AcnhTypes.HatAcnl], ModelType.Hat],
  [ACNHFormat.typeInfo[AcnhTypes.HornedHatAcnl], ModelType.Hat],
]);


export const typeInfoToModelType = new Map<TypeInfo, ModelType>([
  ...acnlTypeInfoToModelType.entries(),
  ...acnhTypeInfoToModelType.entries(),
]);


export const acnlTypeInfoToModelUrlData = new Map<TypeInfo, ModelUrlData | null>([
  [ACNLFormat.typeInfo[AcnlTypes.LongSleevedDress], dressLong],
  [ACNLFormat.typeInfo[AcnlTypes.ShortSleevedDress], dressHalf],
  [ACNLFormat.typeInfo[AcnlTypes.SleevelessDress], dressNone],
  [ACNLFormat.typeInfo[AcnlTypes.LongSleevedShirt], shirtLong],
  [ACNLFormat.typeInfo[AcnlTypes.ShortSleevedShirt], shirtHalf],
  [ACNLFormat.typeInfo[AcnlTypes.SleevelessShirt], shirtNone],
  [ACNLFormat.typeInfo[AcnlTypes.Hat], hat],
  [ACNLFormat.typeInfo[AcnlTypes.HornedHat], hornHat],
  // [ACNLFormat.typeInfo[AcnlTypes.Standee], null],
  [ACNLFormat.typeInfo[AcnlTypes.Plain], easel],
]);


export const acnhTypeInfoToModelUrlData = new Map<TypeInfo, ModelUrlData | null>([
  [ACNHFormat.typeInfo[AcnhTypes.Plain], easel],
  [ACNHFormat.typeInfo[AcnhTypes.Pro], easel],
  [ACNHFormat.typeInfo[AcnhTypes.Tank], tankSimp],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedDressShirt], dressShirtLong],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedTee], teeShort],
  [ACNHFormat.typeInfo[AcnhTypes.TankPro], tankPro],
  [ACNHFormat.typeInfo[AcnhTypes.Sweater], sweater],
  [ACNHFormat.typeInfo[AcnhTypes.Hoodie], hoodie],
  [ACNHFormat.typeInfo[AcnhTypes.Coat], coat],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedDress], dressAcnhShort],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessDress], dressAcnhNone],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedDress], dressAcnhLong],
  [ACNHFormat.typeInfo[AcnhTypes.BalloonHemDress], dressBalloon],
  [ACNHFormat.typeInfo[AcnhTypes.RoundDress], dressRound],
  [ACNHFormat.typeInfo[AcnhTypes.Robe], robe],
  [ACNHFormat.typeInfo[AcnhTypes.BrimmedCap], brimmedCap],
  [ACNHFormat.typeInfo[AcnhTypes.KnitCap], knitCap],
  [ACNHFormat.typeInfo[AcnhTypes.BrimmedHat], brimmedHat],
  // acnl repeat types
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedDressAcnl], dressHalf],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleeveDressAcnl], dressLong],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessDressAcnl], dressNone],
  [ACNHFormat.typeInfo[AcnhTypes.ShortSleevedShirtAcnl], shirtHalf],
  [ACNHFormat.typeInfo[AcnhTypes.LongSleevedShirtAcnl], shirtLong],
  [ACNHFormat.typeInfo[AcnhTypes.SleevelessShirtAcnl], shirtNone],
  [ACNHFormat.typeInfo[AcnhTypes.HatAcnl], hat],
  [ACNHFormat.typeInfo[AcnhTypes.HornedHatAcnl], hornHat],
]);


export const typeInfoToModelUrlData = new Map<TypeInfo, ModelUrlData | null>([
  ...acnlTypeInfoToModelUrlData.entries(),
  ...acnhTypeInfoToModelUrlData.entries(),
]);