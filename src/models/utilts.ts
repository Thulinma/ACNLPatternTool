import { flow } from "lodash";

export const dataUriToByteString = (dataUri: string): string => {
  const BASE64_MARKER = ';base64,';
  const base64Index = dataUri.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = dataUri.substring(base64Index);
  const byteString = window.atob(base64);
  return byteString;
};

export const byteStringToBytes = (byteString: string): Uint8Array => {
  const byteStringLength = byteString.length;
  const array = new Uint8Array(new ArrayBuffer(byteStringLength));
  for(let i = 0; i < byteStringLength; i++)
    array[i] = byteString.charCodeAt(i);
  return array;
};

export const bytesToObjectUrl = (bytes: Uint8Array): string => {
  const blob = new Blob([bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  return url;
};

export const dataUriToUrl = flow(
  dataUriToByteString,
  byteStringToBytes,
  bytesToObjectUrl,
);
