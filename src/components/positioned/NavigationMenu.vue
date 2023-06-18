<template>
  <VCard elevation="0" class="menu--card">
    <div class="menu--container">
      <div class="menu--header">
        <div class="menu--header-icons-left">
          <IconNookService class="menu--header-img menu--header-bars" />
          <IconNookHead class="menu--header-img menu--header-nook" />
        </div>
        <div>
          <span class="menu--time">{{ time }}</span>
        </div>
        <div class="menu--header-icons-right">
          <IconNookGPS class="menu--header-img menu--header-gps" />
        </div>
      </div>
      <div class="menu--title">{{ menuTitle }}</div>

      <div class="menu--nav">
        <router-link class="home" to="/">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('Home')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavHome class="menu--nav-item" />
          </div>
        </router-link>

        <router-link class="browse" to="/browse">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('Browse')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavBrowse class="menu--nav-item" />
          </div>
        </router-link>

        <router-link class="editor" to="/editor">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('Editor')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavEditor class="menu--nav-item" />
          </div>
        </router-link>

        <router-link class="faq" to="/faq">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('FAQ')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavFaq class="menu--nav-item" />
          </div>
        </router-link>

        <router-link class="about" to="/about">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('About Us')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavAbout class="menu--nav-item" />
          </div>
        </router-link>

        <router-link class="updates" to="/updates">
          <div
            class="menu--nav-icon-container"
            @click="$emit('modal-close')"
            @mouseover="enterNavItem('Updates')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavUpdates class="menu--nav-item" />
          </div>
        </router-link>

        <a
          class="discord"
          href="https://discord.com/invite/9rGkZNk"
          target="_blank"
        >
          <div
            class="menu--nav-icon-container"
            @mouseover="enterNavItem('Discord')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavDiscord class="menu--nav-item" />
          </div>
        </a>

        <a class="twitter" href="https://twitter.com/acpatterns" target="_blank">
          <div
            class="menu--nav-icon-container"
            @mouseover="enterNavItem('Twitter')"
            @mouseleave="leaveNavItem()"
          >
            <IconNavTwitter class="menu--nav-item" />
          </div>
        </a>
      </div>
    </div>
    <CancelButton class="nav-menu-cancel" @click="$emit('modal-close')" />
  </VCard>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { VCard } from "vuetify/lib";
// header svgs
import IconNookHead from "@/assets/icons/nookphone/nook-head.svg?inline";
import IconNookGPS from "@/assets/icons/nookphone/nook-gps.svg?inline";
import IconNookService from "@/assets/icons/nookphone/nook-service.svg?inline";
// nav icons
import IconNavBrowse from "@/assets/icons/nav/browse.svg?inline";
import IconNavEditor from "@/assets/icons/nav/editor.svg?inline";
import IconNavFaq from "@/assets/icons/nav/faq.svg?inline";
import IconNavUpdates from "@/assets/icons/nav/updates.svg?inline";
import IconNavDiscord from "@/assets/icons/nav/discord.svg?inline";
import IconNavHome from "@/assets/icons/nav/home.svg?inline";
import IconNavAbout from "@/assets/icons/nav/about.svg?inline";
import IconNavTwitter from "@/assets/icons/nav/twitter.svg?inline";

import CancelButton from "@/components/modals/CancelButton.vue";

const menuTitleDefault = "Main Menu";

@Component({
  components: {
    VCard,
    IconNavHome,
    IconNavEditor,
    IconNavBrowse,
    IconNavFaq,
    IconNavAbout,
    IconNavUpdates,
    IconNavDiscord,
    IconNavTwitter,
    IconNookHead,
    IconNookGPS,
    IconNookService,
    CancelButton,
  },
})
export default class NookPhoneMenu extends Vue {
  menuTitle: string = "MainMenu";
  currDateTime: Date = new Date();
  interval: number | undefined;
  
  get time() {
    return this.currDateTime.toLocaleTimeString(
      "en-US", {
        hour: "2-digit",
        timeZoneName: "short",
      },
    );
  }
  
  async enterNavItem(menuTitle: string = menuTitleDefault) {
    this.menuTitle = menuTitle;
  }
  
  async leaveNavItem() {
    const curr = this.menuTitle;
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
    if (this.menuTitle === curr)
      this.menuTitle = menuTitleDefault;
  }
  
  mounted() {
    this.interval = window.setInterval(() => {
      this.currDateTime = new Date();
    }, 1000);
  }
  
  unmounted() {
    window.clearInterval(this.interval);
    this.interval = undefined;
  }
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/icon-colors" as icon-colors;
@use "styles/positioning" as positioning;
@use "styles/transitions" as transitions;
@use "styles/screens" as screens;

.nav-menu-cancel {
  top: 35px;
  right: 24px;
}

.menu--card {
  background-color: transparent;
}

.menu--container {
  box-sizing: border-box;
  display: inline-block;
  background-color: colors.$ecru-white;
  user-select: none;
  border-radius: 90px !important;
  width: 100%;
  height: 100%;

  position: relative;
  padding: 30px 30px;

  @include screens.tablet-portrait {
    width: auto;
    height: auto;
  }
}

.menu--header {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;

  position: relative;
  top: 0;
  left: 0;
  font-size: 1rem;
  color: #e0dbc8;

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
  color: colors.$jambalaya;
}

.menu--nav {
  margin-top: 25px;
  margin-bottom: 50px;

  display: grid;
  grid-template-rows: repeat(3, 90px);
  grid-template-columns: repeat(3, 90px);
  justify-content: center;
  justify-items: stretch;
  align-content: center;
  align-items: stretch;
  row-gap: 13px;
  column-gap: 13px;

  .menu--nav-icon-container {
    @include positioning.relative-in-place;
    width: 100%;
    height: 100%;
    transition: transform 0.1s transitions.$energetic;
    transform: scale(1);
    &:hover {
      transform: scale(1.15);
      cursor: pointer;
    }
  }
}

.editor .menu--nav-icon-container {
  background-color: icon-colors.$salmon;
}
.browse .menu--nav-icon-container {
  background-color: icon-colors.$pearl-aqua;
}
.faq .menu--nav-icon-container {
  background-color: icon-colors.$cream-can;
}
.updates .menu--nav-icon-container {
  background-color: icon-colors.$copper;
}
.discord .menu--nav-icon-container {
  background-color: icon-colors.$perano;
}
.home .menu--nav-icon-container {
  background-color: icon-colors.$pastel-red;
}
.about .menu--nav-icon-container {
  background-color: icon-colors.$de-york;
}
.twitter .menu--nav-icon-container {
  background-color: icon-colors.$portage;
}

.menu--nav-icon-container {
  @include positioning.relative-in-place;
  width: 100%;
  height: 100%;
  border-radius: 35px;
}
</style>
