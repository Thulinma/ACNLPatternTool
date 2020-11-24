<template>
  <ModalContainer
    @modal-close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #window>
      <div class="settings--window">
        <CancelButton @click="$emit('close')" />
        <label class="settings--input-field">
          <div class="settings--input-field-name required">
            Title<span class="asterisk">*</span>
            <Tooltip class="settings--tooltip">
              <div class="settings--tooltip-content">
                <div class="settings--tooltip-content">
                  <div>Title character limits:</div>
                  <div>ACNL: 21 chars.</div>
                  <div>ACNH: 20 chars.</div>
                </div>
              </div>
            </Tooltip>
          </div>
          <div class="settings--input-container">
            <input
              v-if="drawingTool.compatMode === 'ACNL'"
              id="pattern-title"
              class="settings--input"
              type="text"
              maxlength="20"
              spellcheck="false"
              autocomplete="off"
              v-model="details.title"
              @keydown.stop
            />
            <input
              v-else-if="drawingTool.compatMode === 'ACNH'"
              id="pattern-title"
              class="settings--input"
              type="text"
              maxlength="21"
              spellcheck="false"
              autocomplete="off"
              v-model="details.title"
              @keydown.stop
            />
          </div>
        </label>

        <label class="settings--input-field">
          <div class="settings--input-field-name required">
            Author<span class="asterisk">*</span>
            <Tooltip class="settings--tooltip">
              <div class="settings--tooltip-content">
                <div>Author character limit:</div>
                <div>ACNL: 9 chars.</div>
                <div>ACNH: 10 chars.</div>
              </div>
            </Tooltip>
          </div>
          <div class="settings--input-container">
            <input
              v-if="drawingTool.compatMode === 'ACNL'"
              class="settings--input"
              type="text"
              maxlength="9"
              spellcheck="false"
              autocomplete="off"
              v-model="details.creator.name"
              @keydown.stop
            />
            <input
              v-else-if="drawingTool.compatMode === 'ACNH'"
              class="settings--input"
              type="text"
              maxlength="10"
              spellcheck="false"
              autocomplete="off"
              v-model="details.creator.name"
              @keydown.stop
            />
          </div>
        </label>

        <label class="settings--input-field">
          <div class="settings--input-field-name required">
            Town<span class="asterisk">*</span>
            <Tooltip class="settings--tooltip">
              <div class="settings--tooltip-content">
                <div>Town character limit:</div>
                <div>ACNL: 9 chars.</div>
                <div>ACNH: 10 chars.</div>
              </div>
            </Tooltip>
          </div>
          <div class="settings--input-container">
            <input
              v-if="drawingTool.compatMode === 'ACNL'"
              class="settings--input"
              type="text"
              maxlength="9"
              spellcheck="false"
              autocomplete="off"
              v-model="details.town.name"
              @keydown.stop
            />
            <input
              v-else-if="drawingTool.compatMode === 'ACNH'"
              class="settings--input"
              type="text"
              maxlength="10"
              spellcheck="false"
              autocomplete="off"
              v-model="details.town.name"
              @keydown.stop
            />
          </div>
        </label>

        <div class="settings--row-4">
          <select class="settings--type" v-model="details.type">
            <option
              v-for="(type, index) in patternTypes"
              :key="index"
              :value="index"
            >
              {{ type.name }}
            </option>
          </select>

          <button
            class="settings--confirm"
            @click="
              update();
              $emit('close');
            "
          >
            Confirm
          </button>
        </div>

        <button
          class="settings--advanced-button"
          v-if="!showAdvanced && drawingTool.compatMode === 'ACNL'"
          @click="showAdvanced = !showAdvanced"
        >
          Advanced
          <IconChevronDown class="settings--advanced-expand-icon" />
        </button>
        <button
          class="settings--advanced-button"
          v-if="showAdvanced && drawingTool.compatMode === 'ACNL'"
          @click="storeMeta"
        >
          Store Meta Info
          <Tooltip class="settings--tooltip">
            <div class="settings--tooltip-content">
              Stores current hidden fields to make another pattern editable in
              ACNL only. The current pattern loaded should be a pattern coming
              from your ACNL save.
            </div>
          </Tooltip>
        </button>
        <button
          class="settings--advanced-button"
          v-if="showAdvanced && drawingTool.compatMode === 'ACNL'"
          @click="loadMeta"
        >
          Load Meta Info
          <Tooltip class="settings--tooltip">
            <div class="settings--tooltip-content">
              Loads hidden fields to make another pattern editable in ACNL only.
              The current pattern loaded should not be a pattern coming from
              your ACNL save.
              <div>{{ metaCreatorStr }}</div>
              <div>{{ metaTownStr }}</div>
            </div>
          </Tooltip>
        </button>
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import DrawingTool from "~/libs/DrawingTool";
import IconChevronUp from "~/components/icons/IconChevronUp.vue";
import IconChevronDown from "~/components/icons/IconChevronDown.vue";
import Tooltip from "~/components/Tooltip.vue";

export default {
  name: "Settings",
  components: {
    ModalContainer,
    Tooltip,
    IconChevronDown,
    CancelButton,
  },
  props: {
    types: {
      type: Array,
      required: true,
    },
    drawingTool: {
      type: DrawingTool,
      required: true,
    },
    patternDetails: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      patternTypes: this.$props.types,
      details: {
        ...this.$props.patternDetails,
      },
      storedAuthorHuman: undefined,
      showAdvanced: false,
      originalType: this.$props.patternDetails.type,
      storedMeta: {
        creator: {
          id: 0,
          name: "",
        },
        town: {
          id: 0,
          name: "",
        },
      },
    };
  },
  computed: {
    metaCreatorStr() {
      const creatorStr = `creator: ${this.storedMeta.creator.id} ${this.storedMeta.creator.name}`;
      return creatorStr;
    },
    metaTownStr() {
      const townStr = `town: ${this.storedMeta.town.id} ${this.storedMeta.town.name}`;
      return townStr;
    },
  },
  methods: {
    update() {
      this.details.title = this.details.title.trim();
      this.details.town.name = this.details.town.name.trim();
      this.details.creator.name = this.details.creator.name.trim();
      if (this.originalType !== this.details.type) {
        const msg =
          "A change in pattern type may cause the pattern to change in specific areas. Do you wish to proceed?";
        const confirm = window.confirm(msg);
        if (!confirm) return;
      }

      this.$emit("update-details", {
        ...this.details,
      });
    },
    storeMeta() {
      const { town, creator } = this.details;
      const meta = JSON.stringify({
        creator: { ...creator },
        town: { ...town },
      });

      this.storedMeta.creator = { ...creator };
      this.storedMeta.town = { ...town };
      localStorage.setItem("acnl_meta", meta);
    },
    loadMeta() {
      const meta = JSON.parse(localStorage.getItem("acnl_meta"));
      if (meta == null) return;
      this.details.creator.id = meta.creator.id;
      this.details.creator.name = meta.creator.name;
      this.details.town.id = meta.town.id;
      this.details.town.name = meta.town.name;
    },
  },
  mounted() {
    const meta = JSON.parse(localStorage.getItem("acnl_meta"));
    if (meta == null) return;
    this.storedMeta.creator.id = meta.creator.id;
    this.storedMeta.creator.name = meta.creator.name;
    this.storedMeta.town.id = meta.town.id;
    this.storedMeta.town.name = meta.town.name;
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/screens";
@import "styles/positioning";
@import "styles/resets";

.settings--window {
  box-sizing: border-box;
  @include relative-in-place;
  position: fixed;
  z-index: 999;

  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  grid-auto-columns: auto;
  row-gap: 19px;

  width: 100%;
  height: 100%;
  overflow: scroll;
  padding: 28px 46px;

  background-color: $ecru-white;
  color: $jambalaya;

  @include tablet-landscape {
    @include absolute-center;
    min-width: 500px;
    width: auto;
    height: auto;
    border-radius: 45px;
    overflow: visible; // reset
  }
}

.settings--input-field {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
}

.settings--input-field-name {
  display: block;
  margin-bottom: 8px;

  &.required {
    .asterisk {
      color: $tiffany-blue;
    }
  }
}

.settings--input-container {
  @include relative-in-place;
  background-color: $cinderella;
  padding: 10px 18px;
  border-radius: 4px;

  &:hover {
    background-color: $salmon;
  }

  @include tablet-landscape {
    padding: 15px 25px;
    border-radius: 8px;
  }
}

.settings--input {
  @include reset-input;

  display: block;
  width: 100%;
  padding-bottom: 10px;

  background-size: 20px 3px;
  background-position: bottom;
  background-repeat: repeat-x;
  background-image: linear-gradient(
    90deg,
    $ecru-white,
    $ecru-white 50%,
    transparent 50%,
    transparent 100%
  );
}

.settings--row-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
  align-items: stretch;
  column-gap: 20px;
}

.settings--confirm {
  @include reset-button;
  width: 100%;
  background-color: $tiffany-blue;
  box-sizing: border-box;

  padding: 5px 0px;
  color: white;
  border-radius: 8px;
  border: 5px solid transparent;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(3s);
    border: 5px solid $turquoise;
  }

  align-self: flex-start;

  @include tablet-landscape {
    align-self: stretch;
  }
}

.settings--type {
  @include reset-input;
  background-color: $cinderella;
  border-radius: 8px;
  font-weight: 600;
  color: $jambalaya;
  cursor: pointer;
  align-self: flex-start;
  padding: 10px 10px;

  @include tablet-landscape {
    padding: 0px 10px;
    align-self: stretch;
  }
}

.settings--advanced-button {
  @include reset-button;
  @include relative-in-place;
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  align-content: center;
  align-self: flex-start;

  padding: 10px 0px;
  background-color: $olive-haze;
  border-radius: 8px;
  color: white;
  font-weight: 600;

  cursor: pointer;

  &:hover {
    @include polkadots($olive-haze, $donkey-brown);
    @include moving-polkadots;
    z-index: 1;
  }

  @include tablet-landscape {
    padding: 10px 0px;
    align-self: stretch;
  }
}

.settings--advanced-expand-icon {
  display: inline-block;
  margin-left: 5px;
  fill: white;
  width: 16px;
}

.settings--tooltip {
  margin-left: 5px;
}

.settings--tooltip-content {
  width: 150px;
  font-size: 0.9rem;

  @include phone-landscape {
    width: 300px;
  }

  @include tablet-portrait {
    font-size: 1rem;
  }
}
</style>