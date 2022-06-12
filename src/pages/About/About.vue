<template>
  <div class="page">
    <div class="background"></div>
    <div class="passports">
      <!-- todo add banner -->
      <!-- todo add navigation -->
      <Passport
        v-for="member in members"
        :key="member.name"
        :headerTextColor="member.headerTextColor"
        :accentColor="member.accentColor"
        :photo="member.photo"
        :name="member.name"
        :greeting="member.greeting"
        :title="member.title"
        :role="member.role"
        :roleIcon="member.roleIcon"
        :topInfoItems="member.topInfoItems"
        :bottomInfoItems="member.bottomInfoItems"
        :bottomLeftText="member.bottomLeftText"
      />
    </div>
  </div>
</template>

<script>
import Passport from "./Passport.vue";
import photoViet from "@/assets/images/char/photo_viet.jpg";

export default {
  components: {
    Passport,
  },
  data: function () {
    return {
      members: [
        {
          headerTextColor: "#91a28a",
          accentColor: "#e6eccf",
          name: "Thulinma",
          greeting: "acpatterns.com!",
          title: "Computer Magician",
          role: "Tool Developer",
          roleIcon: "mdi-wrench",
          topInfoItems: [
            {
              icon: "mdi-island",
              iconFill: "#318746",
              label: "Thulopia",
            }
          ],
          bottomInfoItems: [
            {
              icon: "mdi-account",
              iconFill: "#66afb8",
              label: "Portfolio",
              url: "https://thulinma.com",
            },
          ],
        },
        {
          headerTextColor: "#838486",
          accentColor: "#d7d7d7",
          photo: photoViet,
          name: "DamSenViet",
          role: "Tool Developer",
          roleIcon: "mdi-wrench",
          greeting: "Sleeping atm.",
          title: "Sleeping Human",
          topInfoItems: [
            {
              icon: "mdi-island",
              iconFill: "#318746",
              label: "Norende",
            }
          ],
          bottomInfoItems: [
            {
              icon: "mdi-account",
              iconFill: "#66afb8",
              label: "Portfolio",
              url: "https://vietdaitran.com",
            },
          ],
        },
        {
          headerTextColor: "#9fa8a7",
          accentColor: "#dfebd5",
          name: "Myumi K.",
          role: "Tool Developer",
          roleIcon: "mdi-wrench",
          greeting: "(๑•̀ㅂ•́)و",
          title: "Aggressive Birthday Girl",
          topInfoItems: [
            {
              icon: "mdi-island",
              iconFill: "#318746",
              label: "Willowtale",
            }
          ],
          bottomInfoItems: [
            {
              icon: "mdi-github",
              iconFill: "#000000",
              label: "GitHub",
              url: "https://github.com/myumi",
            },
          ],
        },
        {
          headerTextColor: "#a09d7e",
          accentColor: "#fbeec1",
          name: "Tero",
          role: "Icon Designer",
          roleIcon: "mdi-brush",
          greeting: "Graphic design is my passion",
          title: "Easy-Breezy Designer",
          topInfoItems: [
            {
              icon: "mdi-island",
              iconFill: "#318746",
              label: "Koron",
            },
          ],
          bottomInfoItems: [
            {
              icon: "mdi-account",
              iconFill: "#66afb8",
              label: "Portfolio",
              url: "https://tero.space",
            },
          ],
        },
        {
          headerTextColor: "#b59e8e",
          accentColor: "#f7e7d6",
          name: "MelonSpeedRuns",
          greeting: "Yahoo!!",
          role: "Data Miner",
          roleIcon: "mdi-pickaxe",
          title: "Fruit Person",
          topInfoItems: [
            {
              icon: "mdi-island",
              iconFill: "#318746",
              label: "Fruita",
            },
          ],
          bottomInfoItems: [
            {
              icon: "mdi-twitter",
              iconFill: "#1da1f2",
              label: "Twitter",
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
@use "styles/colors" as colors;
@use "styles/screens" as screens;

.page {
  position: relative;
  background-color: colors.$soapstone;
  height: 100%;
  width: 100%;
  padding: 50px 30px;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/images/Leaf_Brush_Pattern_Tile.svg");
  background-repeat: repeat;
  background-size: 500px 500px;
  opacity: 0.15;
}


.passports {
  position: relative;
  display: grid;
  row-gap: 50px;
  
  @include screens.tablet-landscape {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    column-gap: 50px;
  }
}

</style>