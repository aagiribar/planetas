import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let escena, renderer, camara;
let estrella;

init();
animationLoop();

function init() {
  escena = new THREE.Scene();
  camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camara.position.set(0, 0, 10);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  let camcontrols = new OrbitControls(camara, renderer.domElement);
  
  Estrella(radio, textura) {
    
  }
  
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  renderer.render(escena, camara);
}