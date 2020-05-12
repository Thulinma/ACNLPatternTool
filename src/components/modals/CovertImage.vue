<template>
  <button @click="convertImage=true;colorPickerHandler(true)">
    <IconBase icon-name="convert" :icon-color="brown" class="svg nav white-circle">
      <IconImageAdd />
    </IconBase><!-- phone svg -->
    Convert from Image
  </button><!-- convert from image button -->

      <!-- <ModalContainer v-if="convertImage" @modal-close="convertImage=false">
      <template #window><div class="modal">
        <div class="modal-header">
          <IconBase icon-name="convert image" :icon-color="white" height=20 width=20>
            <IconImageAdd />
          </IconBase>
          Convert Image
        </div>
        <ImageLoader class="modal-window" :pattern-type="patType" @converted="onConvert" />
      </div></template>
    </ModalContainer> -->
</template>

<script>

    // onConvert: function(patterns){
    //   this.convertImage = false;
    //   if (patterns.length == 1){
    //     this.extLoad(patterns[0]);
    //   }else{
    //     this.multiName = "Conversion Result";
    //     this.pickPatterns = patterns;
    //     this.allowMoveToLocal = true;
    //   }
    // },
export default {
  
}
</script>