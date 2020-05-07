<template>
  <div>
    <h1>Publish Your Design!</h1><!-- header -->

    <section>
      <select id="model-type">
        <option
          v-for="(type, index) in allTypes"
          :key="index"
          :value="index">{{type.name}}
        </option>
      </select><!-- model type dropdown -->

      <div id="render-preview">
        <ThreeDRender :width="196" :height="300" :drawing-tool="drawingTool"/>
      </div><!-- 3D preview -->
    </section><!-- type, model render -->

    <section>
      <span>Title: <input type="text" maxlength="20" v-model="patTitle"></span>
      <span>Author: <input type="text" maxlength="9" v-model="patAuthor"></span>
      <span>Town: <input type="text" maxlength="9" v-model="patTown"></span>
    </section><!-- title, author, town -->

    <section>
      <div id="style-tags">
        <label>Style Tags</label>
        <select>
          <option
            v-for="(tag, index) in styleTags"
            :key="index"
            :value="tag">{{tag}}
          </option>
        </select>
      </div><!-- style tags -->

      <div id="type-tags">
        <label>Type Tags</label>
        <select>
          <option
            v-for="(tag, index) in typeTags"
            :key="index"
            :value="tag">{{tag}}
          </option>
        </select>
      </div><!-- type tags -->
    </section><!-- style tags, type tags -->
  </div>
</template>

<script>
export default {
  name: "Publish Modal",
  props: {
    drawingTool: {
      type: Object,
    },
    patternTypes: {
      type: Object,
    },
    styleTags: {
      type: Array,
      default: ['--------'],
    },
    typeTags: {
      type: Array,
      default: ['--------'],
    },
  },
  data: function() {
    let styles = [...this.props.styleTags];
    let types = [...this.props.typeTags];

    return {
      styles,
      types,
      patternType: '',
      selectedTypes: [],
      selectedStyles: [],
    }
  },
  methods: {
    tagSelected(val, tagType) {
      const tag = val;
      let availableTags = tagType == 'style' ? [...this.styles] : [...this.types];
      let selected = tagType == 'style' ? [...this.selectedStyles] : [...this.selectedTypes];

      if (selected.length <= 3) selected.push(val);
      
      // remove this tag from the list of available options
      availableTags = availableTags.splice(availableTags.indexOf(val), 1);
    }
  }
  // update drawingTool with
  // pattitle
  // patauthor
  // pattown

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

</style>