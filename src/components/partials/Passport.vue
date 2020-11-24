<template>
  <div class="passport">
    <section class="passport-photo">
      <div class="photo-frame">
        <div class="photo-container">
          <img class="photo" src="" alt="" />
        </div>
      </div>
    </section>
    <!-- photo and roles -->

    <section class="passport-info">
      <div class="greeting">{{ normalizedMember.greeting }}</div>
      <!-- greeting -->
      <ul>
        <li class="island">
          <IconBase
            class="icon-island"
            icon-name="island"
            icon-color="#4D993E"
            width="20"
            height="20"
          >
            <IconHouse />
          </IconBase>
          <span>{{ normalizedMember.island }}</span>
        </li>
        <li class="title">
          <span>{{ normalizedMember.title }}</span>
        </li>
        <li class="name">
          <span>{{ normalizedMember.name }}</span>
        </li>
        <li class="urls">
          <IconBase
            class="icon-contact-card"
            icon-name="contact card"
            icon-color="#E976DD"
            width="25"
            height="25"
          >
            <IconContactCard />
          </IconBase>
          <a
            v-for="link in normalizedMember.urls"
            :key="normalizedMember.urls.indexOf(link)"
            :href="link.url"
            >{{ link.name }}</a
          >
        </li>
      </ul>
      <!-- details -->
    </section>
    <!-- info -->
  </div>
  <!-- passport card container -->
</template>

<script>
import IconBase from "~/components/icons/IconBase.vue";
import IconHouse from "~/components/icons/IconHouse.vue";
import IconContactCard from "~/components/icons/IconContactCard.vue";

export default {
  props: {
    member: {
      type: Object,
    },
  },
  // set defaults if attributes aren't set
  computed: {
    normalizedMember() {
      return Object.assign(
        {
          name: "Tom Nook",
          greeting: "Yes, yes!",
          title: "Aspiring Millionarie",
          island: "Nintentown",
          urls: [],
          roles: [],
        },
        this.member
      );
    },
  },
  components: {
    IconBase,
    IconHouse,
    IconContactCard,
  },
};
</script>

<style lang="scss" scoped>
@import "styles/colors";
@import "styles/positioning";
@import "styles/screens";

.passport {
  @include relative-in-place;
  justify-self: stretch;

  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-auto-rows: auto;
  grid-template-rows: auto;
  row-gap: 30px;
  padding: 30px 25px 50px 25px;

  justify-content: center;
  justify-items: flex-start;

  border-radius: 8px;
  background-color: $soapstone;

  & ~ & {
    margin-top: 40px;
  }

  &:before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.15;
    background-image: url("../../assets/images/Four_Leaves_Pattern_BW.svg");
    background-size: 120px;
    background-repeat: repeat;
  }

  @include tablet-portrait {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-columns: auto 1fr;
    grid-auto-rows: auto;
    grid-template-rows: auto;
    align-content: center;
    align-items: center;
    row-gap: 0px;
    column-gap: 50px;
    padding: 30px 50px 50px 50px;
  }

  @include tablet-landscape {
    column-gap: 80px;
    padding: 30px 80px 50px 80px;
    max-width: 950px;
    justify-self: center;
  }

  @include desktop {
    max-width: 1150px;
    column-gap: 100px;
    padding: 50px 100px 80px 100px;
  }
}

.passport-photo {
  @include relative-in-place;
  justify-self: center;

  .photo-frame {
    border-radius: 14px;
    padding: 10px;
    background-color: $ecru-white;

    @include desktop {
      border-radius: 18px;
      padding: 13px;
    }

    .photo-container {
      background-color: $chrome-white;
      border-radius: 8px;
      @include desktop {
        border-radius: 12px;
      }

      .photo {
        height: 150px;
        width: 150px;

        &[src=""] {
          visibility: hidden;
        }

        @include phone-landscape {
          height: 200px;
          width: 200px;
        }

        @include desktop {
          height: 250px;
          width: 250px;
        }
      }
    }
  }
}

.passport-info {
  @include relative-in-place;
  justify-self: stretch;

  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  font-size: 1.2rem;

  @include tablet-landscape {
    width: 500px;
  }

  .greeting {
    color: $olive-haze;
    justify-self: flex-start;
    background-color: $ecru-white;
    border-radius: 14px;
    margin: 0 0 10px;
    padding: 12px 20px;

    font-size: 1.1rem;
    font-weight: 600;
  }

  ul {
    list-style: none;
    font-weight: 600;

    li {
      padding: 15px 0 15px 5px;
      border-bottom: 3px solid $ecru-white;

      a,
      span,
      .icon-contact-card {
        vertical-align: middle;
      }

      &:nth-last-child(1) {
        border-bottom: 0px solid $white;
      }

      &.island {
        font-size: 0.9em;
        color: $olive-haze;
      }
      &.title {
        font-size: 0.9em;
        color: $jambalaya;
      }
      &.name {
        font-size: 0.9em;
        color: $jambalaya;
      }
      &.urls {
        font-size: 0.85em;
        color: $olive-haze;
      }
    }
  }
}
</style>