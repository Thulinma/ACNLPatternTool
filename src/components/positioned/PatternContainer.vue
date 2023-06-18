<template>
  <VCard
    elevation="0"
    class="card rounded-xl"
    :color="colors.ecruWhite"
  >
    <v-toolbar
      class="toolbar"
      color="transparent"
      flat
      short
    >
      <v-toolbar-title><slot name="title"></slot></v-toolbar-title>
      <v-spacer/>
      
      <v-tooltip bottom>
        <template #activator="{ on }">
          <v-btn
            v-on="on"
            icon
            :color="colors.jambalaya"
            @click="expandMosaics = !expandMosaics"
          >
            <v-icon v-if="expandMosaics">mdi-image-size-select-large</v-icon>
            <v-icon v-else>mdi-image-size-select-actual</v-icon>
          </v-btn>
        </template>
        <span>
          <span v-if="expandMosaics">Pattern View</span>
          <span v-else>Mosaic View</span>
        </span>
      </v-tooltip>
      
      <!-- TODO: MENU WITH MORE OPTIONS -->
      <!-- <v-menu
        bottom
        left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, i) in []"
            :key="i"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu> -->
      
      <v-btn
        icon
        small
        fab
        outlined
        :color="colors.jambalaya"
        @click="$emit('close')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <!-- <VCardTitle class="card-title"><slot name="title"></slot></VCardTitle> -->
    <VCardText :class="{
      'card-text' : true,
      'card-text--empty': patternItems.length === 0,
    }">

      <Grid class="pattern-grid" v-if="patternItems.length > 0"
        :patternItems="patternItems"
        :expandMosaics="expandMosaics"
        @selectPatternItems="$emit('select', $event)"
      />

      <div v-else
        class="empty-ctn"
      >
        <BrushIcon class="brush-icon" />
        <div class="empty-message">
          <slot name="empty-message">No patterns available</slot>
        </div>
      </div>
    </VCardText>
    <UtilityBar v-if="options.length > 0" :options="options" />
  </VCard>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import {
  VToolbar,
  VToolbarTitle,
  VToolbarItems,
  VBtn,
  VIcon,
  VCard,
  VCardTitle,
  VCardText,
  VBadge,
  VAutocomplete,
  VScaleTransition,
} from "vuetify/lib";
import BrushIcon from "@/assets/icons/brush.svg?inline";
import PreviewGenerator from "@/components/PreviewGenerator.vue";
import Grid from "@/components/PatternItems/Grid.vue";
import GridItemSelector from "@/components/PatternItems/GridItemSelector.vue";
import GridItem from "@/components/PatternItems/GridItem.vue";
import CancelButton from "@/components/modals/CancelButton.vue";
import UtilityBar, { UtilityBarOption } from "@/components/positioned/UtilityBar.vue";
import { PatternItem } from "@/libs/storage";
import colors from "@/styles/colors.scss";


@Component({
  components: {
    VToolbar,
    VToolbarTitle,
    VToolbarItems,
    VBtn,
    VIcon,
    VCard,
    VCardTitle,
    VCardText,
    VBadge,
    VAutocomplete,
    VScaleTransition,
    PreviewGenerator,
    Grid,
    GridItemSelector,
    GridItem,
    CancelButton,
    UtilityBar,
    BrushIcon,
  },
})
export default class PatternContainer extends Vue {
  @Prop({
    type: Array,
    required: true,
  }) readonly patternItems!: PatternItem[];
  
  @Prop({
    type: Array,
    default: () => [],
  }) readonly selected!: PatternItem[];
  
  @Prop({
    type: Array,
    default: () => [],
  }) readonly options!: UtilityBarOption[];
  
  readonly colors = colors;
  expandMosaics: boolean = false;

  isSelected(patternItem: PatternItem) {
    return this.selected.includes(patternItem);
  }
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/overrides" as overrides;

.card {
  overflow-y: auto;
  height: 100%;
}

.toolbar {
  flex: 0 0 auto;
  color: colors.$jambalaya;
  @include overrides.v-toolbar {
    padding-right: 20px;
  }
}

.card-title {
  color: colors.$jambalaya !important;
}

.card-text {
  overflow-x: hidden;
  overflow-y: scroll;
  padding-top: 24px !important;
  display: flex;
  flex-direction: row;
  justify-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
  align-items: flex-start;

  &.card-text--empty {
    justify-items: center;
    justify-content: center;
    align-content: center;
    align-items: center;
  }
}

.pattern-grid {
  position: relative;
  flex: 1 1 auto;
}

.empty-ctn {
  display: grid;
  justify-items: center;
}

.brush-icon {
  padding: 20px 30px;
  height: 150px;
  width: 150px;
}
.brush-icon path {
  fill: colors.$donkey-brown !important;
}

.empty-message {
  margin-top: 30px;
  text-align: center;
  font-size: 1.2rem;
  color: colors.$donkey-brown;
}
</style>