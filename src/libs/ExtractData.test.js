import extractData from "./ExtractData.js";

beforeEach(() => {
  // initializeCityDatabase();
});
let sampleData =
  "Apulian Red-Figure Loutrophoros|12038|ed5f9f87-a007-42a5-b4c8-dd6b588be10a";

it("extracts a url from data", () => {
  let url =
    "https://media.getty.edu/iiif/image/ed5f9f87-a007-42a5-b4c8-dd6b588be10a/full/!300,300/0/default.jpg";
  expect(extractData(sampleData).url).toBe(url);
});

it("exports the full name", () => {
  expect(extractData(sampleData).full_name).toBe(
    "Apulian Red-Figure Loutrophoros"
  );
});

it("generates a short name", () => {
  expect(extractData(sampleData).name).toBe("Apulian Red-Figur...");
});

it("does not truncate short names", () => {
  const data = "short name|1|123";
  expect(extractData(data).name).toEqual("short name");
});

it("does not truncate 20 char names", () => {
  const data = "Im twenty characters|1|123";
  expect(extractData(data).name).toEqual("Im twenty characters");
});

it("does truncate 21 char names", () => {
  const data = "I'm twenty characters|1|123";
  expect(extractData(data).name).toEqual("I'm twenty charac...");
});

it("generates a link to the collection object", () => {
  expect(extractData(sampleData).link).toEqual(
    "https://www.getty.edu/art/collection/objects/tms:12038"
  );
});

it("allows you to specify a max size", () => {
  expect(extractData(sampleData, 600).url).toMatch("!600,600");
});
