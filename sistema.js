import * as THREE from 'three';

let escena, renderer, camara;

init();

function init() {
  escena = new THREE.Scene();
  
  camara = new THREE.PerspectiveCamera();
  
}