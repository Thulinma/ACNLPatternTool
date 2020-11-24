<template>
  <div class="home--container">
    <div class="home--container-background"></div>
    <nav class="home--nav">
      <router-link class="updates" to="/updates">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <IconNavUpdates class="home--nav-icon" />
              <div class="home--nav--icon-half-circle"></div>
            </div>
          </div>
          <div class="home--nav-text-bubble">Updates</div>
        </div>
      </router-link>

      <router-link class="browse" to="/browse">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <IconNavBrowse class="home--nav-icon" :flip="true" />
              <div class="home--nav--icon-half-circle"></div>
            </div>
          </div>
          <div class="home--nav-text-bubble">Browse</div>
        </div>
      </router-link>

      <router-link class="editor" to="/editor">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <IconNavEditor class="home--nav-icon" />
              <div class="home--nav--icon-half-circle"></div>
            </div>
          </div>
          <div class="home--nav-text-bubble">Editor</div>
        </div>
      </router-link>

      <router-link class="faq" to="/faq">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <IconNavFaq class="home--nav-icon" />
              <div class="home--nav--icon-half-circle"></div>
            </div>
          </div>
          <div class="home--nav-text-bubble">FAQ</div>
        </div>
      </router-link>

      <a class="discord" href="https://discord.gg/9rGkZNk" target="blank">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <IconNavDiscord class="home--nav-icon" />
              <div class="home--nav--icon-half-circle"></div>
            </div>
          </div>
          <div class="home--nav-text-bubble">Discord</div>
        </div>
      </a>
    </nav>
    <div class="home--achievements">
      <div class="home--achievements-background"></div>
      <div class="home--ribbon-row">
        <div class="home--ribbon">
          <IconRibbonTailLeft class="home--ribbon-left" />
          <IconRibbonTailLeft class="home--ribbon-right" />
          <div class="home--ribbon-main">Patterns Uploaded</div>
        </div>
      </div>
      <div class="home--counter-row">
        <div class="home--counter">500,000+</div>
      </div>
      <div class="home--stamps-row">
        <div class="home--stamps">
          <div class="home--stamps-connecting-strip"></div>
          <div class="home--stamp-location">
            <IconStamp class="home--stamp" dateText="03/24/2020" />
          </div>
          <div class="home--stamp-location">
            <IconStamp class="home--stamp" dateText="03/28/2020" />
          </div>
          <div class="home--stamp-location">
            <!-- <IconStamp class="home--stamp" dateText="03/28/2020" /> -->
          </div>
          <div class="home--stamp-location">
            <!-- <IconStamp class="home--stamp" dateText="03/28/2020" /> -->
          </div>
          <div class="home--stamp-location">
            <!-- <IconStamp class="home--stamp" dateText="03/28/2020" /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconNavBrowse from "~/components/icons/IconNavBrowse.vue";
import IconNavEditor from "~/components/icons/IconNavEditor.vue";
import IconNavFaq from "~/components/icons/IconNavFaq.vue";
import IconNavUpdates from "~/components/icons/IconNavUpdates.vue";
import IconNavDiscord from "~/components/icons/IconNavDiscord.vue";
import IconRibbonTailLeft from "~/components/icons/IconRibbonTailLeft.vue";
import IconStamp from "~/components/icons/IconStamp.vue";

export default {
  name: "Home",
  components: {
    IconNavBrowse,
    IconNavEditor,
    IconNavFaq,
    IconNavUpdates,
    IconNavDiscord,
    IconRibbonTailLeft,
    IconStamp,
  },
  data: function () {
    return {};
  },
  methods: {
    goToBrowse: function () {
      this.$router.push({ path: `/browse` });
    },
    goToEditor: function () {
      this.$router.push({ path: `/editor` });
    },
    goToFAQ: function () {
      this.$router.push({ path: `/faq` });
    },
    goToChanges: function () {
      this.$router.push({ path: `/updates` });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/icon-colors";
@import "styles/positioning";
@import "styles/screens";
@import "styles/transitions";

.home--container {
  position: relative;
  top: 0;
  left: 0;
  background-color: $soapstone;

  min-height: 100%;
}

.home--container-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;

  background-image: url("../assets/images/Leaf_Brush_Pattern_Tile.svg");
  background-size: 500px 500px;
  opacity: 0.15;
}

.home--nav {
  position: relative;
  top: 0;
  left: 0;
  padding-top: 80px;
  padding-bottom: 250px;
  display: grid;
  grid-template-areas:
    "editor"
    "browse"
    "updates"
    "faq"
    "discord";
  justify-content: space-around;
  justify-items: center;
  align-content: center;
  align-items: center;
  row-gap: 30px;

  & .editor {
    grid-area: editor;
  }
  & .browse {
    grid-area: browse;
  }
  & .updates {
    grid-area: updates;
  }
  & .faq {
    grid-area: faq;
  }
  & .discord {
    grid-area: discord;
  }
  @include phone-landscape {
    grid-template-areas:
      "editor browse"
      "updates faq"
      "discord discord";
  }
  @include tablet-portrait {
    grid-template-areas:
      "editor editor browse browse updates updates"
      "faq faq faq discord discord discord";
  }
  @include tablet-landscape {
    padding-top: 100px;
    padding-bottom: 0px;
    grid-template-areas: "updates browse editor faq discord";
    @include screen-medium {
      position: fixed;
      width: 100%;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}

.editor,
.discord,
.updates,
.faq,
.browse {
  outline: none;
  transition: transform 0.1s $energetic;
}

.editor {
  & .home--nav-icon-container {
    background-color: $salmon;
  }
  & .home--nav--icon-half-circle {
    background-color: $pink;
  }
}
.browse {
  & .home--nav-icon-container {
    background-color: $keppel;
  }
  & .home--nav--icon-half-circle {
    background-color: $pearl-aqua;
  }
}
.updates {
  & .home--nav-icon-container {
    background-color: $copper;
  }
  & .home--nav--icon-half-circle {
    background-color: $wax-flower;
  }
}
.faq {
  & .home--nav-icon-container {
    background-color: $cream-can;
  }
  & .home--nav--icon-half-circle {
    background-color: $cape-honey;
  }
}
.discord {
  & .home--nav-icon-container {
    background-color: $portage;
  }
  & .home--nav--icon-half-circle {
    background-color: $perano;
  }
}

@include tablet-landscape {
  .updates {
    transform: scale(1) rotate(-14deg) translateY(80px);
    &:hover {
      transform: scale(1.1) rotate(-14deg) translateY(80px);
    }
  }

  .browse {
    transform: scale(1) rotate(-7deg) translateY(15px);
    &:hover {
      transform: scale(1.1) rotate(-7deg) translateY(15px);
    }
  }

  .editor {
    transform: scale(1) rotate(0deg) translateY(0px);
    &:hover {
      transform: scale(1.1) rotate(0deg) translateY(0px);
    }
  }

  .faq {
    transform: scale(1) rotate(7deg) translateY(15px);
    &:hover {
      transform: scale(1.1) rotate(7deg) translateY(15px);
    }
  }

  .discord {
    transform: scale(1) rotate(14deg) translateY(80px);
    &:hover {
      transform: scale(1.1) rotate(14deg) translateY(80px);
    }
  }
}

.home--nav-icon-bubble {
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;

  padding: 16px;

  background-color: $ecru-white;
  border-radius: 9999px;
  @include desktop-hd {
    padding: 20px;
  }
}

.home--nav-icon-container {
  @include relative-in-place;
  border-radius: 9999px;
  border-width: 14px;
  border-style: solid;
  border-color: $orange-white;
  overflow: hidden;
  
  @include desktop-hd {
    border-width: 15px;
  }
}

.home--nav-icon {
  @include relative-in-place;
  z-index: 10;
  width: 140px;
  height: 140px;
  border-radius: 9999px;

  @include tablet-landscape {
    width: 120px;
    height: 120px;
  }
  @include desktop-hd {
    width: 150px;
    height: 150px;
  }
}

.home--nav--icon-half-circle {
  @include absolute-center;
  top: 45%;
  transform: translate(-50%, 0px);
  width: 200%;
  height: 200%;
  border-radius: 9999px;
}

.home--nav-text-bubble {
  position: relative;
  margin-top: -60px;

  padding-top: 60px;
  padding-bottom: 20px;
  font-size: 1.8rem;

  text-align: center;
  font-weight: 600;
  border-radius: 999px;
  background-color: $ecru-white;
  color: $olive-haze;
}

.home--achievements {
  position: fixed;
  bottom: 0;
  z-index: 1;

  width: 100%;
  height: 130px;
  overflow: hidden;
  @include tablet-landscape {
    display: none;
    height: 125px;
    @include screen-small {
      display: block;
    }
    @include screen-smallX {
      display: block;
      height: 250px;
    }
    @include screen-medium {
      height: 275px;
    }
    @include screen-large {
      height: 325px;
    }
  }
}

.home--achievements-background {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 0;

  height: 3000px;
  width: 3000px;
  @include phone-landscape {
    height: 6000px;
    width: 6000px;
  }
  @include tablet-landscape {
    height: 3500px;
    width: 3500px;
  }
  @include desktop {
    height: 4500px;
    width: 4500px;
  }
  @include desktop-hd {
    height: 6000px;
    width: 6000px;
  }

  border-radius: 99999px;
  background-color: $ecru-white;
}

.home--ribbon-row {
  @include relative-in-place;
}

.home--ribbon {
  position: relative;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  display: inline-block;
}

.home--ribbon-main {
  display: inline-block;
  background-color: $pink;
  color: white;
  padding: 8px 25px;
  font-size: 1.5rem;
  font-weight: 600;
}

.home--ribbon-left,
.home--ribbon-right {
  position: absolute;
  top: 8px;
  z-index: -1;
  height: calc(100% - 5px);
  display: inline-block;
}
.home--ribbon-left {
  left: -10px;
  transform: translate(-50%, 0);
}
.home--ribbon-right {
  right: -10px;
  transform: translate(50%, 0) scaleX(-1);
}

.home--counter-row {
  margin-top: 20px;
  text-align: center;
  @include desktop {
    margin-top: 30px;
  }
}

.home--counter {
  @include relative-in-place;
  display: inline-block;
  color: $ecru-white;
  background-color: $olive-haze;
  padding: 15px 50px 12px 50px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 8px;
  @include tablet-landscape {
    border-radius: 100px;
    padding: 10px 20px 8px 20px;
  }
  @include desktop {
  }
  @include desktop-hd {
    font-size: 1.3rem;
  }
}

.home--stamps-row {
  @include relative-in-place;
  display: none;

  margin-top: 20px;
  @include tablet-landscape {
    display: none;
    justify-content: center;
    align-items: center;
    @include screen-smallX {
      display: flex;
    }
  }
}

.home--stamps {
  @include relative-in-place;
  display: inline-block;
}

.home--stamps-connecting-strip {
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translate(0, -50%);
  width: 100%;
  height: 15px;
  border-radius: 9999px;
  background-color: white;
}

.home--stamp-location {
  @include relative-in-place;
  height: 100px;
  width: 100px;
  display: inline-block;
  background-color: white;
  border-radius: 100%;
  & ~ & {
    margin-left: 15px;
  }

  @include tablet-landscape {
    height: 75px;
    width: 75px;
    @include screen-small {
      height: 100px;
      width: 100px;
    }
    @include screen-large {
      height: 130px;
      width: 130px;
    }
  }

  $base-transform: translate(-50%, -50%);
  &:nth-child(2) .home--stamp {
    transform: $base-transform rotate(10deg);
  }
  &:nth-child(3) .home--stamp {
    transform: $base-transform rotate(-10deg);
  }
}

.home--stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  height: calc(100% + 10px);
  transform: translate(-50%, -50%);
}
</style>
