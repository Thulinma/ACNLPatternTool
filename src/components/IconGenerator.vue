<template>
  <canvas ref="iCanvas" @click="pattClick" :width="width" :height="height" />
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";
import { drawPreviewFromTool } from "~/libs/Preview3D";

export default {
  name: "IconGenerator",
  props: ["pattern", "decoration", "text", "width", "height"],
  watch: {
    //Whenever pattern changes, draw it!
    pattern(newData, oldData) {
      this.draw(newdata);
    },
  },
  mounted: async function () {
    await this.draw(this.pattern);
  },
  methods: {
    pattClick() {
      this.$emit("pattclick", this.pattern);
    },
    async draw(newData) {
      const width = this.$refs.iCanvas.width;
      const height = this.$refs.iCanvas.height;
      //Load pattern, prepare render canvas
      let d;
      if (newData instanceof DrawingTool) {
        d = newData;
      } else {
        d = new DrawingTool(newData);
      }

      //Ensure blitted images are not smoothed ( = keep pixel look!)
      let ctx = this.$refs.iCanvas.getContext("2d");

      if (this.decoration) {
        //Create pretty background pattern on temp canvas
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = 45;
        bgCanvas.height = 45;
        const bgCtx = bgCanvas.getContext("2d");
        bgCtx.fillStyle = "#FFFFFF";
        bgCtx.fillRect(0, 0, 45, 45);
        bgCtx.fillStyle = "#9b9b9b44";
        bgCtx.rotate(Math.PI / 4);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(32, -80, 16, 160);
        bgCtx.rotate(-Math.PI / 2);
        bgCtx.fillRect(0, -80, 16, 160);
        bgCtx.fillRect(-32, -80, 16, 160);
        //Copy background to main canvas
        ctx.fillStyle = ctx.createPattern(bgCanvas, "repeat");
        ctx.fillRect(0, 0, width, height);
      }

      //Draw pattern preview itself
      await drawPreviewFromTool(
        ctx,
        d,
        0,
        this.text ? 20 : 0,
        width,
        this.text ? height - 20 : height
      );

      if (this.text) {
        //Prepare background pattern for text
        bgCanvas.width = 1;
        bgCanvas.height = 2;
        bgCtx.fillStyle = "#585858";
        bgCtx.fillRect(0, 0, 1, 1);
        bgCtx.fillStyle = "#3e3e3e";
        bgCtx.fillRect(0, 1, 1, 1);
        const txtBg = ctx.createPattern(bgCanvas, "repeat");

        const drawTxtWithBg = (x, y, txt, fore) => {
          const txtProps = ctx.measureText(txt);
          var h =
            (txtProps.fontBoundingBoxAscent
              ? txtProps.fontBoundingBoxAscent
              : txtProps.actualBoundingBoxAscent) +
            (txtProps.fontBoundingBoxDescent
              ? txtProps.fontBoundingBoxDescent
              : txtProps.actualBoundingBoxDescent) +
            4;
          var w = txtProps.width - h / 2;
          ctx.fillStyle = txtBg;
          ctx.strokeStyle = fore;
          //Calculate background
          ctx.beginPath();
          ctx.arc(x - w / 2, y, h / 2, 0.5 * Math.PI, 1.5 * Math.PI);
          ctx.lineTo(x + w / 2, y - h / 2);
          ctx.arc(x + w / 2, y, h / 2, 1.5 * Math.PI, 0.5 * Math.PI);
          ctx.lineTo(x + -w / 2, y + h / 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#00000088";
          ctx.strokeStyle = "#00000088";
          ctx.fillText(txt, x + 2, y + 2);
          ctx.fillStyle = fore;
          ctx.strokeStyle = fore;
          ctx.fillText(txt, x, y);
        };

        //Write text
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        ctx.font = "10pt Calibri";
        drawTxtWithBg(width / 2, 10, d.title, "#FFFFFF");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
canvas {
  margin: 10px;
  display: inline-block;
}
</style>
