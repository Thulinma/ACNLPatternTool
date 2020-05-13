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
        <h1>
          <IconBase icon-name="convert image" icon-color="#FFFFFF" height=20 width=20>
            <IconImageAdd />
          </IconBase>
          Convert Image
        </h1>

        <ImageLoader :pattern-type="type" @converted="convert"/>
      </template>
    </ModalContainer> 
  </div>
</template>

<script>
import ModalContainer from '/components/ModalContainer.vue';

/* svg icons */
import IconBase from '/components/icons/IconBase.vue';
import IconImageAdd from '/components/icons/IconImageAdd.vue';

export default {
  name: "ConvertImage",
  components: {
    ModalContainer,
    IconBase,
    IconImageAdd,
  },
  props: {
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
    }
  }
}
</script>

<style lang="scss" scoped>

</style>