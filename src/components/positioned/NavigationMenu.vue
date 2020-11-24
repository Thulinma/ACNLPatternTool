<template>
  <div class="menu--container">
    <CancelButton class="nav-menu-cancel" @click="$emit('modal-close')" />
    <div class="menu--header">
      <div class="menu--header-icons-left">
        <img class="menu--header-img menu--header-bars" :src="barsSvg" />
        <img class="menu--header-img menu--header-nook" :src="nookSvg" />
      </div>
      <div>
        <span class="menu--time">{{ time }}</span>
      </div>
      <div class="menu--header-icons-right">
        <img class="menu--header-img menu--header-gps" :src="gpsSvg" />
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
</template>

<script>
// header svgs
import nookSvg from "~/assets/icons/nookphone/nook-head.svg";
import gpsSvg from "~/assets/icons/nookphone/nook-gps.svg";
import barsSvg from "~/assets/icons/nookphone/nook-service.svg";

import IconNavBrowse from "~/components/icons/IconNavBrowse.vue";
import IconNavEditor from "~/components/icons/IconNavEditor.vue";
import IconNavFaq from "~/components/icons/IconNavFaq.vue";
import IconNavUpdates from "~/components/icons/IconNavUpdates.vue";
import IconNavDiscord from "~/components/icons/IconNavDiscord.vue";
import IconNavHome from "~/components/icons/IconNavHome.vue";
import IconNavAbout from "~/components/icons/IconNavAbout.vue";
import IconNavTwitter from "~/components/icons/IconNavTwitter.vue";

import CancelButton from "~/components/modals/CancelButton.vue";

const menuTitleDefault = "Main Menu";
export default {
  name: "NookPhoneMenu",
  components: {
    IconNavHome,
    IconNavEditor,
    IconNavBrowse,
    IconNavFaq,
    IconNavAbout,
    IconNavUpdates,
    IconNavDiscord,
    IconNavTwitter,
    CancelButton,
  },
  data: function () {
    return {
      barsSvg,
      gpsSvg,
      nookSvg,
      dateObj: new Date(),
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        timeZoneName: "short",
      }),
      menuTitle: "Main Menu",
    };
  },
  mounted() {
    const interval = setInterval(
      () =>
        (this.time = this.dateObj.toLocaleTimeString("en-US", {
          hour: "2-digit",
          timeZoneName: "short",
        })),
      1000
    );
  },
  methods: {
    enterNavItem: async function (menuTitle = menuTitleDefault) {
      this.menuTitle = menuTitle;
    },
    leaveNavItem: async function () {
      const curr = this.menuTitle;
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
      if (this.menuTitle === curr) this.menuTitle = menuTitleDefault;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/icon-colors";
@import "styles/positioning";
@import "styles/transitions";
@import "styles/screens";

.nav-menu-cancel {
  @include tablet-portrait {
    top: 20px;
    right: 12px;
  }
}

.menu--container {
  box-sizing: border-box;
  display: inline-block;
  background-color: $ecru-white;
  user-select: none;

  width: 100%;
  height: 100%;

  position: relative;
  animation: menu-open 0.15s ease-in-out 1 forwards;
  padding: 30px 30px;
  z-index: 999;

  @include tablet-portrait {
    position: fixed;
    width: auto;
    height: auto;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 90px;
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
  color: $jambalaya;
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
    @include relative-in-place;
    width: 100%;
    height: 100%;
    transition: transform 0.1s $energetic;
    transform: scale(1);
    &:hover {
      transform: scale(1.15);
      cursor: pointer;
    }
  }
}

.editor .menu--nav-icon-container {
  background-color: $salmon;
}
.browse .menu--nav-icon-container {
  background-color: $pearl-aqua;
}
.faq .menu--nav-icon-container {
  background-color: $cream-can;
}
.updates .menu--nav-icon-container {
  background-color: $copper;
}
.discord .menu--nav-icon-container {
  background-color: $perano;
}
.home .menu--nav-icon-container {
  background-color: $pastel-red;
}
.about .menu--nav-icon-container {
  background-color: $de-york;
}
.twitter .menu--nav-icon-container {
  background-color: $portage;
}

.menu--nav-icon-container {
  @include relative-in-place;
  width: 100%;
  height: 100%;
  border-radius: 35px;
}
</style>
