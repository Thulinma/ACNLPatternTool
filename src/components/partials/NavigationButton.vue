<template>
  <div>
    <button id="nav-button">
      <img 
        id="nav-icon"
        :src="compassSvg"
        @click="open=!open"
      >
    </button>

    <ModalContainer v-if="open" @modal-close="open=false">
      <template #window>
        <NookPhoneMenu 
          v-model="open"/>
      </template>
    </ModalContainer>
  </div>
</template>

<script>
import NookPhoneMenu from '/components/NookPhoneMenu.vue';
import ModalContainer from '/components/ModalContainer.vue';

/* svg icons */
import compassSvg from '/assets/icons/nookphone/compass.svg';

export default {
  data: function() {
    return {
      open: false,
      compassSvg,
    }
  },
  components: {
    ModalContainer,
    NookPhoneMenu,
  }
}
</script>

<style lang="scss" scoped>
$dark-brown: #4D3D36;
$off-white: #F8F3E8;

#nav-button {
  background: $dark-brown;
  border-radius: 8px;
  padding: 8px;

  display: flex;
  align-items: center;

  #nav-icon {
    background: $off-white;
    border-radius: 100%;
    cursor: pointer;
    height: 25px;
    padding: 3px;
    transform: rotate(20deg);
    width: 25px;
  }
}
</style>