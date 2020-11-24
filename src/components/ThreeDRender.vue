<template>
  <canvas
    class="three-d"
    v-show="model"
    ref="canvas3d"
    :width="width"
    :height="height"
  />
</template>

<script>
import DrawingTool from "~/libs/DrawingTool";
import ACNHFormat from "~/libs/ACNHFormat";
import { applyFilter } from "~/libs/xbrz";
import { toolToModelType, toolToModelPath } from "~/libs/Preview3D";

import {
  Scene,
  Texture,
  sRGBEncoding,
  NearestFilter,
  OrthographicCamera,
  Mesh,
  MeshStandardMaterial,
  MeshPhongMaterial,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  DoubleSide,
  TextureLoader,
  MixOperation,
} from "@three/core";
import { GLTFLoader } from "@three/loaders/GLTFLoader";
import { OrbitControls } from "@three/controls/OrbitControls";
import injected from "~/utils/injected";

const scale = 50;

const loader = new GLTFLoader();
const texLdr = new TextureLoader();

export default {
  name: "ThreeDRender",
  props: {
    drawingTool: DrawingTool,
    width: Number,
    height: Number,
  },
  data: function () {
    return {
      scene: new Scene(),
      camera: new OrthographicCamera(
        -this.width / scale,
        this.width / scale,
        this.height / scale,
        -this.height / scale,
        0.1,
        1000
      ),
      renderer: null,
      pixelCanvas: document.createElement("canvas"),
      renderCanvas: document.createElement("canvas"),
      texture: null,
      dirLight: false,
      model: false,
      stand: false,
      adjusting: false,
      rotating: false,
      hasAnimReq: false,
      loading: false,
      rotx: 0,
      roty: 0,
      rotstart: 0,
    };
  },
  methods: {
    loadModel(d) {
      //This prevents a race condition from happening when changing pattern while a model was still being loaded
      //We simply postpone the event by 100ms repeatedly until the previous load completed.
      if (this.loading) {
        setTimeout(this.loadModel, 100, d);
        return;
      }
      this.loading = true;
      //Remove old model from the scene
      if (this.model) {
        this.scene.remove(this.model);
        this.model = false;
      }
      //Get new model properties
      let modelType = toolToModelType(d);
      if (modelType > 2) {
        return;
      }
      let path = toolToModelPath(d);
      let modelOffset = { x: 0, y: -6, z: 0, rough: 1.5 };
      this.controls.maxZoom = 2.0;
      this.controls.minZoom = 0.8;
      this.camera.position.set(0, 20, 100);
      let stand = false;
      switch (modelType) {
        case 0: //easel style
          modelOffset.rough = 0.5;
          modelOffset.y = -7;
          this.controls.maxZoom = 2.0;
          this.controls.minZoom = 0.8;
          this.controls.zoom = 1.5;
          break;
        case 1: //clothing style
          this.controls.maxZoom = 4.0;
          this.controls.minZoom = 1.5;
          stand = true;
          break;
        case 2: //hat style
          modelOffset.y = -1;
          this.controls.maxZoom = 2.0;
          this.controls.minZoom = 0.8;
          break;
      }
      this.controls.update();
      this.$refs.canvas3d.dispatchEvent(
        new WheelEvent("wheel", { deltaY: 50 })
      );
      //Remove stand and re-add if it should be displayed
      this.scene.remove(this.stand);
      if (stand && this.stand) {
        this.scene.add(this.stand);
      }
      //Wipe the renderCanvas
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      this.mixImg = false;
      this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.texWidth;
      this.renderCanvas.height = this.renderCanvas.width =
        this.drawingTool.texWidth * 4;
      this.drawingTool.render();
      //The loader has an async callback. This is fine, as we don't run any other code after it.
      loader.load(injected.getObjectUrl(path["model.gltf"]), (gltf) => {
        if (this.model) {
          this.scene.remove(this.model);
        }
        this.model = gltf.scene.children[0];
        this.model.traverse((child) => {
          if (child instanceof Mesh) {
            //child.material = new MeshPhongMaterial();
            const meshName = child.name.split("__")[1];
            const redraw = () => {
              if (!this.hasAnimReq) {
                this.hasAnimReq = requestAnimationFrame(this.animate);
              }
            };
            if (path.hasOwnProperty(meshName + "_Nrm.png")) {
              child.material.normalMap = texLdr.load(
                injected.getObjectUrl(path[meshName + "_Nrm.png"]),
                redraw
              );
              child.material.normalMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName + "_Crv.png")) {
              child.material.lightMap = texLdr.load(
                injected.getObjectUrl(path[meshName + "_Crv.png"], redraw)
              );
              child.material.lightMap.flipY = false;
            }
            if (path.hasOwnProperty(meshName + "_OP.png")) {
              child.material.alphaMap = texLdr.load(
                injected.getObjectUrl(path[meshName + "_OP.png"], redraw)
              );
              child.material.alphaMap.flipY = false;
              child.material.transparent = true;
              child.material.alphaTest = 0.5;
            }
            if (path.hasOwnProperty(meshName + "_Mix.png")) {
              this.mixImg = new Image();
              this.mixImg.onload = () => {
                this.drawingTool.render();
                redraw();
              };
              this.mixImg.src = injected.getObjectUrl(
                path[meshName + "_Mix.png"]
              );
            }
            if (path.hasOwnProperty(meshName + "_Alb.png")) {
              child.material.map = texLdr.load(
                injected.getObjectUrl(path[meshName + "_Alb.png"], redraw)
              );
              child.material.map.flipY = false;
            }
            if (
              child.skeleton &&
              child.skeleton.bones &&
              child.skeleton.bones.length
            ) {
              for (let b in child.skeleton.bones) {
                if (child.skeleton.bones[b].name == "Arm_1_R") {
                  child.skeleton.bones[b].rotation.z += 0.75;
                }
                if (child.skeleton.bones[b].name == "Arm_1_L") {
                  child.skeleton.bones[b].rotation.z -= 0.75;
                }
              }
            }
            if (
              !child.material.map ||
              (child.material.map.image &&
                child.material.map.image.width == 1 &&
                child.material.map.image.height == 1)
            ) {
              child.material.map = this.texture;
            }
            child.material.side = DoubleSide;
            child.material.metalness = 0;
            child.material.shininess = 9;
            child.material.roughness = modelOffset.rough;
          }
        });
        this.model.position.x = modelOffset.x;
        this.model.position.y = modelOffset.y;
        this.model.position.z = modelOffset.z;
        this.scene.add(this.model);
        if (!this.hasAnimReq) {
          this.hasAnimReq = requestAnimationFrame(this.animate);
        }
        this.loading = false;
      }); //end of loader callback
    },
    animate() {
      this.controls.update();
      this.dirLight.position.set(
        this.camera.position.x + 2,
        this.camera.position.y + 1,
        this.camera.position.z + 4
      );
      this.dirLight.position.multiplyScalar(50);
      this.renderer.render(this.scene, this.camera);
      if (!this.rotating || !this.model) {
        this.hasAnimReq = false;
      } else {
        this.model.rotation.y += 0.01;
        this.hasAnimReq = requestAnimationFrame(this.animate);
      }
    },
  },
  mounted: function () {
    this.texture = new Texture(this.renderCanvas);
    this.texture.needsUpdate = true;
    this.texture.encoding = sRGBEncoding;
    this.texture.flipY = false;

    this.renderer = new WebGLRenderer({
      alpha: true,
      canvas: this.$refs.canvas3d,
      antialias: true,
    });
    this.renderer.outputEncoding = sRGBEncoding;
    this.renderer.setClearColor(0x000000, 0);
    this.pixelCanvas.height = this.pixelCanvas.width = this.drawingTool.texWidth;
    this.renderCanvas.height = this.renderCanvas.width =
      this.drawingTool.texWidth * 4;
    this.drawingTool.addCanvas(this.pixelCanvas, {
      texture: true,
      drawCallback: () => {
        applyFilter(this.pixelCanvas, this.renderCanvas);
        if (this.mixImg) {
          const ctx = this.renderCanvas.getContext("2d");
          ctx.globalAlpha = 0.75;
          ctx.drawImage(
            this.mixImg,
            0,
            0,
            this.renderCanvas.width,
            this.renderCanvas.height
          );
          ctx.globalAlpha = 1;
        }
        this.texture.needsUpdate = true;
        if (!this.hasAnimReq) {
          this.hasAnimReq = requestAnimationFrame(this.animate);
        }
      },
    });

    let renderContext = this.renderCanvas.getContext("2d");
    renderContext.fillStyle = "rgba(255,255,255,0)";
    renderContext.fillRect(0, 0, 32, 128);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.addEventListener("change", () => {
      if (!this.hasAnimReq) {
        this.hasAnimReq = requestAnimationFrame(this.animate);
      }
    });
    this.camera.position.set(0, 20, 100);
    this.controls.update();

    this.scene.add(new AmbientLight(0xffffff, 0.2));

    this.dirLight = new DirectionalLight(0xffffff, 0.8);
    this.scene.add(this.dirLight);

    this.hasAnimReq = requestAnimationFrame(this.animate);

    //If the type of pattern changes, change the model too
    this.loadModel(this.drawingTool);
    this.drawingTool.onLoad(this.loadModel);

    loader.parse(JSON.stringify(injected.clothing_stand), "", (gltf) => {
      this.stand = gltf.scene.children[0];
      this.stand.traverse((child) => {
        if (child instanceof Mesh) {
          child.material.side = DoubleSide;
          child.material.metalness = 0.3;
          child.material.roughness = 0.3;
        }
      });
      this.stand.position.y = -6;
    });
  },
};
</script>

<style lang="scss" scoped>
.three-d {
  outline: none;
  cursor: all-scroll;
}
</style>
