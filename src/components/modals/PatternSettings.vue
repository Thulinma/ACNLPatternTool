<template>
  <VCard elevation="0" class="settings--card rounded-xl" width="auto">
    <VCardTitle class="title">Settings</VCardTitle>
    <VCardText class="settings-grid">
      <VTextField
        v-model="details.title"
        class="text-field"
        label="Title"
        :maxlength="drawingTool.compatMode === 'ACNL' ? 20: 21"
        :hint="`${drawingTool.compatMode} pattern's name.`"
        persistent-hint
        outlined
        clearable
        counter
        @keydown.stop
      />
      <VTextField
        v-model="details.creator.name"
        class="text-field"
        label="Villager"
        :maxlength="drawingTool.compatMode === 'ACNL' ? 9: 10"
        :hint="`${drawingTool.compatMode} villager's name.`"
        persistent-hint
        outlined
        clearable
        counter
        @keydown.stop
      />
      <VTextField
        v-model="details.town.name"
        class="text-field"
        label="Town"
        :maxlength="drawingTool.compatMode === 'ACNL' ? 9: 10"
        :hint="`${drawingTool.compatMode} town's name.`"
        persistent-hint
        outlined
        clearable
        counter
        @keydown.stop
      />

      <div>
        <VSelect
          class="select"
          v-model="details.type"
          label="Pattern Type"
          :items="patternTypes.map((t, i) => ({ text: t.name, value: i })).reverse()"
          :hint="`${drawingTool.compatMode} pattern type.`"
          persistent-hint
          outlined
          :menu-props="{
            'content-class': 'settings-type--menu',
          }"
        />
        <div>
          <VBtn
            class="settings-save-btn rounded-lg"
            elevation="0"
            @click="update(); $emit('close')"
          >
            Save
          </VBtn>
        </div>
      </div>

      <div v-if="!showAdvanced && drawingTool.compatMode === 'ACNL'">
        <VBtn
          class="settings-advanced-btn rounded-lg"
          elevation="0"
          @click="showAdvanced = !showAdvanced"
        >
          Advanced
        </VBtn>
      </div>
      
      <div v-if="showAdvanced && drawingTool.compatMode === 'ACNL'">
        <VTooltip
          content-class="settings-tooltip rounded-lg"
          top
        >
          <template #activator="{ on, attrs }">
            <VBtn
              class="settings-store-meta-btn rounded-lg"
              elevation="0"
              @click="storeMeta"
              v-bind="attrs"
              v-on="on"
            >
              Store Metadata
            </VBtn>
          </template>
          <div>
            Stores hidden fields to make current pattern editable <br/> for the current villager in the town. <br/><br/>
            <strong>Requires a pattern made by the villager in the town.</strong>
          </div>
        </VTooltip>
      </div>
      
      <div v-if="showAdvanced && drawingTool.compatMode === 'ACNL'">
        <VTooltip
          content-class="settings-tooltip rounded-lg"
          top
        >
          <template #activator="{ on, attrs }">
            <VBtn
              class="settings-load-meta-btn rounded-lg"
              elevation="0"
              @click="loadMeta"
              v-bind="attrs"
              v-on="on"
            >
              Load Metadata
            </VBtn>
          </template>
          <div>
            Overwrites stored hidden fields to make  <br/>
            current pattern editable in ACNL. <br/><br/>
            <strong>Requires stored metadata.</strong>
          </div>
        </VTooltip>
      </div>
    </VCardText>
    <CancelButton @click="$emit('close')" />
  </VCard>
</template>

<script>
import {
  VCard,
  VCardTitle,
  VCardText,
  VTextField,
  VSelect,
  VTooltip,
  VIcon,
} from "vuetify/lib";
import CancelButton from "~/components/modals/CancelButton.vue";
import DrawingTool from "~/libs/DrawingTool";

export default {
  name: "Settings",
  components: {
    VCard,
    VCardTitle,
    VCardText,
    VTextField,
    VSelect,
    VTooltip,
    VIcon,
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
@use "styles/overrides";
@import "styles/colors";
@import "styles/screens";
@import "styles/positioning";
@import "styles/resets";

.settings--card {
  color: $jambalaya !important;
  background-color: $ecru-white;
}

.title {
  font-family: Nunito !important;
}

.settings-grid {
  box-sizing: border-box;
  @include relative-in-place;
  z-index: 999;

  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;
  grid-auto-columns: auto;
  grid-auto-columns: auto;
  row-gap: 19px;

  color: $jambalaya;

  @include tablet-landscape {
    min-width: 500px;
    width: auto;
    height: auto;
  }
}

.text-field {
  @include overrides.v-text-field(
    $jambalaya,
    $cinderella,
    $olive-haze,
  );
}
.select {
  @include overrides.v-select(
    $jambalaya,
    $cinderella,
    $olive-haze,
  );
}


.settings-save-btn,
.settings-advanced-btn,
.settings-load-meta-btn,
.settings-store-meta-btn {
  display: flex;
  width: 100%;
  font-size: 1.1rem;
}

.settings-save-btn {
  @include overrides.v-btn(
    $ecru-white,
    $robin-egg-blue,
  );
  &:hover {
    @include stripes($tiffany-blue, $tiffany-blue-light, 20px);
    @include moving-stripes(8s);
    border: 4px solid $turquoise;
  }
}

.settings-advanced-btn,
.settings-load-meta-btn,
.settings-store-meta-btn {
  @include overrides.v-btn(
    $ecru-white,
    $olive-haze,
  );
  &:hover {
    @include polkadots($olive-haze, $donkey-brown);
    @include moving-polkadots;
  }
}


</style>

<style lang="scss">
@use "styles/colors";
@use "styles/overrides";

.settings-type--menu {
  @include overrides.v-menu(
    colors.$jambalaya,
    colors.$cinderella,
  );
}

.settings-tooltip {
  padding: 10px;
  background-color: colors.$jambalaya;
}
</style>