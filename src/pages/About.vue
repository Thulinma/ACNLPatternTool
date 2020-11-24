<template>
  <div class="passports">
    <!-- todo add banner -->
    <!-- todo add navigation -->
    <div
      class="passport-wrapper"
      v-for="member in members"
      :key="members.indexOf(member)"
    >
      <h1>
        <hr />
        <span>PASSPORT</span>
        <hr />
      </h1>
      <Passport :member="member" />
    </div>
  </div>
</template>

<script>
import Passport from "~/components/partials/Passport.vue";

export default {
  components: {
    Passport,
  },
  data: function () {
    return {
      members: [
        {
          name: "Thulinma",
          greeting: "acpatterns.com!",
          title: "Computer Magician",
          island: "Thulopia",
          role: "",
          urls: [
            {
              name: "Personal Site",
              url: "https://thulinma.com",
            },
          ],
        },
        {
          name: "DamSenViet",
          role: "",
          greeting: "Sleeping atm.",
          title: "Sleeping Human",
          island: "Norende",
          urls: [
            {
              name: "Personal Site",
              url: "https://vietdaitran.com",
            },
          ],
          roles: ["Tool Developer"],
        },
        {
          name: "Myumi K.",
          role: "",
          greeting: "(๑•̀ㅂ•́)و",
          title: "Aggressive Birthday Girl",
          island: "Willowtale",
          urls: [
            {
              name: "GitHub",
              url: "https://github.com/myumi",
            },
          ],
          roles: ["Tool Developer"],
        },
        {
          name: "Tero",
          role: "",
          greeting: "Graphic design is my passion",
          title: "Easy-Breezy Designer",
          island: "Koron",
          urls: [
            {
              name: "Personal Site",
              url: "https://tero.space",
            },
          ],
        },
        {
          name: "MelonSpeedRuns",
          role: "",
          greeting: "Yahoo!!",
          title: "Fruit Person",
          island: "Fruita",
          urls: [
            {
              name: "Twitter",
              url: "https://twitter.com/MelonSpeedruns",
            },
          ],
        },
      ],
    };
  },
};
</script>

<style lang='scss' scoped>
@import "styles/colors";
@import "styles/screens";

.passports {
  padding: 50px 30px;
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-auto-rows: auto;
  grid-template-rows: auto;
  justify-content: center;
  justify-items: center;
  align-content: flex-start;
  align-items: flex-start;
  row-gap: 50px;

  h1 {
    justify-self: stretch;
    color: $donkey-brown;
    font-size: 1.25rem;
    text-transform: uppercase;
    margin: 0 0 20px;

    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-auto-columns: 1fr auto 1fr;
    grid-auto-rows: auto;
    grid-template-rows: auto;
    justify-content: center;
    justify-items: center;
    align-content: flex-start;
    align-items: center;
    column-gap: 10px;

    @include tablet-portrait {
      margin: 0 0 40px;
      column-gap: 30px;
      grid-template-columns: auto auto auto;
      grid-auto-columns: auto auto auto;
    }

    hr {
      justify-self: stretch;
      display: inline-block;
      border-radius: 2px;

      box-sizing: border-box;
      width: calc(100% - 20px);
      height: 3px;
      background-color: $bison-hide;

      @include tablet-portrait {
        width: 150px;
        height: 4px;
      }
    }
  }
}

.passport-wrapper {
  justify-self: stretch;

  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-auto-rows: auto;
  grid-template-rows: auto;
  justify-content: center;
  justify-items: center;
  align-content: flex-start;
  align-items: flex-start;
}
</style>