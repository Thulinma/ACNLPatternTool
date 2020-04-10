// require("jsdom-global")();
import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import Search from "./Search.vue";

describe("Search", () => {
  it("Is a vue component", () => {
    const wrapper = shallowMount(Search, {
      propsData: {}
    });
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});
