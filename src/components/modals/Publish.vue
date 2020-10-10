<template>
  <ModalContainer
    @modal-close="$emit('close')"
    @scroll-freeze="$emit('scroll-freeze')"
    @scroll-unfreeze="$emit('scroll-unfreeze')"
  >
    <template #window>
      <div class="publish--window">
        <CancelButton @click="$emit('close')" />
        <div class="publish--header">
          <div class="publish--icon-cloud-container">
            <IconCloud class="publish--icon-cloud" />
          </div>
          <div class="publish--header-text">Publish Your Design!</div>
        </div>

        <IconGenerator
          class="publish--render"
          :width="280"
          :height="280"
          :pattern="drawingTool"
        />

        <div class="publish--inputs">
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
        </div>

        <div class="publish--style-tags">
          <div class="publish--style-tags-title">Style Tags</div>
          <div class="publish--style-tag-selectors">
            <select
              v-for="(selected, i) in selectedStyles"
              :key="i"
              class="publish--style-tags-select"
              v-model="selectedStyles[i]"
            >
              <option value>- - -</option>
              <option
                v-for="style in styleOptionSets[i]"
                :value="style"
                :key="style"
              >
                {{ style }}
              </option>
            </select>
          </div>
        </div>

        <div class="publish--type-tags">
          <div class>Type Tags</div>
          <div class="publish--type-tag-selectors">
            <select
              class="publish--type-tags-select"
              v-for="(selected, i) in selectedTypes"
              :key="i"
              v-model="selectedTypes[i]"
            >
              <option value>- - -</option>
              <option
                v-for="type in typeOptionSets[i]"
                :value="type"
                :key="type"
              >
                {{ type }}
              </option>
            </select>
          </div>
        </div>

        <div class="publish--bottom-row">
          <div class="publish--nsfw">
            <input type="checkbox" id="nsfw" v-model="isNSFW" />
            <label for="nsfw">NSFW</label>
          </div>

          <button
            :class="{
              'publish--publish-button': true,
              active: isUploading,
            }"
            @click="publish"
          >
            Publish
          </button>
        </div>
      </div>
    </template>
  </ModalContainer>
</template>

<script>
import ModalContainer from "~/components/positioned/ModalContainer.vue";
import CancelButton from "~/components/modals/CancelButton.vue";
import IconCloud from "~/components/icons/IconCloud.vue";
import IconGenerator from "~/components/IconGenerator.vue";
import DrawingTool from "~/libs/DrawingTool";
import Tooltip from "~/components/Tooltip.vue";
import origin from "~/libs/origin";

export default {
  name: "Publish",
  components: {
    ModalContainer,
    CancelButton,
    IconGenerator,
    IconCloud,
    Tooltip,
  },
  props: {
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
    const styles = [...origin.tags_style];
    const types = [...origin.tags_type];
    const selectedStyles = new Array(3).fill("");
    const selectedTypes = new Array(3).fill("");
    return {
      styles,
      types,
      details: {
        ...this.$props.patternDetails,
      },
      selectedStyles,
      selectedTypes,
      isNSFW: false,
      isUploading: false,
    };
  },
  computed: {
    styleOptionSets() {
      // do not allow duplicate selections
      return new Array(3).fill(null).map((_, i) => {
        return this.styles
          .slice()
          .filter(
            (option) =>
              this.selectedStyles.indexOf(option) <= -1 ||
              this.selectedStyles.indexOf(option) === i
          );
      });
    },
    typeOptionSets() {
      return new Array(3).fill(null).map((_, i) => {
        return this.types
          .slice()
          .filter(
            (option) =>
              this.selectedTypes.indexOf(option) <= -1 ||
              this.selectedTypes.indexOf(option) === i
          );
      });
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

    async publish() {
      if (this.isUploading) return;
      const title = this.details.title;
      const town = this.details.town.name;
      const author = this.details.town.author;
      const isNSFW = this.isNSFW;
      this.isUploading = true;
      const uplStatus = await origin.upload(
        btoa(this.drawingTool.toString()),
        ...this.selectedStyles,
        ...this.selectedTypes,
        isNSFW
      );
      if (uplStatus["upload"]) {
        this.open = false;
        this.$router.push({ hash: `H:${uplStatus["upload"]}` });
        window.alert("Successfully uploaded to database");
        this.$emit("close");
      } else if (uplStatus.includes("error")) {
        window.alert(
          "A pattern just like this already exists in the database!"
        );
        this.$emit("close");
      }
      this.isUploading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/resets";
@import "styles/screens";

.publish--window {
  box-sizing: border-box;
  @include relative-in-place;
  position: fixed;
  z-index: 999;

  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  grid-auto-columns: auto;
  row-gap: 25px;

  padding: 14px 23px;

  background-color: $ecru-white;
  color: $jambalaya;

  width: 100%;
  height: 100%;
  overflow: scroll;

  @include phone-landscape {
    padding: 28px 46px;
  }
  @include tablet-landscape {
    @include absolute-center;
    width: auto;
    height: auto;
    grid-template-rows: unset;
    grid-template-columns: unset;
    grid-auto-columns: unset;
    grid-auto-columns: unset;
    grid-template-areas:
      "header header header header header header"
      "render render inputs inputs inputs inputs"
      "style-tags style-tags style-tags type-tags type-tags type-tags"
      "bottom-row bottom-row bottom-row bottom-row bottom-row bottom-row";
    padding: 30px 40px;
    column-gap: 20px;
    box-shadow: 0px 3px 20px rgba(0, 0, 0, 0.16);
    border-radius: 45px;
    overflow: visible;
  }
}

.publish--header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: left;
  align-content: center;
  align-items: center;
  @include tablet-landscape {
    grid-area: header;
  }
}

.publish--icon-cloud-container {
  margin-right: 15px;

  background-color: $cinderella;
  border-radius: 5px;
  padding: 0px 3px;
}

.publish--icon-cloud {
  fill: $jambalaya;
  align-items: str;
}

.publish--header-text {
  font-size: 1.1rem;
  font-weight: 600;
}

.publish--render {
  justify-self: center;
  align-self: center;
  background-color: $cinderella;
  border-radius: 10px;
  border-style: dashed;
  border-color: #707070;
  border-width: 4px;

  width: 250px;
  height: 250px;

  @include phone-landscape {
    width: 300px;
    height: 300px;
  }

  @include tablet-landscape {
    justify-self: flex-start;
    grid-area: render;
  }
}

.publish--inputs {
  display: grid;
  row-gap: 20px;
  justify-items: stretch;

  @include tablet-landscape {
    justify-items: auto;
    min-width: 500px;
    margin-left: 50px;
    grid-area: inputs;
  }
}

.settings--input-field {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
}

.settings--input-field-name {
  display: block;
  margin-bottom: 10px;

  &.required {
    .asterisk {
      color: $tiffany-blue;
    }
  }
}

.settings--input-container {
  @include relative-in-place;
  background-color: $cinderella;
  padding: 13px 25px;
  border-radius: 10px;

  &:hover {
    background-color: $salmon;
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

.publish--style-tags {
  @include tablet-landscape {
    grid-area: style-tags;
  }
}

.publish--type-tags {
  @include tablet-landscape {
    grid-area: type-tags;
  }
}

.publish--style-tags,
.publish--type-tags {
  display: grid;
  row-gap: 10px;

  font-size: 1.1rem;
  font-weight: 600;
  color: $jambalaya;
}

.publish--style-tag-selectors,
.publish--type-tag-selectors {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: left;
  justify-items: stretch;
  column-gap: 10px;
  row-gap: 20px;

  @include phone-landscape {
    justify-items: auto;
    grid-template-columns: 1fr 1fr 1fr;
    row-gap: 0px;
  }
}

select {
  @include reset-input;

  font-size: 1.1rem;

  background-color: $cinderella;
  border-radius: 8px;
  font-weight: 600;
  color: $jambalaya;
  padding: 10px 10px;
  cursor: pointer;
}

.publish--bottom-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;

  margin-bottom: 30px;

  @include tablet-landscape {
    margin-bottom: 0px;
    grid-area: bottom-row;
  }
}

.publish--nsfw {
  justify-self: right;
  align-self: center;

  input,
  label {
    cursor: pointer;
  }
}

.publish--publish-button {
  @include reset-button;
  justify-self: left;
  align-self: center;

  border-width: 4px;
  margin-left: 30px;
  padding: 6px 45px;
  font-weight: 600;

  color: white;
  border-style: solid;
  border-color: $tiffany-blue;
  background: $tiffany-blue;

  border-radius: 10px;
  cursor: pointer;

  &.active,
  &:hover {
    border-color: $turquoise;
    @include stripes($tiffany-blue, $tiffany-blue-light, 15px);
    @include moving-stripes(3s);
  }
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