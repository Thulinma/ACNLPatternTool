<template>
  <div class="passport-wrapper">
    <div class="passport-bg"></div>
    <h1 class="passport-header">
      <hr
        class="passport-header-decor"
        :style="{ 'background-color': headerTextColor }"
      />
      <span class="passport-header-text" :style="{ color: headerTextColor }">
        PASSPORT
      </span>
      <hr
        class="passport-header-decor"
        :style="{ 'background-color': headerTextColor }"
      />
    </h1>
    <div class="passport" :style="{ 'background-color': accentColor }">
      <section class="passport-photo">
        <div class="photo-frame">
          <div
            class="photo-container"
            :style="{ 'background-color': accentColor }"
          >
            <img class="photo" :src="photo" />
          </div>
        </div>
        <div class="character-role-outer-line">
          <div class="character-role-inner-line">
            <span class="character-role-icon-container">
              <VIcon v-if="roleIcon" small :color="colors.ecruWhite">
                {{ roleIcon }}
              </VIcon>
            </span>
            <span class="character-role"> {{ role }}</span>
          </div>
        </div>
      </section>
      <section class="passport-info">
        <div class="greeting">{{ greeting }}</div>
        <div>
          <div class="top-info-items">
            <ul class="top-info-items-list">
              <InfoItem
                v-for="infoItem in topInfoItems"
                :key="infoItem.label"
                :infoItem="infoItem"
              />
            </ul>
          </div>
          <hr class="passport-info-divider" />
          <div class="character-title">
            <span>{{ title }}</span>
          </div>
          <hr class="passport-info-divider" />
          <div class="character-name">
            <span>{{ name }}</span>
          </div>
          <hr class="passport-info-divider" />
          <div class="bottom-info-items">
            <ul class="bottom-info-items-list">
              <InfoItem
                v-for="infoItem in bottomInfoItems"
                :key="infoItem.label"
                :infoItem="infoItem"
              />
            </ul>
          </div>
        </div>
      </section>
    </div>
    <div class="passport-footer">
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { VIcon } from "vuetify/lib";
import { InfoItemOptions } from "./About.vue";
import InfoItem from "./InfoItem.vue";
import colors from "@/styles/colors.scss";

@Component({
  components: {
    VIcon,
    InfoItem,
  },
})
export default class Passport extends Vue {
  @Prop({
    type: String,
    default: () => "#91a28a",
  }) headerTextColor!: string;
  
  @Prop({
    type: String,
    default: () => "#e6eccf",
  }) accentColor!: string;
  
  @Prop({
    type: String,
    default: () => "",
  }) photo!: string;
  
  @Prop({
    type: String,
    default: () => "Tom Nook",
  }) name!: string;
  
  @Prop({
    type: String,
    default: () => "...",
  }) greeting!: string;
  
  @Prop({
    type: String,
    default: () => "Aspiring Millionaire",
  }) title!: string;
  
  @Prop({
    type: String,
    default: () => "Snake oil salesman",
  }) role!: string;
  
  @Prop({
    type: String,
    default: () => "mdi-wrench",
  }) roleIcon!: string;
  
  @Prop({
    type: Array,
    default: () => [],
  }) topInfoItems!: InfoItemOptions[];
  
  @Prop({
    type: Array,
    default: () => [],
  }) bottomInfoItems!: InfoItemOptions[];
  
  @Prop({
    type: String,
    default: () => "",
  }) bottomLeftText!: string;
  
  readonly colors = colors;
};
</script>

<style lang="scss" scoped>
@use "styles/colors" as colors;
@use "styles/positioning" as positioning;
@use "styles/screens" as screens;

$border-color: #e5dac7;

.passport-wrapper {
  display: grid;
  overflow: hidden;
  min-width: 300px;
  padding: 8px 10px 0px 10px;
  border-bottom: #e5dac7 inset 10px;
  background-color: colors.$ecru-white;
  border-radius: 50px;

  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-content: center;
  align-content: flex-start;
}

.passport-header {
  position: relative;
  justify-self: stretch;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  margin: 10px 0 10px 0px;

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

  @include screens.tablet-portrait {
    font-size: 1.2rem;
    column-gap: 30px;
    grid-template-columns: auto auto auto;
    grid-auto-columns: auto auto auto;
  }
}

.passport-header-decor {
  border: 0px transparent none;
  display: inline-block;
  border-radius: 2px;

  box-sizing: border-box;
  width: 30%;
  height: 3px;

  @include screens.tablet-portrait {
    width: 150px;
    height: 3px;
  }
}

.passport {
  @include positioning.relative-in-place;
  justify-self: stretch;

  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-auto-rows: auto;
  grid-template-rows: auto;
  row-gap: 30px;
  padding: 20px 25px 20px 25px;

  justify-content: center;
  justify-items: flex-start;

  border-radius: 3px;

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
    background-size: 80px;
    background-repeat: repeat;
  }

  @include screens.tablet-portrait {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-auto-columns: auto 1fr;
    grid-auto-rows: auto;
    grid-template-rows: auto;
    align-content: center;
    align-items: center;
    row-gap: 0px;
    column-gap: 40px;
    padding: 30px 50px 30px 50px;
  }

  @include screens.tablet-landscape {
    column-gap: 50px;
    padding: 30px 80px 30px 80px;
    justify-self: center;
  }

  @include screens.desktop {
    width: 100%;
    column-gap: 70px;
    padding: 30px 50px 30px 50px;
  }
}

.passport-photo {
  @include positioning.relative-in-place;
  justify-self: center;

  .photo-frame {
    border-radius: 25% 25% 25% 25% / 22.5% 22.5% 22.5% 22.5%;
    padding: 12px;
    background-color: colors.$ecru-white;
    width: 150px;
    height: 150px;
    box-sizing: content-box;

    @include screens.phone-landscape {
      height: 200px;
      width: 200px;
    }

    @include screens.desktop {
      height: 200px;
      width: 200px;
    }
    
    &:before {
      display: block;
      content: "";
      padding-bottom: 100%;
    }

    .photo-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      display: block;
      height: calc(100% - 24px);
      width: calc(100% - 24px);
      
      overflow: hidden;
      background-color: colors.$chrome-white;
      border-radius: 22.5% 22.5% 22.5% 22.5% / 22.5% 22.5% 22.5% 22.5%;
      
      .photo {
        width: 100%;
        height: 100%;

        &[src=""] {
          visibility: hidden;
        }
      }
    }
  }

  .character-role-outer-line,
  .character-role-inner-line {
    border-style: solid;
    border-color: colors.$olive-haze;
    border-radius: 10px;
  }

  .character-role-outer-line {
    position: absolute;
    bottom: -20px;
    transform: translate(0px, 20px) rotate(5deg);
    border-width: 2px;
    border-radius: 12px;
    padding: 2px;
    @include screens.tablet-portrait {
      transform: translate(0px, 30px) rotate(5deg);
    }
  }
  .character-role-inner-line {
    border-width: 0.7px;
    border-radius: 10px;
    padding: 5px;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 5px;
    justify-content: center;
    align-items: center;

    @include screens.tablet-portrait {
      padding: 10px;
    }
  }

  .character-role-icon-container {
    background-color: colors.$olive-haze;
    border-radius: 3px;
    width: 25px;
    height: 25px;
    display: grid;
    justify-content: center;
    align-items: center;
  }

  .character-role {
    color: colors.$olive-haze;
    font-size: 0.8rem;
    @include screens.tablet-portrait {
      font-size: 1.1rem;
    }
  }
}

.passport-info {
  @include positioning.relative-in-place;
  align-self: flex-start;
  justify-self: stretch;

  margin-top: 15px;
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-columns: 1fr;
  grid-template-rows: auto;
  grid-auto-rows: auto;
  font-size: 1rem;
  font-weight: 600;

  color: colors.$jambalaya;
  @include screens.tablet-portrait {
    font-size: 1.1rem;
    font-weight: 700;
  }
  @include screens.tablet-landscape {
    width: 500px;
    font-size: 1.3rem;
    letter-spacing: 0.2px;
  }
}

.passport-info-divider {
  margin-top: 10px;
  margin-bottom: 10px;
  height: 2px;
  border: none;
  background-color: colors.$ecru-white;
}

.character-name {
  @include screens.tablet-portrait {
    font-size: 1.3rem;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  @include screens.tablet-landscape {
    font-size: 1.5rem;
  }
}

.greeting {
  position: relative;
  color: colors.$olive-haze;
  justify-self: flex-start;
  background-color: colors.$ecru-white;
  border-radius: 14px;
  margin: 0px 0px 20px -5px;
  padding: 12px 20px;
  z-index: 1;

  font-size: 1.1rem;
  font-weight: 600;

  &:before {
    display: none;
    content: "";
    position: absolute;
    width: 0px;
    height: 0px;
    border-left: 20px solid colors.$ecru-white;
    border-right: 20px solid transparent;
    border-top: 20px solid colors.$ecru-white;
    border-bottom: 20px solid transparent;
    z-index: -1;
    border-radius: 5px;
    left: 5px;
    bottom: -20px;
    transform: rotate(20deg);

    @include screens.tablet-portrait {
      display: block;
    }
  }

  @include screens.tablet-portrait {
    margin: -20px 0px 20px -30px;
    font-size: 1.3rem;
  }
}

.top-info-items ul,
.bottom-info-items ul {
  display: flex;
  list-style: none;
  padding: 0px;
}

.top-info-items {
  margin-bottom: 12px;
}
.bottom-info-items {
  margin-top: 18px;
}

.character-title {
  margin-top: 18px;
  margin-bottom: 14px;
}

.top-info-items ul li:nth-child(2) ~ li,
.bottom-info-items ul {
  color: colors.$donkey-brown;
}


.passport-footer {
  height: 50px;
  
  @include screens.tablet-portrait {
    height: 100px;
  }
}
</style>