<template>
  <div class="menu--container">
    <div class="menu--header">
      <div class="menu--header-icons-left">
        <img
          class="menu--header-img menu--header-bars"
          :src="barsSvg"/>
        <img
          class="menu--header-img menu--header-nook"
          :src="nookSvg"/>
      </div>
      <div><span class="menu--time">{{ time  }}</span></div>
      <div class="menu--header-icons-right">
        <img
          class="menu--header-img menu--header-gps"
          :src="gpsSvg"/>
      </div>
    </div>
    <div class="menu--title">{{ menuTitle }}</div>
    <div class="menu--nav">
      <img
        class="menu--nav-item"
        :src="browseSvg"
        @click="goTo('/browse')"
        @mouseover="enterNavItem('Browse')"
        @mouseleave="leaveNavItem()"/>
      <img
        class="menu--nav-item"
        :src="editorSvg"
        @click="goTo('/editor')"
        @mouseover="enterNavItem('Editor')"
        @mouseleave="leaveNavItem()"/>
      <img
        class="menu--nav-item"
        :src="faqSvg"
        @click="goTo('/faq')"
        @mouseover="enterNavItem('FAQ')"
        @mouseleave="leaveNavItem()"/>
      <img
        class="menu--nav-item"
        :src="changelogSvg"
        @click="goTo('/updates')"
        @mouseover="enterNavItem('Updates')"
        @mouseleave="leaveNavItem()"/>
      <img
        class="menu--nav-item"
        :src="discordSvg"
        @click="goTo('https://discord.com/invite/9rGkZNk', true)"
        @mouseover="enterNavItem('Discord')"
        @mouseleave="leaveNavItem()"/>
      <img
        class="menu--nav-item"
        :src="nooknetSvg"
        @click="goTo('https://nooknet.net/', true)"
        @mouseover="enterNavItem('NookNet')"
        @mouseleave="leaveNavItem()"/>
    </div>
  </div>
</template>

<script>
// header svgs
import nookSvg from '/assets/icons/nookphone/nook-head.svg';
import gpsSvg from '/assets/icons/nookphone/nook-gps.svg';
import barsSvg from '/assets/icons/nookphone/nook-service.svg';

// menu svgs
import browseSvg from '/assets/icons/nookphone/nav-browse.svg';
import editorSvg from '/assets/icons/nookphone/nav-editor.svg';
import faqSvg from '/assets/icons/nookphone/nav-faq.svg';
import changelogSvg from '/assets/icons/nookphone/nav-changelog.svg';
import discordSvg from '/assets/icons/nookphone/nav-discord.svg';
import nooknetSvg from '/assets/icons/nookphone/nav-nooknet.svg';

import ModalContainer from '~/components/positioned/ModalContainer.vue';

const menuTitleDefault = "Main Menu";
export default {
  name: "NookPhoneMenu",
  components: {
    ModalContainer,
  },
  data: function() {
    return {
        nookSvg,
        gpsSvg,
        barsSvg,
        dateObj: new Date(),
        time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}),
        menuTitle: "Main Menu",
        browseSvg,
        changelogSvg,
        discordSvg,
        editorSvg,
        faqSvg,
        nooknetSvg,
    };
  },
  mounted() {
    const interval = setInterval(() => this.time = this.dateObj.toLocaleTimeString('en-US', {hour: '2-digit', timeStyle: 'short'}), 1000);
  },
  methods: {
    enterNavItem: async function(menuTitle = menuTitleDefault) {
      this.menuTitle = menuTitle
    },
    leaveNavItem: async function() {
      const curr = this.menuTitle;
      await new Promise((resolve, reject) => {
        setTimeout(() => {resolve()}, 300);
      });
      if (this.menuTitle === curr)
        this.menuTitle = menuTitleDefault;
    },
    goTo: function(path, external = false) {
      if (external) {
        window.open(path);
      }
      this.$emit('modal-close');
      if (path !== this.$route.path) {
        this.$router.push({ path });
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import "styles/colors";

.menu--container {
  display: inline-block;
  background-color: $ecru-white;
  user-select: none;

  position: relative;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  animation: menu-open 0.15s ease-in-out 1 forwards;

  border-radius: 90px;
  padding: 30px 30px;
  z-index: 999;
}


.menu--header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-around;
  align-content: flex-end;

  position: relative;
  top: 0;
  left: 0;
  font-size: 1rem;
  color: #E0DBC8;

  .menu--time {
    text-align: center;
    vertical-align: text-bottom;
  }
  & > * {
        flex: 1 1 0px;
        text-align: center;
        display: inline-block;
  }
  .menu--header-img {
    display: inline-block;
    height: 1rem;
    vertical-align: bottom;
  }
  .menu--header-gps {
    height: 1.3rem;
    position: relative;
  }
}

.menu--title {
  margin-top: 37px;

  font-size: 2rem;
  text-align: center;
  color: $domino;
}

.menu--nav {
  margin-top: 25px;
  margin-bottom: 50px;

  display: grid;
  grid-template-rows: repeat(3, 90px);
  grid-template-columns: repeat(3, 90px);
  row-gap: 13px;
  column-gap: 13px;

  .menu--nav-item {
    width: 100%;

    transform: scale(1);
    &:hover {
      transform: scale(1.15);
      cursor: pointer;
    }
  }
}
</style>
