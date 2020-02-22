# ACNLPatternTool

An application to edit Animal Crossing pattern designs.

 ## Animal Crossing: New Leaf Pattern Tool
This originally started as a short project made over the span of a few days.
After the main problems were solved, work on the project was mostly halted.
A year or so after the original development, several bug fixes powered by a
collection of user reports was pushed through.
Recent interest (mostly due to the upcoming new Animal Crossing game announced
for Nintendo Switch), caused me to open up this repository to public viewing,
and allow others to more directly contribute code.

## License Information
This code should be considered public domain (technically, it's licensed under
the [Do What The Fuck You Want To Public License](LICENSE)). In short: use it
however you like, for any purpose.

I do have a request: **I would appreciate it if you included a mention of the source somewhere in your project along the lines of "Based on the ACNL Pattern tool by Thulinma".**
This is not a requirement or condition, just a request. The only repercussion
you will face for not doing so is me being very disappointed with you.

I make no claims regarding the licenses of libraries used by this project.
Specifically, the following dependencies are used:

 - [FileSaver.js by eligrey](//github.com/eligrey/FileSaver.js/) is used for saving patterns as .acnl files (MIT license).
 - [jquery-qrcode by Lars Jung](//github.com/lrsjng/jquery-qrcode) is used for QR code generation (MIT license).
 - [QR Code Generator by Kazuhiko Arase](http://www.d-project.com/qrcode/index.html) is used for QR code generation (MIT license).
 - [JavaScript QR code reader by Lazar Laszlo](https://github.com/LazarSoft/jsqrcode) is used for QR code reading (Apache License 2.0), with a [minor contribution](https://github.com/LazarSoft/jsqrcode/pull/20) from me.
 - [jQuery by the jQuery Foundation](//jquery.com/) is used for easy accessing of HTML elements (MIT license).
 - [three.js and GLTFLoader by the three.js authors](//github.com/mrdoob/three.js/) is used for 3D rendering (MIT license).
 - 3D models were ripped from the game by [Centrixe (previously Tiramisu6) @ The Models Resource](//www.models-resource.com/submitter/Centrixe/).

 ## Available Scripts

 ### `npm run dev`
 Runs the application in development mode. Automatically reloads with changes.<br>
 Open [https://localhost:PORT](https://localhost:3000) to view it in the browser.

 ### `npm run clean`
 Cleans the build directory. Recursively removes files located in the build
 directory.

 ### `npm run build`
Builds the project and outputs to a build directory. Can build the the project
in development mode or production mode. By default builds in development mode.
