<template>
  <div class="icon--container">
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      role="presentation"
    >
      <path
        class="cls-2"
        d="M746.70019,740.85376c-44.8569,16.95386-96.61857-14.61249-136.662-63.47993a415.37625,415.37625,0,0,1-220.07655,0c-40.04342,48.86744-91.80509,80.43379-136.66146,63.47993-128.39056-48.553-125.91925-143.52336-90.873-275.63228,49.01935-184.79184,122.92709-226.01693,204.27155-206.16857,28.50989,6.95929,40.52032,20.49861,40.52032,20.49861a417.536,417.536,0,0,1,185.56171,0s12.011-13.53932,40.52085-20.49861c81.34393-19.84836,155.2522,21.37673,204.271,206.16857C872.61891,597.3304,875.09075,692.30072,746.70019,740.85376Z"
      />
      <ellipse class="cls-3" cx="390.41822" cy="531.76626" rx="59.24849" ry="63.75653" />
      <ellipse class="cls-3" cx="609.57884" cy="531.76626" rx="59.24849" ry="63.75653" />
      <path
        class="cls-4"
        d="M319.45851,648.54829C369.86516,675.13916,432.33689,690.879,500.00105,690.879s130.13589-15.729,180.5317-42.33075"
      />
    </svg>
  </div>
</template>

<script>
export default {
  name: "IconNavDiscord"
};
</script>


<style lang="scss" scoped>
@import "styles/positioning";
.icon--container {
  @include relative-in-place;
  display: inline-block;
  & svg {
    height: 100%;
    width: 100%;
  }
}

.cls-1 {
  fill: #b2bdfd;
}
.cls-2 {
  fill: #4d3d36;
}
.cls-3 {
  fill: #f7f4e5;
}
.cls-4 {
  fill: none;
  stroke: #8a9cf2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 41px;
}
</style>