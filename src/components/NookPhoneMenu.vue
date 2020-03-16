<template>
  <div class="nook-phone">
    <div class="nook-header">
        <span class="nook-time">{{ time }}</span>
    </div>
    <h2>Main Menu</h2>
    <div class="nook-buttons">
        <!-- <button v-on:click="onLocalSave"> -->
        <button>
            <!-- <object class="svg nav brown-circle" :data="storageAddSvg"></object> -->
            Save to Personal Storage
        </button>
        <!-- <button v-on:click="onPublish"> -->
        <button>
            <!-- <object class="svg nav brown-circle" :data="storageAddSvg"></object> -->
            Publish
        </button>
        <!-- <button v-on:click="onOpenDB"> -->
        <button>
            <!-- <object class="svg nav brown-circle" :data="storageSvg"></object> -->
            Open DB
        </button>
        <!-- <button v-on:click="onOpenLocal"> -->
        <button>
            <!-- <object class="svg nav brown-circle" :data="storageSvg"></object> -->
            Open Storage
        </button>
        <!-- <button v-on:click="onModalOpen"> -->
        <button>
            <!-- <object class="svg nav brown-circle" :data="barcodeSvg"></object> -->
            Generate QR code(s)
        </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "NookPhoneMenu",
  data: function() {
    return {
        dateObj: new Date(),
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}),
    };
  },
  created() {
      const interval = setInterval(() => this.time = this.dateObj.toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}), 1000);
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.nook-phone {
    border-radius: 45px;
    background-color: #FFFAE3;
    color: #7E7261;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 550px;
    width: 320px;
    padding: 20px 25px;
    font-weight: 800;
}
.nook-header {
    color: #DCD8CA;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.nook-phone h2 {
    margin: 10px 0;
    font-size: 24px;
}
.nook-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.nook-buttons button {
    height: 100px;
    width: 100px;
    margin: 6px 3px 0;
}
</style>
