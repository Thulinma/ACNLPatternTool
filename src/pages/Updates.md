# Updates

## December 13, 2020

- Fixed problems on some mobile devices with buttons in bottom right of editor (the "drop up" menus)
- Some updates to the underlying workings of the web-app (see git for details)

## November 29, 2020

* Changing pattern type from 32x32 to 64x64 will now duplicate the pattern to all four quadrants, to make it easier to make shirts from converted images. This is a "quick and dirty" method to handle this until we add proper handling of pattern types when converting.

## November 8 2020

* Fixed bug in showing previews for ACNH-style patterns (including the Paint-By-Letter generator not working for these)

* Preview rendering now uses a global context, which should speed up the browse page quite a bit as well as improve performance on slower devices.

## October 25, 2020

* Improved app styling to look better on non-standard screen sizes
* Fix for the popup menus not showing when tapped on some devices
* Added warning screen when switching between ACNL and ACNH modes, detailing the differences of the two formats

## October 18, 2020

Sorry for the long wait! We totally overdid the amount of content
for a single update, and we still don't feel it's "perfect", but
it's close enough that we're comfortable releasing this. Hopefully
we'll be doing short and sweet updates from here on forward. 🤞

* Complete redesign of the website/tool
* Pagination capabilities for the browse function
* Browsing patterns caches results and history, which should speed things up significantly
* Improved mobile-readiness
* Added modified version of xbrz library, which the pattern algorithm the game uses for upscaling. That means the pattern previews will look as they do in-game. Yay!
* Support for ACNH format patterns (both reading and writing) as well as loading decrypted ACNH savegames directly into the tool.
* For coders: the ACNLFormat class documentation was updated with information extracted from the official NSO application.
* Added accurate 3D previews for both ACNL and ACNH patterns in ACNH-style.
* Added fancy 3D easel preview for non-pro patterns.
* Added capability to convert patterns from between ACNL and ACNH formats with one click (may lose some detail in the process, so please do keep backups of your originals!)
* Added support for an ACNH-style color picker. This will also show you the nearest color in the in-game GUI. Sliders are accurate to within less than 0.1% error.
* Suppport for exporting ACNH-format paint-by-numbers images. These show how to re-create a pattern in game in a straightforward and easy to read way. Simply put the editor into ACNH mode and click the QR-code button: it will export a paint-by-numbers graphic instead of a QR code.
* Added a few more advanced drawing tools, like brush sizes.
* Added saturation slider during image conversion, for last-minute saturation tweaks.
* Tons of other little "under the hood" improvements/fixes/etc! Check our [GitHub](https://github.com/Thulinma/ACNLPatternTool/commits/master) for full history.


## March 24, 2020

* Corrected creator/town name to be max 9 chars instead of 8.
* Added helpful guidelines in the pattern grid.
* Fixed bug with creator gender being forced to female, causing male players to not be able to edit their own patterns in ACNL anymore.

## March 22, 2020

* Made it easier/more obvious to change pattern title and creator info
* Fixed all known causes of 3999 error. There were SO MANY. 😭
* Also fixed all old patterns retroactively. Just generate a new QR code for them and it should work now!
* Added moderation tools so a mod team can approve/reject patterns and keep the database clean-ish.
* Fixed bug that allowed overwriting the transparent color.
* Added NSFW search toggle.
* The image cropper now defaults to using the whole image (if possible)
* Browse page should now work on iOS/Safari again... and allow opening pattern in new tabs! Yay!
* Added support for importing ACNL savegames with the Welcome Amiibo DLC installed.
* Improved ACNL savegame loading to also read the patterns from Able Sisters, not just players 1 and 2.
* Updated Discord link to point directly to information channel as opposed to main chat channel.

## March 20, 2020

* Added ACNH-style transparency support! Works both for image conversions and regular drawing.
* Fixed "Error 3999" happening when uploading patterns created from scratch.

## March 19, 2020

Massive update in collaboration with two new main developers (DamSenViet and Myumi)

* Support for multiple drawing tools (flood fill, color picker)
* Support for storing patterns in your browser for easy access.
* Support for reading directly from garden.dat files (dumped ACNL savegame files)
* Significantly improved QR code reading accuracy (not quite perfect yet, but lots better than before!)
* Support for reading multiple QR codes from a single image (very basic, for now)
* QR code images can now be loaded in any order (ordering is auto-detected)
* Support for opening multiple files at once; will pop up a pattern picker and offer the ability to import all patterns at once.
* Support for opening .zip files, containing any supported filetype (images of QR codes, ACNL files, DAT files) in any combination.
* Theoretical support for transparency (pending ACNH release providing more information...)
* Support for cropping images before conversion in-browser, added a conversion preview before confirming crop area.
* Added a public searchable pattern database where anyone can publish patterns.
* Generated QR images now include a preview of the pattern (2D/3D depending on type), and look much more appealing
* Fixed color accuracy to match in-game colors.
* 3D models can now be rotated and zoomed using the mouse/mousewheel.
* Undo/redo support
* Added quantize through median cut conversion mode.
* Added support for downloading .zips of collections, containing QR images, ACNL files, or both.


## March 1, 2020

* Fixed 3D Preview not updating on draw, added masks for undrawable areas.

## February 27, 2020

* Fixed copy/paste of author data, re-added slow color optimize method for image conversion.

## February 24, 2020

* Fixed 3D Display

## February 23, 2020

Modernized ACNL format into class, modernized drawing tool into a class. This can only mean one thing: more modernization cmoming soon...? Also, fixes a ton of long-standing bugs and added/improved the image conversion for patterns. Whoop!

## December 14, 2018

A special update in honor of an important day exactly three years ago.
Spit-shine and polish, CSS improvements and some minor typos corrected
by "Myumi Kalinowski". Added 3D render for shirt and dress modes. Added
ability to change pattern type as well as create other types than the
standard type from scratch. More updates coming soon. Maybe. We'll see!

## May 24, 2014

Still alive! Fixed a bug causing drawing to get stuck in several browsers. Fixed bug of having 16 shades of grey instead of the 15 from in-game. Updated jsqrcode for better QR code recognition. Added support for automatically attempting to recover form some corrupt QR codes. Special thanks to Kiddiecat for pointing out the drawing bug. Special thanks to "Michael New" for pointing out the 16 shades of grey bug. Special thanks to "Edel Fernández" for supplying a corrupt QR code.

## June 30, 2013

Support for pro patterns (both import and export), added pixel grid,
added zoom buttons, added offline version download link in FAQ, added a
selection box with 4 different image conversion optimizers.

## June 29, 2013

Loading QR code images now works, added an empty default pattern,
removed old preset patterns (they were used without permission), added
preliminary support for converting images to patterns (pretty low
quality, but it works), improved the colors (now actual colors as they
are in-game)

## June 28, 2013

* Firefox support, creator copy/paste buttons, loading ACNL files.

## June 25, 2013

Pattern editing (drawing), palette editing, title/creator/town and all
related ID editing.


## June 24, 2013

First working version, QR code generation.
