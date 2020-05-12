<template>
  <button id="edit-info-button" @click="patInfoModal=true">Change</button><!-- edit pattern info button -->
  <!-- <ModalContainer v-if="patInfoModal" @modal-close="patInfoSave">
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
          <button @click="patInfoSave">Save</button>
          <button @click="patInfoModal=false; onLoad()">Cancel</button>
        </div>
      </div>
    </div></template>
  </ModalContainer> -->
</template>

<script>
    // patInfoSave(e, publish=false){
    //   const patTitle = this.patTitle.trim();
    //   const patTown = this.patTown.trim();
    //   const patAuthor = this.patAuthor.trim();
    //   this.drawingTool.title = this.patTitle;
    //   if (this.drawingTool.creator[0] !== this.patAuthor) this.drawingTool.creator = this.patAuthor;
    //   if (this.drawingTool.town[0] !== this.patTown) this.drawingTool.town = this.patTown;
    //   if (this.drawingTool.patternType !== this.patType){
    //     this.drawingTool.patternType = this.patType;
    //     this.patTypeName = this.drawingTool.typeInfo.name;
    //   }
    //   if (publish){
    //     const titleCheck = patTitle && patTitle !== 'Empty';
    //     const townCheck = patTown && patTown !== 'Unknown';
    //     const nameCheck = patAuthor && patAuthor !== 'Unknown';
    //     if (titleCheck && townCheck && nameCheck){
    //       this.onPublish();
    //     }else{
    //       alert('Please provide a valid pattern name, town name, and player name for this pattern.');
    //       return;
    //     }
    //   }
    //   this.patInfoModal = false;
    // },
export default {
  
}
</script>