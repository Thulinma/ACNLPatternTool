<template>
  <div id="color-picker">
    <ACNLColorPicker
      v-if="acnlMode"
      :drawing-tool="drawingTool"
      @color-picked="colorPicked"/>

    <ACNHColorPicker
      v-if="!acnlMode"
      :drawing-tool="drawingTool"
      @color-picked="colorPicked"/>

    <button @click="close">
      Close Menu
    </button>
  </div>
</template>

<script>
import ACNHColorPicker from '/components/partials/ACNHColorPicker.vue';
import ACNLColorPicker from '/components/partials/ACNLColorPicker.vue';

export default {
  name: 'ColorPicker',
  props: {
    acnlMode: {
      type: Boolean,
      default: true,
    },
    drawingTool: {
      type: Object,
    }
  },
  components: {
    ACNHColorPicker,
    ACNLColorPicker,
  },
  methods: {
    close: function() {
      this.$emit('handler', true);
    },
    colorPicked: function(currentColor) {
      this.$emit('color-picked', currentColor);
    }
  }
}
</script>

<style lang="scss" scoped>
$pink: #F1B4C2;

  #color-picker {
    border-radius: 0 0 35px 35px;
    background-color: $pink;
    height: 0;
    top: 60px;
    padding: 0px;
    position: fixed;
    overflow: hidden;
    transition: 0.5s;
    width: 510px;
    z-index: 1;

    button {
      display: block;
      margin: 0 auto;
      border: none;
      border-radius: 35px;
      box-shadow: rgba(0,0,0,0.2) 0 0 8px;
      cursor: pointer;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 10px 14px;
    }
  }
</style>