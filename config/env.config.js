// list of required env variables strings
const clientEnvConfig = [
  // e.g.
  // "SOME_API_KEY"
];

// multiple layers of correction exist
const defaultEnv = {
  NODE_ENV: "development", // technically not needed, just in case
  HOST: "localhost",
  PORT: "3000",
};

module.exports = {
  clientEnvConfig,
  defaultEnv
}