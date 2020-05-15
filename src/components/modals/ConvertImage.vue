<template>
  <div>
    <button @click="open=!open">
      <IconBase icon-name="convert" icon-color="#7E7261" class="svg nav white-circle">
        <IconImageAdd />
      </IconBase><!-- phone svg -->
      Convert from Image
    </button><!-- convert from image button -->

    <ModalContainer v-if="open" @modal-close="open=false">
      <template #window>
        <div id="convert-modal">
          <h1>
            <IconBase icon-name="convert image" icon-color="#FFFFFF" height=20 width=20>
              <IconImageAdd />
            </IconBase>
            Convert Image
          </h1>

          <ImageLoader :pattern-type="type" @converted="convert"/>
        </div>
      </template>
    </ModalContainer>
  </div>
</template>

<script>
import ImageLoader from '/components/ImageLoader.vue';
import ModalContainer from '~/components/positioned/ModalContainer';

/* svg icons */
import IconBase from '/components/icons/IconBase.vue';
import IconImageAdd from '/components/icons/IconImageAdd.vue';

export default {
  name: "ConvertImage",
  components: {
    ImageLoader,
    ModalContainer,
    IconBase,
    IconImageAdd,
  },
  props: {
    drawingTool: {
      type: Object,
    },
    type: {
      type: Number,
      default: 9,
    }
  },
  data: function() {
    return {
      open: false,
      brown: '#7E7261',
      teal: '#57B7A8',
      orange: '#DC8D69',
      white: '#FFFFFF',
    }
  },
  methods: {
    convert: function(patterns) {
      if (patterns.length == 1){
        this.extLoad(patterns[0]);
      } else {
        this.multiName = "Conversion Result";
        this.pickPatterns = patterns;
        this.allowMoveToLocal = true;
      }

      this.open=false;
    },
    extLoad: function(data) {
      this.drawingTool.load(data);
    },
  }
}
</script>

<style lang="scss" scoped>
  $off-white: #F7F4E6;
  $brown: #695B4D;
  $peach: #F6D7C9;

  #convert-modal {
    background-color: $off-white;
    border-radius: 45px;
    color: $brown;
    height: 620px;
    margin: 50px auto;
    padding: 20px 25px;
    width: 850px;

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