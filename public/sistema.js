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
  
  const tx_sol = new THREE.TextureLoader().load("https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/sunmap.jpg?v=1729784770619");
  Estrella(2, tx_sol)
  
}

function Estrella(radio, textura = undefined) {
    let geometria = new THREE.SphereGeometry(radio, 10, 10);
    let material = new THREE.MeshBasicMaterial({color: 0xffff00});
  
    if (textura != undefined) { 
      material.map = textura;
    }
    
    estrella = new THREE.Mesh(geometria, material);
    escena.add(estrella);
  }

function animationLoop() {
  requestAnimationFrame(animationLoop);
  renderer.render(escena, camara);
}