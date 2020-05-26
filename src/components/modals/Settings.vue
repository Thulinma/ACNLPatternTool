<template>
  <ModalContainer @modal-close="close">
    <template #window>
      <div class="settings-modal">
        <h1>Edit Pattern Details</h1>

        <section>
          <span>
            Title:
            <input type="text" maxlength="20" v-model="details.patTitle" @change="update" />
          </span>
          <span>
            Author:
            <input type="text" maxlength="9" v-model="details.patAuthor" @change="update" />
          </span>
          <span>
            Town:
            <input type="text" maxlength="9" v-model="details.patTown" @change="update" />
          </span>

          <select v-model="details.patType" @change="update">
            <option v-for="(type, index) in patternTypes" :key="index" :value="index">{{type.name}}</option>
          </select>
        </section>
        <!-- title, author, town, type -->

        <div v-if="storedAuthorHuman">Stored: {{storedAuthorHuman}}</div>

        <div id="edit-notice">
          <p>
            IMPORTANT: AC:NH reads these patterns as AC:NL patterns; therefore,
            they will not be editable in-game since the game can't
            determine that they were originally made by you.
          </p>
          <p>
            Similarly, patterns with transparency will look corrupted
            when scanned in the NSO application but will look fine in-game.
          </p>
        </div>

        <button @click="saveAuthor">Copy Author Information</button>
        <button @click="loadAuthor">Load Copied Author Information</button>
        <button @click="update(); close()">Save</button>
        <button @click="close">Close</button>
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import DrawingTool from "~/libs/DrawingTool";

export default {
  name: "Settings",
  components: {
    ModalContainer
  },
  props: {
    types: {
      type: Array,
      required: true
    },
    drawingTool: {
      type: DrawingTool,
      required: true
    },
    patternDetails: {
      type: Object,
      default: () => {
        return {
          patTitle: "Empty",
          patAuthor: "Unknown",
          patTown: "Unknown",
          patType: 9
        };
      }
    }
  },
  data: function() {
    return {
      patternTypes: this.$props.types,
      details: {
        ...this.$props.patternDetails
      },
      storedAuthorHuman: undefined
    };
  },
  methods: {
    update() {
      this.details.patTitle = this.details.patTitle.trim();
      this.details.patTown = this.details.patTown.trim();
      this.details.patAuthor = this.details.patAuthor.trim();

      this.$emit("update", {
        details: {
          ...this.details
        },
        ...this.storedAuthorHuman
      });
    },
    saveAuthor() {
      this.storedAuthorHuman = `${this.drawingTool.creator[0]} / ${this.drawingTool.town[0]}`;
      localStorage.setItem("author_acnl", this.drawingTool.authorStrict);
    },
    loadAuthor() {
      this.drawingTool.authorStrict = localStorage.getItem("author_acnl");
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    },
    close() {
      this.$emit("close");
    }
  }
};
</script>

<style lang="scss" scoped>
$peach: #f6d7c9;

@import "styles/colors";
@import "styles/animations";

.settings-modal {
  background-color: $ecru-white;
  border-radius: 45px;
  color: $sand-dune;
  height: 500px;
  margin: 50px auto;
  padding: 20px 25px;
  width: 800px;

  // todo: stolen from color picker... need to sift through and see if this is
  // better off in modalcontainer
  display: inline-block;
  position: relative;
  top: 0;
  left: 50%;

  transform: translate(-50%, 0%);
  z-index: 999;

  h1 {
    padding: 15px 0;
    text-align: center;
  }

  input {
    margin: 8px 0;
    padding: 8px 12px;
  }

  button {
    border: none;
    border-radius: 35px;
    box-shadow: rgba(0, 0, 0, 0.2) 0 0 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 10px 14px;
  }
}
</style>