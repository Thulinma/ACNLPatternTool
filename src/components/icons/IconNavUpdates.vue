<template>
  <div class="icon--container">
    <svg
      id="Log_App_Icon"
      data-name="Log App Icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      role="presentation"
    >
      <g id="Bark_Group" data-name="Bark Group">
        <circle id="Foreground" class="cls-2" cx="604.4" cy="395.6" r="185.6" />
        <rect
          id="Rectangle"
          class="cls-2"
          x="313.97"
          y="352.01"
          width="371.2"
          height="295.29"
          transform="translate(500.06 -206.56) rotate(45)"
        />
        <circle
          id="Background_Circle"
          data-name="Background Circle"
          class="cls-2"
          cx="395.6"
          cy="604.4"
          r="185.6"
        />
        <path
          id="Branch_Stump"
          data-name="Branch Stump"
          class="cls-2"
          d="M503.25,291.58l-53.58-64.45q-.33-.39-.69-.78a40.29,40.29,0,0,0-46-9.15L370,231.91l-.1.05a40.52,40.52,0,0,0-20.42,52.47l29.68,70.37a40.24,40.24,0,0,0,50.9,22l57.11-20.18.23-.09a40.3,40.3,0,0,0,15.82-64.94Z"
          transform="translate(0.43 0.35)"
        />
      </g>
      <g id="Clock">
        <circle class="cls-3" cx="395.6" cy="604.4" r="122.68" />
        <path
          id="Short"
          class="cls-2"
          d="M430.62,660.13a20.6,20.6,0,0,1-14.58-6l-35.45-35.45a20.62,20.62,0,0,1,29.16-29.17l35.45,35.45a20.63,20.63,0,0,1-14.58,35.21Z"
          transform="translate(0.43 0.35)"
        />
        <path
          id="Long"
          class="cls-2"
          d="M395.17,624.68a20.63,20.63,0,0,1-20.62-20.63V518.69a20.62,20.62,0,1,1,41.24,0v85.36A20.63,20.63,0,0,1,395.17,624.68Z"
          transform="translate(0.43 0.35)"
        />
      </g>
      <g id="Highlights_Group" data-name="Highlights Group">
        <path
          id="Long-2"
          data-name="Long"
          class="cls-4"
          d="M611.24,562.92a20.62,20.62,0,0,1-14.58-35.2l62.53-62.54a20.63,20.63,0,1,1,29.17,29.17l-62.53,62.53A20.56,20.56,0,0,1,611.24,562.92Z"
          transform="translate(0.43 0.35)"
        />
        <path
          id="Medium"
          class="cls-4"
          d="M611.79,458.39a20.62,20.62,0,0,1-14.58-35.2l26-26a20.62,20.62,0,1,1,29.17,29.16l-26,26A20.56,20.56,0,0,1,611.79,458.39Z"
          transform="translate(0.43 0.35)"
        />
        <circle id="Short-2" data-name="Short" class="cls-4" cx="680.29" cy="370.05" r="20.62" />
      </g>
    </svg>
  </div>
</template>


<script>
export default {
  name: "IconNavUpdates"
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
  fill: #e49366;
}
.cls-2 {
  fill: #4d3d36;
}
.cls-3 {
  fill: #f7f4e5;
}
.cls-4 {
  fill: #f8cc61;
}
</style>