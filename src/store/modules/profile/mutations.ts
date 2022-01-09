import { MutationTree } from "vuex";
import { UploadEntry } from "@/libs/origin";
import { State, createDefaultState } from "./state";

export default {
  reset(state): void {
    Object.assign(state, createDefaultState());
  },
  setLogin(state, {
    username,
    password,
    token,
  }: {
    username: string,
    password: string,
    token: string,
  }): void {
    Object.assign(state, {
      username,
      password,
      token,
    });
  },
  setPending: (state, { pending }: {
    pending: Array<UploadEntry>,
  }): void  => {
    Object.assign(state, { pending } );
  }
} as MutationTree<State>;
