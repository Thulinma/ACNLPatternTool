<template>
  <div>
    <button 
      id="open-modal-button"
      @click="open=!open">
      Publish
    </button>

    <ModalContainer
      v-if="open" 
      @modal-close="open=false">
      <template #window>
        <div id="publish-modal">
          <h1>Publish Your Design!</h1><!-- header -->

          <div>
            <section>
              <select v-model="patternType">
                <option
                  v-for="(type, index) in patternTypes"
                  :key="index"
                  :value="index">
                  {{type.name}}
                </option>
              </select><!-- model type dropdown -->

              <div id="render-preview">
                <ThreeDRender :width="300" :height="300" :drawing-tool="drawingTool"/>
              </div><!-- 3D preview -->
            </section><!-- type, model render -->

            <section>
              <span>Title: <input type="text" maxlength="20" v-model="details.patTitle"></span>
              <span>Author: <input type="text" maxlength="9" v-model="details.patAuthor"></span>
              <span>Town: <input type="text" maxlength="9" v-model="details.patTown"></span>
            </section><!-- title, author, town -->
          </div>

          <section>
            <div id="style-tags">
              <label>Style Tags</label>

              <select @change="tagSelected($event.target.value, 'style')">
                <option
                  v-for="(tag, index) in styles"
                  :key="index"
                  :value="tag">
                  {{tag}}
                </option>
              </select>

              <div class="selected-tags">
                <div
                  v-for="(tag, index) in selectedStyles"
                  :key="index">
                  {{tag}} X
                </div>
              </div>
            </div><!-- style tags -->

            <div id="type-tags">
              <label>Type Tags</label>

              <select @change="tagSelected($event.target.value, 'type')">
                <option
                  v-for="(tag, index) in types"
                  :key="index"
                  :value="tag">
                  {{tag}}
                </option>
              </select>

              <div class="selected-tags">
                <div
                  v-for="(tag, index) in selectedTypes"
                  :key="index">
                  {{tag}} X
                  </div>
              </div>
            </div><!-- type tags -->
          </section><!-- style tags, type tags -->

          <button
            id="submit"
            :disabled="validForm"
            @click="publish">
            Publish
          </button>
        </div>
      </template>
    </ModalContainer>
  </div>
</template>

<script>
import ModalContainer from '/components/ModalContainer.vue';
import ThreeDRender from '/components/ThreeDRender.vue';

/* libs */
import origin from '/libs/origin';

export default {
  name: "Publish",
  components: {
    ModalContainer,
    ThreeDRender,
  },
  props: {
    drawingTool: {
      type: Object,
    },
    styleTags: {
      type: Array,
      default: () => {
        return [];
      },
    },
    typeTags: {
      type: Array,
      default: () => {
        return [];
      },
    },
    patternDetails: {
      type: Object,
      default: () => {
        return {
          patTitle: 'Empty',
          patAuthor: 'Unknown',
          patTown: 'Unknown',
          selectedTypes: [],
          selectedStyles: [],
        }
      },
    }
  },
  data: function() {
    let styles = [...origin.tags_style];
    let types = [...origin.tags_type];

    return {
      styles,
      types,
      patternTypes: this.$props.drawingTool.allTypes,
      patternType: '',
      selectedTypes: [],
      selectedStyles: [],

      open: false,
      validForm: false,
      details: {
        ...this.$props.patternDetails,
      }
    }
  },
  methods: {
    tagSelected(val, tagType) {
      const tag = val;
      let availableTags = tagType == 'style' ? this.styles : this.types;
      let selected = tagType == 'style' ? this.details.selectedStyles : this.details.selectedTypes;

      if (selected.length <= 3 && !selected.includes(val)) selected.push(val);
    },
    update() {
      this.$emit('update', {
        ...details,
      });
    },
    async publish() {
      // update parent data
      this.update();
      // todo: update this to be
      // let uplStatus = await origin.upload(btoa(this.drawingTool.toString()), [...this.patternDetails.styles], [...this.patternDetails.types] this.patternDetails.NSFW);
      // let uplStatus = await origin.upload(btoa(this.drawingTool.toString()), this.pubStyleA, this.pubStyleB, this.pubStyleC, this.pubTypeA, this.pubTypeB, this.pubTypeC, this.pubNSFW);

      if (uplStatus['upload']) {
        this.open = false;
        this.$router.push({hash: `H:${uplStatus['upload']}`});
      } else if (uplStatus.includes('error')) {
        window.alert('A pattern just like this already exists in the database!');
      }
    },
  }

  // todo:
  // help icons explaining character length
  // help icons explaining tags
  // style tags:
  // - instead of pubStyleA, pubStyleB, pubStyleC...
  // - have an array of styles... pop out the one if selected from drop down
  // - have an array of selected styles, display those, delete if they are deleted, etc
  // - on submit, pop them into pubStyleA, pubStyleB, etc
}
</script>

<style lang="scss" scoped>
  $off-white: #F7F4E6;
  $brown: #695B4D;
  $peach: #F6D7C9;

  #publish-modal {
    background-color: $off-white;
    border-radius: 45px;
    color: $brown;
    height: 550px;
    margin: 50px auto;
    padding: 20px 25px;
    width: 800px;

    h1 {
      text-align: center;
    }
  }

  #open-modal-button {
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