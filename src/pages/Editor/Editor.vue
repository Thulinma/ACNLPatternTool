<template>
  <div class="editor">
    <main>
      <div id="left">
        <div class="previews">
          <div class="2D">
            <canvas class="fordrawing" ref="canvas2" width="128" height="128"/>
            <canvas class="fordrawing" ref="canvas3" width="64" height="64"/>
            <div class="pattern-info">
              <div class="pattern_title">{{patTitle}}</div>
              <div class="pattern_author">by {{patAuthor}}</div>
              <div class="pattern_town">from {{patTown}}</div>
              <div class="pattern_typename">{{patTypeName}}</div>
            </div><!-- pattern info -->
            <button id="edit-info-button" @click="patInfoModal=true">Change</button><!-- edit pattern info button -->
          </div><!-- flat canvases -->
          <div class="render-preview">
            <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
          </div><!-- 3D preview -->
        </div>
      </div><!-- previews and pattern info -->

      <div id="center">
        <Palette
          ref="palette"
          :drawing-tool="drawingTool"
          @changed-current-color="onChangedCurrentColor"/>
        <canvas class="fordrawing" ref="canvas1" width="512" height="512"/>
        <div class="colorPicker-menu" ref="colorPickerMenu">
          <ACNLColorPicker
            ref="colorPicker"
            :drawing-tool="drawingTool"
            @color-picked="onColorPicked"/>
            <button @click="closeColorPicker">Close Menu</button>
        </div>
      </div><!-- canvas and color palette -->

      <div id="right">
        <div class="topbar-buttons">
          <button class="menu-button" @click="onMainMenu">
            <IconBase icon-name="phone" :icon-color="orange" class="svg nav white-circle">
              <IconPhone />
            </IconBase><!-- phone svg -->
            Menu
            <IconBase icon-name="down arrow" :icon-color="white" class="svg arrow" height="15" width="15">
              <IconDownArrow />
            </IconBase><!-- down arrow svg -->
          </button>
        </div><!-- nav button -->
        <div class="tools-and-colors">
          <ToolSelector @newtool="toolChange" @newtoolalt="toolChangeAlt" /><!-- tool selection sidebar -->

          <div class="tool-buttons">
            <button id="scan-button" @click="$refs.fileloader.open()">
              <IconBase icon-name="scan" :icon-color="white" class="svg nav brown-circle">
                <IconScan />
              </IconBase><!-- scan svg -->
              Open ACNL File / Scan QR
            </button><!-- load file or scan qr button -->

            <button @click="openColorPicker">
              <IconBase icon-name="palette" :icon-color="brown" class="svg nav white-circle">
                <IconPalette />
              </IconBase><!-- palette svg full button -->
              Open Color Editor
            </button><!-- open palette button -->

            <button @click="convertImage=true;closeColorPicker();">
              <IconBase icon-name="convert" :icon-color="brown" class="svg nav white-circle">
                <IconImageAdd />
              </IconBase><!-- phone svg -->
              Convert from Image
            </button><!-- convert from image button -->

            <FileLoader v-show="false" ref="fileloader" @qr-load="extLoad" @qr-multiload="extMultiLoad" />
            <button id="download-acnl" :value="$tc('editor.download')" @click="downACNL">
              <IconBase icon-name="save" :icon-color="teal" class="svg nav white-circle">
                <IconSave />
              </IconBase><!-- save svg -->
              Save
            </button><!-- save acnl file button -->

            <button @click="onQROpen">
              <IconBase icon-name="qr" :icon-color="brown" class="svg nav white-circle">
                <IconQRCode />
              </IconBase><!-- qr code svg -->
              Generate QR Code
            </button><!-- generate QR code button -->
            <button @click="onLocalSave();closeColorPicker();">Store Locally</button><!-- store in local storage button -->
            <button @click="onOpenLocal();closeColorPicker()">Open Storage</button><!-- open local storage button -->
            <button @click="publishModal=true;closeColorPicker();">Publish</button><!-- publish pattern to database button -->
            <button @click="downTex">Save texture</button>
          </div><!-- side bar button -->
        </div><!-- tools and buttons container -->
      </div><!-- tools and buttons -->
    </main><!-- main editor parts -->
  <div>
    <ModalContainer v-if="qrCode" @modal-close="qrCode=false">
      <template #window><div class="modal">
        <div class="modal-header">
          <IconBase icon-name="qr" :icon-color="white" height=20 width=20>
            <IconQRCode />
          </IconBase><!-- qr code svg -->
          Generate QR Code(s)
        </div>
        <div class="modal-window modal-centered">
          <ACNLQRGenerator :pattern="qrCode" />
          <button @click="downPNG">Save Image</button>
        </div>
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="pickPatterns" @modal-close="closePicks">
      <template #window><div class="modal">
        <div class="modal-header">{{multiName}}</div>
        <div class="modal-window pattern-list">
          <button v-if="allowMoveToLocal" @click="picksToLocal">Store all in local storage</button>
          <button @click="zipPicksAsACNL">Download ACNL files as .zip file</button>
          <button @click="zipPicksAsPNG">Download QR codes as .zip file</button>
          <button @click="zipPicksAsBoth">Download ACNL+QR as .zip file</button>
          <br/>
          <IconGenerator
            v-for="(opt, idx) in pickPatterns"
            :key="idx"
            width=150 height=150 text="true" decoration="true"
            @pattclick="pickPattern"
            :pattern="opt" />
        </div>
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="convertImage" @modal-close="convertImage=false">
      <template #window><div class="modal">
        <div class="modal-header">
          <IconBase icon-name="convert image" :icon-color="white" height=20 width=20>
            <IconImageAdd />
          </IconBase><!-- qr code svg -->
          Convert Image
        </div>
        <ImageLoader class="modal-window" :pattern-type="patType" @converted="onConvert" />
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="patInfoModal" @modal-close="patInfoSave">
      <template v-slot:window><div class="modal">
        <div class="modal-header">
          Edit Pattern Details
        </div>
        <div class="modal-window" id="change-info-modal">
          <div class="edit-info">
              <span>Title: <input type="text" maxlength="20" v-model="patTitle"></span>
              <span>Author: <input type="text" maxlength="9" v-model="patAuthor"></span>
              <span>Town: <input type="text" maxlength="9" v-model="patTown"></span>
              <span>Type:
                <select v-model="patType">
                  <option
                    v-for="(ti, no) in allTypes"
                    :key="no"
                    :value="no">{{ti.name}}
                  </option>
                </select>
              </span>
          </div>
          <div v-if="storedAuthorHuman">Stored: {{storedAuthorHuman}}</div>
          <div class="edit-notice">
            <p>
              IMPORTANT: AC:NH reads these patterns as AC:NL patterns; therefore,
              they will not be editable in-game since the game can't
              determine that they were originally made by you.
            </p>
            <p>
              <br>
              Similarly, patterns with transparency will look corrupted
              when scanned in the NSO application but will look fine in game.
            </p>
          </div>
          <div class="edit-buttons">
            <button @click="saveAuthor">Copy author information</button>
            <button @click="loadAuthor">Load copied author information</button>
            <button @click="patInfoSave(false)">Save</button>
            <button @click="patInfoModal=false; onLoad()">Cancel</button>
          </div>
        </div>
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="publishModal" @modal-close="publishModal=false">
      <template #window><div class="modal">
        <div class="modal-header">
          Publish to Public Database
        </div>
        <div class="modal-window" id="publish-modal">
            <div class="left">
              <p>
              Really cool that you want to publish your pattern!<br />
              Publishing means everyone will be able to search for and link to your pattern easily, hopefully allowing many others to enjoy your work.<br />
              Please do keep the following in mind:
              </p>
              <ol>
                <li>Published patterns cannot be deleted or edited. So, please don't publish unfinished works.</li>
                <li>Please try to title and tag your pattern appropriately, so that it can be found easily.</li>
                <li>If any pattern might be inappropriate for children, please flag it accordingly to protect the innocent.</li>
                <li>Be nice to authors! It's okay to publish the work of others, but please don't change an existing work's author name/town to your own. Respect their skills!</li>
              </ol>
              <p>
                Not following the above rules may lead to your published pattern being deleted from the database.
              </p>
            </div>
            <div class="right">
              <IconGenerator :pattern="drawingTool" width=150 height=150 />
              <div class="dropdowns">
                <span>Title: <input type="text" maxlength="20" v-model="patTitle"></span>
                <span>Author: <input type="text" maxlength="9" v-model="patAuthor"></span>
                <span>Town: <input type="text" maxlength="9" v-model="patTown"></span>
                <span>Type:
                  <select v-model="patType">
                    <option
                      v-for="(ti, no) in allTypes"
                      :key="no"
                      :value="no">{{ti.name}}
                    </option>
                  </select>
                </span>
                <div class="dropdown">
                <span>Main Style:</span>
                <select v-model="pubStyleA">
                  <option value="">-</option>
                  <option
                    v-for="(s, no) in origin.tags_style"
                    :key="no"
                    :value="s">
                    {{s}}
                  </option>
                </select>
                </div>
                <div class="dropdown">
                  <span>Additional Style:</span>
                  <select v-model="pubStyleB">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_style"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Style:</span>
                  <select v-model="pubStyleC">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_style"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Main Type:</span>
                  <select v-model="pubTypeA">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Type:</span>
                  <select v-model="pubTypeB">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
                <div class="dropdown">
                  <span>Additional Type:</span>
                  <select v-model="pubTypeC">
                    <option value="">-</option>
                    <option
                      v-for="(s, no) in origin.tags_type"
                      :key="no"
                      :value="s">
                      {{s}}
                    </option>
                  </select>
                </div>
              </div>
              <div>
                <label>
                  <input type="checkbox" value="Y" v-model="pubNSFW"/>This pattern is not appropriate for children
                </label>
              </div>
              <div class="publish-buttons">
                <button @click="patInfoSave(true)">Save</button>
                <button @click="publishModal=false; onLoad()">Cancel</button>
              </div>
            </div>
        </div>
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="false">
      <template #window><div class="modal-info">
        <div class="info-text">
          <p>Please select files with the <span>.acnl</span> extension.</p>
        </div>
      </div></template>
    </ModalContainer>

    <ModalContainer v-if="mainMenu" @modal-close="mainMenu=false">
      <template #window><div class="modal">
        <NookPhoneMenu v-model="mainMenu"/>
      </div></template>
    </ModalContainer>
    </div>
  </div>
</template>

<script src="./script.js"></script>
<style src="./styles.scss" lang="scss" scoped></style>
