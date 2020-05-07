<template>
   <div id='passports'>
      <!-- todo add banner -->
      <!-- todo add navigation -->
      <h1>
         <hr/>
         PASSPORTS
         <hr/>
      </h1>
      <Passport 
         v-for='member in members'
         :key='members.indexOf(member)'
         :member='member'
      />
   </div>
</template>

<script>
import Passport from '/components/Passport.vue';

export default {
  components: {
     Passport,
  },
  data: function() {
     return {
      members: [
         {
            name: 'Thulinma',
            greeting: 'acpatterns.com!',
            title: 'Computer Magician',
            island: 'Thulopia',
            urls: [
               {
                  name: 'Personal Site',
                  url: 'https://thulinma.com',
               },
            ],
         },
         {
            name: 'DamSenViet',
            greeting: 'Sleeping atm.',
            title: 'Sleeping Human',
            island: 'Norende',
            urls: [
               {
                  name: 'Personal Site',
                  url: 'https://vietdaitran.com',
               },
            ],
            roles: [
               'Tool Developer',
            ]
         },
         {
            name: 'Myumi K.',
            greeting: '(๑•̀ㅂ•́)و',
            title: 'Aggressive Birthday Girl',
            island: 'Willowtale',
            urls: [
               {
                  name: 'GitHub',
                  url: 'https://github.com/myumi',
               },
            ],
            roles: [
               'Tool Developer',
            ]
         },
         {
            name: 'Tero',
            greeting: 'Graphic design is my passion',
            title: 'Easy-Breezy Designer',
            island: 'Koron',
            urls: [
               {
                  name: 'Personal Site',
                  url: 'https://tero.space',
               },
            ],
         }
      ],
     };
  }, 
}
</script>

<style lang='scss' scoped>
$brown: #AE9E85;
   #passports {
      padding: 10px 30px;

      h1 {
         color: $brown;
         font-size: 18px;
         margin: 0 0 15px;
         text-transform: uppercase;

         display: flex;
         align-items: center;
         justify-content: center;

         hr {
            border-top: solid 2px $brown;
            border-radius: 8px;
            display: inline-block;
            width: 100px;
            margin: 0 30px;
         }
      }
   }
</style>