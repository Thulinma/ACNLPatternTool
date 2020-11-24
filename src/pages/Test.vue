<template>
  <div ref="container">

  </div>
</template>

<script>
import {
  ColladaLoader
} from "@three/loaders/ColladaLoader";
import * as THREE from "@three/core";
import injected from "~/utils/injected";

const {
  easel_folder
} = injected; // alias, injected.easel_folder => easel_folder

export default {
  name: "Test",
  mounted () {
    let container, stats, clock;
    let camera, scene, renderer, elf;

    container = this.$refs.container;
    camera = new THREE.PerspectiveCamera(45, window.innerWidth, window.innerHeight, 0.1, 2000);
    camera.position.set(8, 10, 8);
    scene = new THREE.Scene();
    clock = new THREE.Clock();
    let loadingManager = new THREE.LoadingManager(() => {
      scene.add(elf);
    });

    // DO NOT REVOKE INJECTED FILES
    loadingManager.setURLModifier((url) => {
      const fileName = url.replace(/^.*[\\\/]/, '');

      // e.g. even the first dae goes through this
      // first dae is a blob hash, does not exist in easel_folder
      if (!(fileName in easel_folder))
        return easel_folder.dae;

      const newUrl = easel_folder[fileName];
      return newUrl;
    });

    let loader = new ColladaLoader(loadingManager);
    loader.load(easel_folder.dae, (collada) => {
      elf = collada.scene;
    });
    let ambientLight = new THREE.AmbientLight(0xCCCCCCC, 0.4);
    scene.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(1, 1, 0).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer();

  }
}
</script>