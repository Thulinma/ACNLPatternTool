// require("jsdom-global")();
import { mount, shallowMount, createLocalVue } from "@vue/test-utils";
import Search from "./Search.vue";

describe("Search", () => {
  let opts = {};
  beforeEach(function() {
    opts = {
      propsData: {},
      data() {
        return {
          imageData:
            "test image|1234|aaa-bbb-123\nMona Lisa|222|bb-dd-gff\nIrises|1|aaaa-aaa-aaaa"
        };
      }
    };
  });

  it("Is a vue component", () => {
    const wrapper = shallowMount(Search, {
      propsData: {}
    });
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it("does basic search", () => {
    const wrapper = shallowMount(Search, opts);
    wrapper.find({ ref: "input" }).setValue("Mona");
    wrapper.find({ ref: "search" }).trigger("click");
    expect(wrapper.vm.matches).toEqual([
      {
        full_name: "Mona Lisa",
        iiif_url:
          "https://media.getty.edu/iiif/image/bb-dd-gff/full/!300,300/0/default.jpg",
        short_name: "Mona Lisa",
        webpage: "https://www.getty.edu/art/collection/objects/tms:222"
      }
    ]);
  });

  it("does a search with a carriage return", async () => {
    const wrapper = shallowMount(Search, opts);
    wrapper.find({ ref: "input" }).setValue("lisa");
    wrapper.find({ ref: "input" }).trigger("keyup.enter");
    expect(JSON.stringify(wrapper.vm.matches)).toContain("Mona Lisa");
    await wrapper.vm.$nextTick();
    expect(wrapper.find({ ref: "summary" }).text()).toEqual(
      "Showing 1 results for lisa"
    );
  });

  it("does a search with a carriage return", () => {
    const wrapper = shallowMount(Search, opts);
    wrapper.find({ ref: "input" }).setValue("lisa");
    wrapper.find({ ref: "input" }).trigger("keyup.enter");
    expect(JSON.stringify(wrapper.vm.matches)).toContain("Mona Lisa");
  });

  it("does case-insensitive search", () => {
    const wrapper = shallowMount(Search, opts);
    wrapper.find({ ref: "input" }).setValue("lisa");
    wrapper.find({ ref: "search" }).trigger("click");
    expect(JSON.stringify(wrapper.vm.matches)).toContain("Mona Lisa");
  });

  it("finds multiple values", () => {
    const wrapper = shallowMount(Search, opts);
    wrapper.find({ ref: "input" }).setValue("i");
    wrapper.find({ ref: "search" }).trigger("click");
    let matches = JSON.stringify(wrapper.vm.matches);
    expect(matches).toContain("Mona Lisa");
    expect(matches).toContain("Irises");
    expect(matches).toContain("test");
  });
});
