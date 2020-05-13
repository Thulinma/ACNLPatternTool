<template>
<div>
  <button
    id="change-info-button"
    @click="open=!open">
      Change
  </button>

  <ModalContainer 
    v-if="open" 
    @modal-close="open=false">
    <template #window>
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
      <button @click="update">Save</button>
      <button @click="open=false">Close</button>
    </template>
    </ModalContainer>
  </div>
</template>

<script>
import ModalContainer from '/components/ModalContainer.vue';

export default {
  name: "PatternInfo",
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
    ModalContainer,
  },
  props: {
    types: {
      type: Array,
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
    }
  },
  data: function() {
    return {
      patternTypes: this.$props.types,
      details: {
        ...this.$props.patternDetails,
      },
      open: false,
    }
  },
  methods: {
    update() {
      this.details.patTitle = this.details.patTitle.trim();
      this.details.patTown = this.details.patTown.trim();
      this.details.patAuthor = this.details.patAuthor.trim();

      this.$emit('update', {
        ...this.details,
      });
    },
  }
}
</script>

<style lang="scss" scoped>

</style>