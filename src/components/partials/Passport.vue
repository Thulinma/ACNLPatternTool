<template>
  <div class="passport">
    <section class="passport-photo">
      <div class="photo">
        <img>
      </div>
    </section><!-- photo and roles -->

    <section class="passport-info">
      <div class="greeting">{{normalizedMember.greeting}}</div><!-- greeting -->
      <ul>
        <li class="island">
          <IconBase 
            icon-name="island"
            icon-color="#4D993E"
            width="15"
            height="15"
          >
            <IconHouse />
          </IconBase>
          {{normalizedMember.island}}
        </li>
        <li class="title">{{normalizedMember.title}}</li>
        <li class="name">{{normalizedMember.name}}</li>
        <li class="urls">
          <IconBase 
            icon-name="contact card"
            icon-color="#E976DD"
            width="15"
            height="15"
          >
            <IconContactCard />
          </IconBase>
          <a 
            v-for="link in normalizedMember.urls" 
            :key="normalizedMember.urls.indexOf(link)"
            :href="link.url"
          >{{link.name}}</a>
        </li>
      </ul><!-- details -->
    </section><!-- info -->
  </div><!-- passport card container -->
</template>

<script>
import IconBase from '/components/icons/IconBase.vue';
import IconHouse from '/components/icons/IconHouse.vue';
import IconContactCard from '/components/icons/IconContactCard.vue';

export default {
  props: {
    member: {
      type: Object,
    }
  },
  // set defaults if attributes aren't set
  computed: {
    normalizedMember() {
    	return Object.assign({
        name: 'Tom Nook',
        greeting: 'Yes, yes!',
        title: 'Aspiring Millionarie',
        island: 'Nintentown',
        urls: [],
        roles: [],
			}, this.member);
    }
  },
  components: {
    IconBase,
    IconHouse,
    IconContactCard,
  }
}
</script>

<style lang="scss" scoped>
  $base-font-size: 18px;
  $cream: #F8F6E5;
  $pastel-pink: #F3E6DB;
  $mint-green: #E8F4D4;
  $white: #FFFFFF;

  .passport {
    background-color: $pastel-pink;
    // background-image: url('/assets/images/leaf-brush-pattern.svg');
    border-radius: 5px;
    display: flex;
    height: 240px;
    margin: 30px auto;
    max-width: 650px;
    padding: 20px 100px;
  }

  .passport-photo {
    align-self: center;
    width: 34%;

    .photo {
      background-color: $cream;
      border-radius: 14px;
      height: 180px;
      width: 180px;

      display: flex;
      align-items: center;
      justify-content: center;

      img {
        background-color: $mint-green;
        border-radius: 14px;
        padding: 5px;
        height: 150px;
        width: 150px;
      }
    }
  }

  .passport-info {
    font-size: $base-font-size;
    width: 66%;

    display: flex;
    align-items: flex-start;
    flex-direction: column;

    .greeting {
      background-color: $cream;
      border-radius: 14px;
      margin: 0 0 10px;
      padding: 12px;
    }
    ul {
      list-style: none;
      width: 300px;

      li {
        padding: 8px 0 8px 5px;
        border-bottom: 3px solid $cream;

        &.island {
          font-size: 0.7em;
        }
        &.title {
          font-size: 0.8em;
        }
        &.name {
          font-size: 1em;
        }
        &.urls {
          font-size: 0.7em;
        }
      }
    }
  }
</style>