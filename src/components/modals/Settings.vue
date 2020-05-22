<template>
<div>
  <button
    :class="{
        'shortcut settings': true,
        'active': open,
        }"
      @click="open=!open">
    <div class="shortcut-icon-container">
      <IconDetail class="shortcut-icon" />
    </div>
    <div class="shortcut-tooltip">Settings</div>
  </button>

  <ModalContainer
    v-if="open"
    @modal-close="open=false">
    <template #window>
      <div id="info-modal">
        <h1>Edit Pattern Details</h1>

        <section>
          <span>Title: <input type="text" maxlength="20" v-model="details.patTitle" @change="update"></span>
          <span>Author: <input type="text" maxlength="9" v-model="details.patAuthor" @change="update"></span>
          <span>Town: <input type="text" maxlength="9" v-model="details.patTown" @change="update"></span>

          <select
            v-model="details.patType"
            @change="update">
            <option
              v-for="(type, index) in patternTypes"
              :key="index"
              :value="index">
              {{type.name}}
            </option>
          </select>
        </section><!-- title, author, town, type -->

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
        <button @click="update;open=false">Save</button>
        <button @click="open=false">Close</button>
      </div>
    </template>
  </ModalContainer>
</div>
</template>

<script>
import ModalContainer from '~/components/positioned/ModalContainer.vue';

// icon
import IconDetail from "~/components/icons/IconDetail.vue";

export default {
  name: 'Settings',
    props: {
    drawingTool: {
      type: Object,
    },
    patternDetails: {
      type: Object,
      default: () => {
        return {
          patTitle: 'Empty',
          patAuthor: 'Unknown',
          patTown: 'Unknown',
          patType: 9,
        }
      },
    }
  },
  components: {
    IconDetail,
    ModalContainer,
  },
  props: {
    types: {
      type: Array,
      required: true,
    },
    patternDetails: {
      type: Object,
      default: () => {
        return {
          patTitle: 'Empty',
          patAuthor: 'Unknown',
          patTown: 'Unknown',
          patType: 9,
          selectedTypes: [],
          selectedStyles: [],
        }
      },
    },
    drawingTool: {
      type: Object,
      required: true,
    }
  },
  data: function() {
    return {
      patternTypes: this.$props.types,
      details: {
        ...this.$props.patternDetails,
      },
      open: false,
      storedAuthorHuman: undefined,
    }
  },
  methods: {
    update() {
      this.details.patTitle = this.details.patTitle.trim();
      this.details.patTown = this.details.patTown.trim();
      this.details.patAuthor = this.details.patAuthor.trim();

      this.$emit('update', {
        details: {
          ...this.details,
        },
        ...this.storedAuthorHuman,
      });
    },
    saveAuthor() {
      this.storedAuthorHuman = `${this.drawingTool.creator[0]} / ${this.drawingTool.town[0]}`;
      localStorage.setItem('author_acnl', this.drawingTool.authorStrict);
    },
    loadAuthor() {
      this.drawingTool.authorStrict = localStorage.getItem('author_acnl');
      this.patAuthor = this.drawingTool.creator[0];
      this.patTown = this.drawingTool.town[0];
    },
  }
}
</script>

<style lang="scss" scoped>
  $off-white: #F7F4E6;
  $brown: #695B4D;
  $peach: #F6D7C9;

@import "styles/colors";
@import "styles/animations";

  .shortcut {
    display: block;
    font-family: inherit;
    appearance: none;
    outline: none;
    padding: 0px;
    border: 0px;

    background: none;

    cursor: pointer;
    position: relative;
    top: 0;
    left: 0;

    .shortcut-icon-container {
      box-sizing: border-box;
      width: 65px;
      height: 65px;

      position: relative;
      top: 0;
      left: 0;
      padding: 4px;
      border-radius: 999px;
    }

    .shortcut-icon {
      position: relative;
      top: 50%;
      transform: translate(0%, -50%);

      width: 100%;
      height: 100%;
      fill: $blossom;
    }
    &.settings .shortcut-icon {
      width: 85%;
      height: 85%;
    }
    &.brush .shortcut-icon {
      width: 80%;
      height: 80%;
    }
    &.eye-dropper .shortcut-icon {
      width: 90%;
      height: 90%;
    }
    &.preview .shortcut-icon {
      width: 70%;
      height: 70%;
    }

    .shortcut-tooltip {
      transition: transform 0.15s cubic-bezier(0.5, 0.1, 0.3, 1.5);
      display: inline-block;
      white-space: nowrap;
      padding: 10px 20px;

      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translate(-50%, -10px) scale(0.8);
      z-index: 999;

      font-size: 1.5rem;
      font-weight: 600;

      color: white;
      background-color: rgba($tiffany-blue, 0.9);
      border-radius: 10px;
      pointer-events: none;
      opacity: 0;
    }

    &:hover,
    &.active {
      .shortcut-icon-container {
        background: repeating-linear-gradient(
          -45deg,
          $tiffany-blue-light,
          $tiffany-blue-light 15px,
          $tiffany-blue 15px,
          $tiffany-blue 30px
        );
        background-size: 200% 200%;
        animation: barberpole 3s linear infinite;
      }

      .shortcut-icon {
        fill: $frosted-mint;
      }
    }

    &:hover .shortcut-tooltip {
      opacity: 1;
      transform: translate(-50%, -10px) scale(1);
    }
  }

  #info-modal {
    background-color: $off-white;
    border-radius: 45px;
    color: $brown;
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
      box-shadow: rgba(0,0,0,0.2) 0 0 8px;
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