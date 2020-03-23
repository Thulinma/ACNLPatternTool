# ACNLPatternTool

An application to edit Animal Crossing pattern designs.

## Installation

### Submodules

At the root of the project directory:
```sh
git submodule update --init --recursive
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