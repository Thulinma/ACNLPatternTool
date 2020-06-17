<template>
  <div class="home--container">
    <div class="home--background"></div>
    <nav class="home--nav">
      <router-link class="updates" to="/updates">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <img class="home--nav-icon" :src="changelogSvg" />
            </div>
          </div>
          <div class="home--nav-text-bubble">Updates</div>
        </div>
      </router-link>

      <router-link class="browse" to="/browse">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <img class="home--nav-icon" :src="browseSvg" />
            </div>
          </div>
          <div class="home--nav-text-bubble">Browse</div>
        </div>
      </router-link>

      <router-link class="editor" to="/editor">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <img class="home--nav-icon" :src="editorSvg" />
            </div>
          </div>
          <div class="home--nav-text-bubble">Editor</div>
        </div>
      </router-link>

      <router-link class="faq" to="/faq">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <img class="home--nav-icon" :src="faqSvg" />
            </div>
          </div>
          <div class="home--nav-text-bubble">FAQ</div>
        </div>
      </router-link>

      <a class="discord" href="https://discord.gg/9rGkZNk" target="blank">
        <div class="home--nav-item">
          <div class="home--nav-icon-bubble">
            <div class="home--nav-icon-container">
              <img class="home--nav-icon" :src="discordSvg" />
            </div>
          </div>
          <div class="home--nav-text-bubble">Discord</div>
        </div>
      </a>
    </nav>

  </div>
</template>

<script>
import browseSvg from "~/assets/icons/nookphone/nav-browse.svg";
import editorSvg from "~/assets/icons/nookphone/nav-editor.svg";
import faqSvg from "~/assets/icons/nookphone/nav-faq.svg";
import changelogSvg from "~/assets/icons/nookphone/nav-changelog.svg";
import discordSvg from "~/assets/icons/nookphone/nav-discord.svg";

export default {
  name: "Home",
  data: function() {
    return {
      browseSvg,
      editorSvg,
      faqSvg,
      changelogSvg,
      discordSvg
    };
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
      this.$router.push({ path: `/updates` });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
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

.home--background {
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
  padding-bottom: 80px;
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
    padding-top: 200px;
    padding-bottom: 0px;
    grid-template-areas: "updates browse editor faq discord";
  }
  @include desktop {
  }
  @include desktop-hd {
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
  background-color: $ecru-white;
  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
  }
  @include desktop-hd {
    padding: 20px;
  }
}

.home--nav-icon-container {
  border-radius: 9999px;
  padding: 14px;
  background-color: $orange-white;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
  }
  @include desktop-hd {
    padding: 15px;
  }
}

.home--nav-icon {
  width: 140px;
  height: 140px;
  border-radius: 9999px;

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
    width: 120px;
    height: 120px;
  }
  @include desktop {
  }
  @include desktop-hd {
    width: 150px;
    height: 150px;
  }
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

  @include phone-landscape {
  }
  @include tablet-portrait {
  }
  @include tablet-landscape {
  }
  @include desktop {
  }
  @include desktop-hd {
  }
}
</style>
