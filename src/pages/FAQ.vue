<template>
  <div>
    <h1>Frequently Asked Questions</h1>
    <div class="question">
      <p class="que">ZOMG this thing doesn't work!?</p>
      <p class="ans">The ACNL pattern tool is completely written in HTML5 and JavaScript. As such, it requires a decently standards-compliant browser. The latest versions of Chrome / Chromium / Firefox / Android / iOS are tested and should work. No promises on anything else. Internet Explorer will probably choke on this entire page.</p>
    </div>
    <div class="question">
      <p class="que">How do I use this thing?</p>
      <p class="ans">Click a color on the 3x5 palette and then just "draw" on one of the pattern representations. All of the zoom levels are drawable and they will all update at the same time. When you want to import to ACNL, simply scan the QR code at the bottom using the QR machine at the Able Sisters in-game. Don't have the QR machine yet? Talk to the quiet sister in the back for 10 days in a row to unlock it. The download ACNL file button lets you save the pattern to your computer for later use. You can also upload ACNL files or images containing QR codes. Not all images will always scan correctly since QR code reading is somewhat of an iffy thing, but we're always working on improving accuracy.</p>
    </div>
    <div class="question">
      <p class="que">Who made this? / Who made what?</p>
      <p class="ans">
        The "new" version of the pattern tool was made by 3 main developers:
        <ul>
          <li><b>Thulinma:</b> Reverse-engineering of pattern format, core drawing system, image conversion, 3D renders, QR image generation, pattern database backend</li>
          <li><b>DamSenViet:</b> Graphic design (most), JavaScript toolchain setup/configuration, optimization</li>
          <li><b>Myumi:</b> QR code reading improvements, graphic design (the rest), practical implementation of design</li>
        </ul>
      </p>
    </div>
    <div class="question">
      <p class="que">What are the planned future updates?</p>
      <p class="ans">It's hard to keep track of this on this page. For the latest information and discussion, please join our <a href="https://discord.gg/9rGkZNk">Discord server</a>.</p>
    </div>
    <!-- <div class="question">
      <p class="que">This is open source? So I can re-use this code for my own projects?</p>
      <p class="ans">Yes. It's licensed under the WTFPL, which basically makes it public domain code. You can find the full source on <a href="https://github.com/Thulinma/ACNLPatternTool">GitHub</a>. Please don't claim you wrote it all yourself, and try to include a notice "Based on the Animal Crossing Pattern tool by Thulinma/DamSemViet/Myumi" somewhere. You don't <i>have</i> to include a notice like that, but we will be very very disappointed in you if you don't.</p>
    </div> -->
    <div class="question">
      <p class="que">Is there an offline version I can use without an internet connection?</p>
      <p class="ans">Soon.</p>
    </div>
    <div class="question">
      <p class="que">I made something better / fixed something / added more browser support!</p>
      <p class="ans">That's not a question! But - yay! Go ahead and send us a pull request on <a href="https://github.com/Thulinma/ACNLPatternTool">GitHub</a>.</p>
    </div>
    <div class="question">
      <p class="que">How do I reach you guys? / Can I make a suggestion? / How can I get help?</p>
      <p class="ans">Please join our <a href="https://discord.gg/9rGkZNk">Discord server</a>.</p>
    </div>
    <div class="question">
      <p class="que">Why isn't my QR code being read? It works in the game!</p>
      <p class="ans">This version of the tool uses the TypeScript port of the ZXing QR library. While this library is quite decent, it has issues with multiple QR codes in a single image (support for which Myumi patched in for us) and has issues with blurry/zoomed QR codes. We're working on improving the reading accuracy, but QR code reading is a pretty complicated thing and it will never be "perfect".</p>
    </div>
    <div class="question">
      <p class="que">What are ".ACNL" files?</p>
      <p class="ans">A small binary format storage for ACNL-compatible patterns. They contain the pattern and nothing more, which makes them very small! It uses the exact binary format also used inside the QR codes and inside the game's savedata, so this is a highly accurate storage format that will never lose any details (unlike QR codes, which may become unreadible when the image is resized or reduced in quality!).</p>
    </div>
    <div class="question">
      <p class="que">What are ".DAT" files?</p>
      <p class="ans">People with a hacked 3DS can export their ACNL savegame as a "garden.dat" file. The tool can read patterns from these files and import/export them, even if the patterns can normally not be exported to QR codes.</p>
    </div>
  </div>
</template>


<script>
export default {
  name: "FAQ"
}
</script>


<style lang="scss" scoped>
h1{
  font-size:300%;
}

.que{
  font-weight:bold;
  margin-top:20px;
}
</style>
