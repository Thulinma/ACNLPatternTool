<template>
  <div class="home-nav-wrapper">
    <div class="home-nav">
      <div class="nav-item" v-bind:class="[item.id]" v-for="item in navItems" :key="item.name">
        <a href>
          <div class="nav-item-img">
            <img :src="item.image" />
          </div>
          <div class="nav-item-text">
            <p>{{ item.name }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import logoSvg from "/assets/images/ac_easel_opt.svg";
export default {
  name: "Home",
  data: function() {
    return {
      logoSvg,
      navItems: [
        {
          id: "updates",
          name: "Updates",
          image: "/assets/icons/nookphone/nav-changelog.svg"
        },
        {
          id: "browse",
          name: "Browse",
          image: "/assets/icons/nookphone/nav-browse.svg"
        },
        {
          id: "editor",
          name: "Editor",
          image: "/assets/icons/nookphone/nav-editor.svg"
        },
        {
          id: "faq",
          name: "FAQ",
          image: "/assets/icons/nookphone/nav-faq.svg"
        },
        {
          id: "discord",
          name: "Discord",
          image: "/assets/icons/nookphone/nav-discord.svg"
        }
      ]
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
@import "styles/colors.scss";
@import "styles/screens.scss";

$img-bg-color: #f7f4e7;

.home-nav-wrapper {
  .home-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;

    // for copy/pasting
    @include phone-landscape {
      flex-direction: row;
    }
    @include tablet-portrait {
    }
    @include tablet-landscape {
    }
    @include desktop {
    }
    @include desktop-hd {
    }

    .nav-item {
      // Home Nav Item spacing on tablet / mobile
      margin-bottom: 20px;
      @include phone-landscape {
        &.updates,
        &.discord {
          margin-top: 115px;
        }
      }
      &.faq,
      &.browse {
        margin-top: 15px;
      }

      &.updates {
        transform: rotate(-12deg);
      }

      &.browse {
        transform: rotate(-6deg);
      }

      &.faq {
        transform: rotate(6deg);
      }

      &.discord {
        transform: rotate(12deg);
      }
    }

    .nav-item a {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      color: #887c6a;

      &:hover {
        .nav-item-img img {
          background-color: darken(#e5e2d0, 3%);
        }

        .nav-item-text p {
          color: lighten(#85854a, 10%);
        }
      }

      .nav-item-img {
        background-color: $img-bg-color;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 100%;
        padding: 14px;
        z-index: 2;

        img {
          width: 150px;
          padding: 12px;
          border-radius: 100%;
          background-color: #e5e2d0;
        }
      }

      .nav-item-text {
        background-color: $img-bg-color;
        margin-top: -40px;
        font-size: 16pt;
        padding: 15px;
        border-radius: 49%;
        padding: 40px 60px 20px 60px;
        text-align: center;
      }
    }
  }
}
</style>
