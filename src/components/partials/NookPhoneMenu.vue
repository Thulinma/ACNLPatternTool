<template>
  <div id="nook-phone">
    <div id="nook-header">
      <div>
        <object :data="barsSvg"></object>
        <object :data="nookSvg"></object>
      </div>
      <span class="nook-time">{{ time }}</span>
      <div>
        <object :data="gpsSvg"></object>
      </div>
    </div><!-- time, service bars, gps icon, etc (header) -->

    <h2>Main Menu</h2>

    <div id="nook-buttons">
      <img 
        :src="browseSvg"
        @click="goToBrowse"
      >
      <img
        :src="editorSvg"
        @click="closeMenu"
      >
      <img
        :src="faqSvg"
        @click="goToFAQ"
      >
      <img
        :src="changelogSvg"
        @click="goToChanges"
      >
      <a href="https://discord.gg/9rGkZNk">
        <img :src="discordSvg">
      </a>
      <a href="https://nooknet.net">
        <img :src="nooknetSvg">
      </a>
    </div><!-- nav buttons -->
  </div>
</template>

<script>
// header svgs
import nookSvg from '/assets/icons/nookphone/nook-head.svg';
import gpsSvg from '/assets/icons/nookphone/nook-gps.svg';
import barsSvg from '/assets/icons/nookphone/nook-service.svg';

// menu svgs
import browseSvg from '/assets/icons/nookphone/nav-browse.svg';
import changelogSvg from '/assets/icons/nookphone/nav-changelog.svg';
import discordSvg from '/assets/icons/nookphone/nav-discord.svg';
import editorSvg from '/assets/icons/nookphone/nav-editor.svg';
import faqSvg from '/assets/icons/nookphone/nav-faq.svg';
import nooknetSvg from '/assets/icons/nookphone/nav-nooknet.svg';

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
        nookSvg,
        gpsSvg,
        barsSvg,
        browseSvg,
        changelogSvg,
        discordSvg,
        editorSvg,
        faqSvg,
        nooknetSvg,
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
$nook-phone-background-color: #F0ECE1;
$nook-phone-color: #7E7261;
$nook-phone-header-color: #DCD8CA;

#nook-phone {
  border-radius: 45px;
  background-color: $nook-phone-background-color;
  color: $nook-phone-color;
  font-weight: 800;
  height: 550px;
  margin: 50px auto;
  padding: 20px 25px;
  width: 320px;

  display: flex;
  align-items: center;
  flex-direction: column;

  h2 {
    margin: 10px 0;
    font-size: 24px;
  }

  #nook-header {
    color: $nook-phone-header-color;
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-around;

    object {
      height: 25px;
      width: 25px;
    }
  }
  
  #nook-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    img {
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
      width: 100px;
      margin: 6px 3px 0;
    }
  }
}
</style>
