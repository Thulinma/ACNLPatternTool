# ACNLPatternTool

An application to edit Animal Crossing pattern designs.

## Installation

At the root of the project directory:

```sh
# submodule setup
git submodule update --init --recursive
cd zxing-js-library
yarn # need this to bypass sharp missing binaries
cd ..

# main repo setup
npm install
npm run build:submodule # build the submodule
```

## Available Scripts

### `npm run dev`

Runs the application in development mode. Automatically reloads with changes.
Open [https://localhost:3000](https://localhost:3000) to view it in the
browser.

### `npm run build -- <options>`

Builds the submodules, app, and then outputs to a `build` directory at the
repository root. Can build the the project in development mode or production
mode. By default builds in the mode specified by the `.env`, but can otherwise
override with a command line option. Use `--help` option to view options.

### `npm run build:app -- <options>`

Builds the app and outputs to a `build` directory at the repository root. Can
build the the project in development mode or production mode. By default builds
in the mode specified by the `.env`, but can otherwise override with a command
line option. Use `--help` option to view options.

### `npm run build:submodule`

Builds the submodules and outputs to a `build` directory at the repository
root. Can build the the project in development mode or production mode. By
default builds in the mode specified by the `.env`, but can otherwise override
with a command line option.

### `npm run clean`

Cleans the submodule and app build directories. Recursively removes files
located in the build directories.

### `npm run clean:app`

Cleans the app build directory. Recursively removes files located in the build
directory.

### `npm run clean:submodule`

Cleans the submodule build directory. Recursively removes files located in the build
directory.

## Deploying the app to netlify:

### setup Netlify (first time only)

1. login to netlify from the commandline `npx netlify login`
2. link the folder to netlify `npx netlify link`

### build the app (every time)

1. `npm run build`

### deploy the built app to netlify

1. `npx netlify deploy --dir=build`
