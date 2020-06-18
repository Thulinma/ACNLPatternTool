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
        d="M365.85376,1000H634.14624c119.9773,0,226.46582-57.75195,293.18311-146.97314C817.42847,746.75586,667.75562,681.35938,502.803,681.35938c-166.57227,0-317.56592,66.68457-427.75464,174.80761C141.9021,943.59961,247.29053,1000,365.85376,1000Z"
      />
      <path
        class="cls-3"
        d="M831.37991,510.04878H741.98V706.25036a87.66855,87.66855,0,0,1-87.66854,87.66854H351.3087a87.66854,87.66854,0,0,1-87.66854-87.66854V510.04878h-95.02L500,175.87886Z"
      />
      <rect
        class="cls-4"
        x="408.92887"
        y="510.04878"
        width="187.74833"
        height="182.35325"
        rx="28.7019"
      />
      <path
        class="cls-3"
        d="M625.3791,222.1236h52.38028a28.7019,28.7019,0,0,1,28.7019,28.7019V510.044a0,0,0,0,1,0,0H596.6772a0,0,0,0,1,0,0V250.8255A28.7019,28.7019,0,0,1,625.3791,222.1236Z"
      />
    </svg>
  </div>
</template>


<script>
export default {
  name: "IconNavHome"
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

.cls-2 {
  fill: #f8cc61;
}
.cls-3 {
  fill: #4d3d36;
}
.cls-4 {
  fill: #f7f4e5;
}
</style>