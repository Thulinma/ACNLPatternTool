<template>
<div>
  <button
    id="change-info-button"
    @click="open=!open">
      Change Details
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
      storedAuthorHuman: undefined,
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
    saveAuthor() {},
    loadAuthor() {},
  }
}
</script>

<style lang="scss" scoped>
  $off-white: #F7F4E6;
  $brown: #695B4D;
  $peach: #F6D7C9;

  #info-modal {
    background-color: $off-white;
    border-radius: 45px;
    color: $brown;
    height: 500px;
    margin: 50px auto;
    padding: 20px 25px;
    width: 800px;

    h1 {
      padding: 15px 0;
      text-align: center;
    }

    input {
      margin: 8px 0;
      padding: 8px 12px;
    }
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
</style>