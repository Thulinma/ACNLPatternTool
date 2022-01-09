import { UploadEntry } from "@/libs/origin";

export interface State {
  token: string,
  username: string,
  password: string,
  pending: Array<UploadEntry>,
}

export const createDefaultState = (): State => ({
  token: "",
  username: "",
  password: "",
  pending: [],
});

export default createDefaultState();