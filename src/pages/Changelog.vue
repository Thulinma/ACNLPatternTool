<template>
  <div>
  <h1>Changelog</h1>
  <dl>
    <dt>March 20, 2020</dt>
    <dd>
      <ul>
        <li>Added ACNH-style transparency support! Works both for image conversions and regular drawing.</li>
        <li>Fixed "Error 3999" happening when uploading patterns created from scratch.</li>
      </ul>
    </dd>
    <dt>March 19, 2020</dt>
    <dd>
      Massive update in a collaboration with two new main developers (DamSenViet and Myumi):
      <ul>
        <li>Support for multiple drawing tools (flood fill, color picker)</li>
        <li>Support for storing patterns in your browser for easy access</li>
        <li>Support for reading directly from garden.dat files (dumped ACNL savegame files)</li>
        <li>Significantly improved QR code reading accuracy (not quite perfect yet, but lots better than before!)</li>
        <li>Support for reading multiple QR codes from a single image (very basic, for now)</li>
        <li>QR code images can now be loaded in any order (ordering is auto-detected)</li>
        <li>Support for opening multiple files at once; will pop up a pattern picker and offer the ability to import all patterns at once</li>
        <li>Support for opening .zip files, containing any supported filetype (images of QR codes, ACNL files, DAT files) in any combination</li>
        <li>Theoretical support for transparency (pending ACNH release providing more information...)</li>
        <li>Support for cropping images before conversion in-browser, added a conversion preview before confirming crop area</li>
        <li>Added a public searchable pattern database where anyone can publish patterns</li>
        <li>Generated QR images now include a preview of the pattern (2D/3D depending on type), and look much more appealing</li>
        <li>Fixed color accuracy to match in-game colors</li>
        <li>3D models can now be rotated and zoomed using the mouse/mousewheel</li>
        <li>Undo/redo support</li>
        <li>Added quantize through median cut conversion mode</li>
        <li>Added support for downloading .zips of collections, containing QR images, ACNL files, or both</li>
      </ul>
    </dd>
    <dt>March 1, 2020</dt>
    <dd>Fixed 3D preview not updating on draw, added masks for undrawable areas</dd>
    <dt>February 27, 2020</dt>
    <dd>Fixed copy/paste of author data, re-added slow color optimize method for image conversion</dd>
    <dt>February 24, 2020</dt>
    <dd>Fixed 3D display</dd>
    <dt>February 23, 2020</dt>
    <dd>Modernized ACNL format into a class, modernized drawing tool into a class. This can only mean one thing: more modernization coming soon...? Also, fixes a ton of long-standing bugs and added/improved the image conversion for patterns. Whoop!</dd>
    <dt>December 14, 2018</dt>
    <dd>A special update in honor of an important day exactly three years ago. Spit-shine and polish, CSS improvements and some minor typos corrected by "Myumi Kalinowski". Added 3D render for shirt and dress modes. Added ability to change pattern type as well as create other types than the standard type from scratch. More updates coming soon. Maybe. We'll see!</dd>
    <dt>May 24, 2014</dt>
    <dd>Still alive! Fixed a bug causing drawing to get stuck in several browsers. Fixed bug of having 16 shades of grey instead of the 15 from in-game. Updated jsqrcode for better QR code recognition. Added support for automatically attempting to recover from some corrupt QR codes. Special thanks to "Kiddiecat" for pointing out the drawing bug. Special thanks to "Michael New" for pointing out the 16 shades of grey bug. Special thanks to "Edel Fern&aacute;ndez" for supplying a corrupt QR code.</dd>
    <dt>June 30, 2013</dt>
    <dd>Support for pro patterns (both import and export), added pixel grid, added zoom buttons, added offline version download link in FAQ, added a selection box with 4 different image conversion optimizers</dd>
    <dt>June 29, 2013</dt>
    <dd>Loading QR code images now works, added an empty default pattern, removed old preset patterns (they were used without permission), added preliminary support for converting images to patterns (pretty low quality, but it works), improved the colors (now actual colors as they are in-game)</dd>
    <dt>June 28, 2013</dt>
    <dd>Firefox support, creator copy/paste buttons, loading ACNL files.</dd>
    <dt>June 25, 2013</dt>
    <dd>Pattern editing (drawing), palette editing, title/creator/town and all related ID editing.</dd>
    <dt>June 24, 2013</dt>
    <dd>First working version, QR code generation.</dd>
  </dl>
  </div>
</template>


<script>
export default {
  name: "Changelog"
}
</script>


<style lang="scss" scoped>
h1{
  font-size:300%;
}
dt{
  font-size:150%;
  margin-top:20px;
}
li{
  margin-left:15px;
}
li::before{
  content: '- '
}
</style>
