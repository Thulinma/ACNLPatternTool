<template>
  <div class="nook-phone">
    <div class="nook-header">
        <span class="nook-time">{{ time }}</span>
    </div>
    <h2>Main Menu</h2>
    <div class="nook-buttons">
        <button @click="goToBrowse">
            Browse
        </button>
        <button @click="goToFAQ">
            FAQ
        </button>
        <button @click="goToChanges">
            Changelog
        </button>
        <a href="https://discord.gg/UVgMK2h">
            <button>
                Discord
            </button>
        </a>
        <button @click="closeMenu">
            Close Menu
        </button>
    </div>
  </div>
</template>

<script>
import storageSvg from '/assets/icons/bxs-folder-open.svg';
import storageAddSvg from '/assets/icons/bxs-folder-plus.svg';
import barcodeSvg from '/assets/icons/bx-barcode-reader.svg';
export default {
  name: "NookPhoneMenu",
  model: {
      prop: 'mainMenu',
      event: 'close',
  },
  data: function() {
    return {
        dateObj: new Date(),
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}),
        storageSvg,
        storageAddSvg,
        barcodeSvg,
    };
  },
  created() {
      const interval = setInterval(() => this.time = this.dateObj.toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}), 1000);
  },
  methods: {
    goToBrowse: function() {
      this.$router.push({ path: `/browse` });
    },
    goToEditor: function() {
      this.$router.push({ path: `/editor` });
    },
    goToFAQ: function() {
      this.$router.push({ path: `/faq` });
    },
    goToChanges: function() {
      this.$router.push({ path: `/changelog` });
    },
    closeMenu: function() {
        this.$emit('close', false);
    }
  }
}
</script>

<style lang="scss" scoped>
.nook-phone {
    border-radius: 45px;
    background-color: #F0ECE1;
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
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    width: 100px;
    margin: 6px 3px 0;
}
</style>
