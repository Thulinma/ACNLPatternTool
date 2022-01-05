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
import DrawingTool from "@/libs/DrawingTool";
import { applyFilter } from "@/libs/xbrz";
import { toolToModelType, toolToModelUrlData } from "@/libs/Preview3D";

import {
  Scene,
  Texture,
  sRGBEncoding,
  OrthographicCamera,
  Mesh,
  WebGLRenderer,
  DirectionalLight,
  AmbientLight,
  DoubleSide,
  TextureLoader,
} from "three";
import { GLTFLoader } from "@three/loaders/GLTFLoader";
import { OrbitControls } from "@three/controls/OrbitControls";
import { clothingStand } from "@/models";

const scale = 50;

const gltfLoader = new GLTFLoader();
const textureLoader = new TextureLoader();

export default {
  name: "ThreeDRender",
  props: {
    drawingTool: DrawingTool,
    width: Number,
    height: Number,
  },
  data: function () {
    const pixelCanvas = document.createElement("canvas");
    const renderCanvas = document.createElement("canvas");
    return {
      
      pixelCanvas,
      renderCanvas,
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
      texture: null,
      dirLight: false,
      model: null,
      stand: null,
      adjusting: false,
      rotating: false,
      hasAnimReq: false,
      loading: false,
      controls: null,
      mixImg: null,
    };
  },
  methods: {
    cleanUp() {
      if (this.model) this.scene.remove(this.model);
        this.model = null;
      if (this.texture);
        this.texture = null;
      if (this.stand) this.scene.remove(this.stand);
    },
    setupTexture() {
      this.texture = new Texture(this.renderCanvas);
      this.texture.needsUpdate = true;
      this.texture.encoding = sRGBEncoding;
      this.texture.flipY = false;
    },
    async loadModel(d = this.drawingTool) {
      //This prevents a race condition from happening when changing pattern while a model was still being loaded
      //We simply postpone the event by 100ms repeatedly until the previous load completed.
      if (this.loading) {
        setTimeout(this.loadModel, 100, d);
        return;
      }
      this.loading = true;
      //Remove old model from the scene
      this.cleanUp();
      //Get new model properties
      const modelType = toolToModelType(d);
      if (modelType > 2) return;
      const modelUrlData = toolToModelUrlData(d);
      const modelOffset = { x: 0, y: -6, z: 0, rough: 1.5 };
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
      if (stand && this.stand) this.scene.add(this.stand);
      this.setupTexture();
      //Wipe the renderCanvas
      this.renderCanvas.getContext("2d").clearRect(0, 0, 128, 1);
      this.mixImg = false;
      this.pixelCanvas.height = this.pixelCanvas.width =
        this.drawingTool.texWidth;
      this.renderCanvas.height = this.renderCanvas.width =
        this.drawingTool.texWidth * 4;
      this.drawingTool.render();
      //The loader has an async callback. This is fine, as we don't run any other code after it.
      const gltf = await new Promise((resolve) => {
        gltfLoader.load(modelUrlData.modelUrl, resolve);
      });
      if (this.model) this.scene.remove(this.model);
      this.model = gltf.scene.children[0];
      // need to start targeting specific meshes
      //  need to create mappings for specific targets
      this.model.traverse((child) => {
        if (!(child instanceof Mesh)) return;
        //child.material = new MeshPhongMaterial();
        if (modelUrlData.nrmUrl) {
          const nrmTexture = textureLoader.load(modelUrlData.nrmUrl, () => this.redraw());
          child.material.normalMap = nrmTexture;
          child.material.normalMap.flipY = false;
        }
        if (modelUrlData.crvUrl) {
          const crvTexture = textureLoader.load(modelUrlData.crvUrl, () => this.redraw());
          child.material.lightMap = crvTexture;
          child.material.lightMap.flipY = false;
        }
        if (modelUrlData.opUrl) {
          const opTexture = textureLoader.load(modelUrlData.opUrl, () => this.redraw());
          child.material.alphaMap = opTexture;
          child.material.alphaMap.flipY = false;
          child.material.transparent = true;
          child.material.alphaTest = 0.5;
        }
        if (modelUrlData.mixUrl) {
          this.mixImg = new Image();
          this.mixImg.onload = () => this.redraw();
          this.mixImg.src = modelUrlData.mixUrl
        }
        if (modelUrlData.albUrl) {
          const albTexture = textureLoader.load(modelUrlData.albUrl, () => this.redraw());
          child.material.map = albTexture;
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
        )
          child.material.map = this.texture;
        child.material.side = DoubleSide;
        child.material.metalness = 0;
        child.material.shininess = 9;
        child.material.roughness = modelOffset.rough;
      });
      this.model.position.x = modelOffset.x;
      this.model.position.y = modelOffset.y;
      this.model.position.z = modelOffset.z;
      this.scene.add(this.model);
      this.redraw();
      this.loading = false;
    },
    redraw() {
      if (!this.hasAnimReq)
        this.hasAnimReq = requestAnimationFrame(this.animate);
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
    async loadClothingStand() {
      const gltf = await new Promise(resolve => gltfLoader.load(clothingStand.modelUrl, resolve));
      this.stand = gltf.scene.children[0];
      this.stand.traverse((child) => {
        if (child instanceof Mesh) {
          child.material.side = DoubleSide;
          child.material.metalness = 0.3;
          child.material.roughness = 0.3;
        }
      });
      this.stand.position.y = -6;
    },
  },
  mounted: async function () {
    await this.loadClothingStand();
    this.setupTexture();
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

    const renderContext = this.renderCanvas.getContext("2d");
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

    // If the type of pattern changes, change the model too
    this.drawingTool.onLoad(() => this.loadModel());
    await this.loadModel(this.drawingTool);
  },
};
</script>

<style lang="scss" scoped>
.three-d {
  outline: none;
  cursor: all-scroll;
}
</style>
