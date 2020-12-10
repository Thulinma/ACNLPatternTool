# Frequently Asked Questions

## ZOMG this thing doesn't work!?

The ACNL pattern tool is written in Vue, using modern CSS and JavaScript
features. As such, it requires a decently standards-compliant browser.
The latest version of Chrome / Chromium / Firefox / Android / iOS are tested
and should work. No promises on anything else. Internet Explorer will probably
choke on the entire page, while Edge and Safari will will run into issues
with certain features.

## How do I use this thing?

Click a color on the 3x5 palette and then just "draw" on the one of the pattern
representations. All of the zoom levels are drawable and they will update at
the same time. When you want to import to ACNL, scan the QR code by clicking the
preview button.


 ## Why isn't my QR code being read? It works in the game!

This version of the tool uses a TypeScript port of the ZXing QR library. While
this library is quite decent, it has issues with multiple QR codes in a single
image and has issues with blurry/zoomed QR codes. We're working on improving
reading accuracy, but QR code reading is a pretty complicated thing and it
will never be "perfect".

Please note that the QR must be of a sufficient size and quality in order to 
be properly read. If any produced QR code images are downscaled, there is a
high chance it will be able to be read.


## What are .ACNL and .ACNH files?

It's a small binary format storage for ACNL-compatible patterns. They contain
the pattern. It uses the exact binary format also used inside the QR codes and
inside the game's savedata, so this is a highly accurate storage format that
will never lose any details (unlike QR codes, which may become unreadable when)
the image is resized or reduced in quality.

## What are .DAT files?

People with a hacked 3DS can export their ACNL savegame as a "garden.dat" file.
The tool can read patterns from these files and import/export them, even if the
patterns normally cannot be exported to QR codes.


## Who made this? Who made what?

* Thulinma: reverse engineering format, drawing system, image conversion, 3d renders, pattern database backend
* DamSenViet: ui/ux design, stack selection, custom toolchain, leading component programming, animations, api integration
* Myumi: QR code reading improvements, component programming
* Tero: graphic design, icon design
* MelonSpeedruns: data mining

## What are the planned future updates?

It's hard to keep track of this on this page. For the latest information and
discussion, please join our [Discord server](https://discord.gg/9rGkZNk).

## Is there an offline version?

It's in the works. We've developed with this feature in mind in case we ever
decide to follow up on it.

## How do I reach you guys? Can I make a suggestion?

Please join our [Discord server](https://discord.gg/9rGkZNk).
