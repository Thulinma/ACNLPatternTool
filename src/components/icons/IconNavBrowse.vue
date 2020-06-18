<template>
  <div class="icon--container">
    <svg
      id="Search_App_Icon"
      data-name="Search App Icon"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 1000 1000"
      role="presentation"
    >
      <defs>
        <clipPath id="clip-path" transform="translate(-0.42 -0.21)">
          <circle id="Background" class="cls-1" cx="464.58" cy="464.36" r="180.3" />
        </clipPath>
        <clipPath id="clip-path-2" transform="translate(-0.42 -0.21)">
          <path
            id="Hilt"
            class="cls-2"
            d="M790.42,850a59.6,59.6,0,0,1-42.25-17.5L577.87,662.15l84.5-84.5L832.67,748a59.75,59.75,0,0,1-42.25,102Z"
          />
        </clipPath>
      </defs>
      <g id="Inside_Magnifying_Glass" data-name="Inside Magnifying Glass">
        <circle
          id="Background-2"
          data-name="Background"
          :class="{
            'cls-1': !flip,
            'cls-3': flip
          }"
          cx="464.16"
          cy="464.16"
          r="180.3"
        />
        <g class="cls-4">
          <g id="Cat_Head_Group" data-name="Cat Head Group">
            <path
              id="Cat_Head"
              data-name="Cat Head"
              :class="{
                'cls-1': flip,
                'cls-3': !flip
              }"
              d="M414.7,381l-18.83,96.54A116.85,116.85,0,0,0,360,482.44l-43.92-88C278,567.58,274.8,566.85,278.25,592.28c6.65,48.84,61.23,71.7,123.57,63.22S510.66,610.43,504,561.58C500.56,536.16,497.72,537.7,414.7,381Z"
              transform="translate(-0.42 -0.21)"
            />
            <g id="Cat_Face_Group" data-name="Cat Face Group">
              <path
                id="Cat_Mouth"
                data-name="Cat Mouth"
                class="cls-5"
                d="M415.91,578.6c1.79,13.13-8.32,20-21.69,21.77s-24.93-2.06-26.71-15.19,6.89-30.51,20.25-32.33S414.13,565.48,415.91,578.6Z"
                transform="translate(-0.42 -0.21)"
              />
              <circle
                id="Cat_Eye_Right"
                data-name="Cat Eye Right"
                class="cls-5"
                cx="429.1"
                cy="531.33"
                r="14.65"
              />
              <circle
                id="Cat_Eye_Left"
                data-name="Cat Eye Left"
                class="cls-5"
                cx="341.6"
                cy="543.22"
                r="14.65"
              />
            </g>
          </g>
          <g id="Highlights_Group" data-name="Highlights Group">
            <path
              id="Long"
              class="cls-5"
              d="M554.05,422.85a30.71,30.71,0,0,1-24-11.52A83.5,83.5,0,0,0,464.54,380a30.78,30.78,0,1,1,0-61.55A144.78,144.78,0,0,1,578,372.82a30.78,30.78,0,0,1-24,50Z"
              transform="translate(-0.42 -0.21)"
            />
            <circle id="Short" class="cls-5" cx="578.69" cy="475.34" r="30.77" />
          </g>
        </g>
      </g>
      <g id="Magnifying_Glass" data-name="Magnifying Glass">
        <g id="Hilt_Group" data-name="Hilt Group">
          <path
            id="Hilt-2"
            data-name="Hilt"
            class="cls-2"
            d="M790.42,850a59.6,59.6,0,0,1-42.25-17.5L577.87,662.15l84.5-84.5L832.67,748a59.75,59.75,0,0,1-42.25,102Z"
            transform="translate(-0.42 -0.21)"
          />
          <g class="cls-6">
            <rect
              id="Grip"
              class="cls-7"
              x="597.26"
              y="581.55"
              width="186.1"
              height="217.09"
              transform="translate(-286.21 690.04) rotate(-45)"
            />
          </g>
        </g>
        <path
          id="Ring"
          class="cls-2"
          d="M464.58,284.06a180.3,180.3,0,1,1-127.49,52.81,179.13,179.13,0,0,1,127.49-52.81m0-73.85c-140.37,0-254.16,113.78-254.16,254.15S324.21,718.52,464.58,718.52,718.74,604.73,718.74,464.36,605,210.21,464.58,210.21Z"
          transform="translate(-0.42 -0.21)"
        />
      </g>
    </svg>
  </div>
</template>


<script>
export default {
  name: "IconNavBrowse",
  props: {
    flip: {
      type: Boolean,
      default: false
    }
  }
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
  fill: #5bbf98;
}
.cls-2 {
  fill: #4d3d36;
}
.cls-3 {
  fill: #83d8bb;
}
.cls-4 {
  clip-path: url(#clip-path);
}
.cls-5 {
  fill: #f7f4e5;
}
.cls-6 {
  clip-path: url(#clip-path-2);
}
.cls-7 {
  fill: #f8cc61;
}
</style>