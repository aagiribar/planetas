import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let escena, renderer, camara;
let estrella;
let objetos = [];

init();
animationLoop();

function init() {
  escena = new THREE.Scene();
  camara = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camara.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  let camcontrols = new OrbitControls(camara, renderer.domElement);

  const tx_sol = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/sunmap.jpg?v=1729784770619"
  );
  Estrella(2, tx_sol);
  
  
}

function Estrella(radio, textura = undefined) {
  let geometria = new THREE.SphereGeometry(radio, 30, 30);
  let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  if (textura != undefined) {
    material.map = textura;
  }

  estrella = new THREE.Mesh(geometria, material);
  estrella.userData.nombre = "Sol";
  escena.add(estrella);
}

function Planeta(x, y, z, radio, color, vel, f1, f2, textura = undefined, texbump = undefined, texspec = undefined, texalpha = undefined, sombra = false) {
  let geometry = new THREE.SphereBufferGeometry(radio, 30, 30);
  //Material Phong definiendo color
  let material = new THREE.MeshPhongMaterial({
    color: color
  });

  //Textura
  if (textura != undefined){
    material.map = textura;
  }
  //Rugosidad
  if (texbump != undefined){
    material.bumpMap = texbump;
    material.bumpScale = 0.5;
  }

  //Especular
  if (texspec != undefined){
    material.specularMap = texspec;
    material.specular = new THREE.Color('grey');
  }

  //Transparencia
  if (texalpha != undefined){
    //Con mapa de transparencia
    material.alphaMap = texalpha;
    material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 1.0;

    //Sin mapa de transparencia
    /*material.transparent = true;
    material.side = THREE.DoubleSide;
    material.opacity = 0.8;
    material.transparent = true;
    material.depthWrite = false;*/
  }

  let planeta = new THREE.Mesh(geometry, material);
  if (sombra) planeta.castShadow = true;
  planeta.position.set(x, y, z);
  escena.add(planeta);
  objetos.push(planeta);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  estrella.rotation.y += 0.01;
  renderer.render(escena, camara);
}
