<template>
  <div class="icon--container">
    <svg
      id="FAQ_App_Icon"
      data-name="FAQ App Icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      role="presentation"
    >
      <g id="Speech_Bubble_Group" data-name="Speech Bubble Group">
        <path
          id="Triangle"
          class="cls-2"
          d="M617.77,649.56a35.07,35.07,0,0,0-31.12-18.9H412.49a35.06,35.06,0,0,0-28.69,55.23l87.08,123.92a35.07,35.07,0,0,0,57.39,0l87.08-123.92A35.07,35.07,0,0,0,617.77,649.56Z"
          transform="translate(0.43 0.35)"
        />
        <ellipse
          id="Speech_Bubble"
          data-name="Speech Bubble"
          class="cls-2"
          cx="500"
          cy="475.26"
          rx="308.78"
          ry="265.26"
        />
      </g>
      <g id="Questionmark_Group" data-name="Questionmark Group">
        <circle id="Dot" class="cls-3" cx="498.82" cy="655.21" r="35.85" />
        <path
          id="Curve"
          class="cls-3"
          d="M498.4,598.24a35.85,35.85,0,0,1-35.85-35.85,99.28,99.28,0,0,1,56.83-89.56,49.58,49.58,0,0,0,28.47-46c-.61-26-22.25-47.63-48.24-48.24A49.47,49.47,0,0,0,448.93,428a35.85,35.85,0,0,1-71.7,0A121.17,121.17,0,1,1,549.85,537.74a27.29,27.29,0,0,0-15.6,24.65A35.85,35.85,0,0,1,498.4,598.24Z"
          transform="translate(0.43 0.35)"
        />
      </g>
    </svg>
  </div>
</template>

<script>
export default {
  name: "IconNavFaq"
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
  fill: #f8cc61;
}
.cls-2 {
  fill: #f7f4e5;
}
.cls-3 {
  fill: #4d3d36;
}
</style>