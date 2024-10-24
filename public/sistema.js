import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let escena, renderer, camara;
let estrella;
let objetos = [];
let luz;
let foco_camara;
let raycaster;
let camcontrols;
let nubes;

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
  camara.position.set(0, 0, 70);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camcontrols = new OrbitControls(camara, renderer.domElement);

  const tx_sol = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/sunmap.jpg?v=1729784770619"
  );
  Estrella(10, tx_sol);
  foco_camara = estrella;
  
  const tx_merc = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/mercurymap.jpg?v=1729792016170"
  );
  
  const bump_merc = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/mercurybump.jpg?v=1729792012229"
  );
  
  const tx_venus = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/venusmap.jpg?v=1729793328630"
  );
  
  const bump_venus = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/venusbump.jpg?v=1729793324059"
  );
  
  const tx_tierra = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/earthmap1k.jpg?v=1729791486243"
  );
  
  const bump_tierra = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/earthbump1k.jpg?v=1729791456765"
  );
  
  const spec_tierra = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/earthspec1k.jpg?v=1729791473219"
  );
  
  const nubes_tierra = new THREE.TextureLoader().load(
    "https://cdn.glitch.global/4591fef6-cf3a-4142-af6c-7c82ef7b6add/earthcloudmap.jpg?v=1729791481235"
  );
  
  const trans_nubes = new THREE.TextureLoader
  
  Planeta(15, 0, 0, 0.24, 0xffffff, 1, 1, 1, "Mercurio", tx_merc, bump_merc);
  Planeta(30, 0, 0, 0.60, 0xffffff, 1, 1, 1, "Venus", tx_venus, bump_venus);
  Planeta(45, 0, 0, 0.38, 0xffffff, 1, 1, 1, "Tierra", tx_tierra, bump_tierra, spec_tierra);
  Planeta(45, 0, 0, 0.48, 0xffffff, 1, 1, 1, undefined, nubes_tierra);
  
  luz = new THREE.PointLight();
  luz.position.set(0,0,0);
  escena.add(luz);
  
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousedown", onDocumentMouseDown);
  
}

function Estrella(radio, textura = undefined) {
  let geometria = new THREE.SphereGeometry(radio, 30, 30);
  let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  if (textura != undefined) {
    material.map = textura;
  }

  estrella = new THREE.Mesh(geometria, material);
  estrella.userData.nombre = "Sol";
  objetos.push(estrella);
  escena.add(estrella);
}

function Planeta(x, y, z, radio, color, vel, f1, f2, nombre, textura = undefined, texbump = undefined, texspec = undefined, texalpha = undefined, sombra = false) {
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
  planeta.userData.nombre = nombre;
  escena.add(planeta);
  if (nombre != undefined) {
    objetos.push(planeta);
  }
  else {
    nubes = planeta;
  }
}

function onDocumentMouseDown(event) {
  if (event.buttons == 2) {
    const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };

    //Intersección, define rayo
    raycaster.setFromCamera(mouse, camara);
    
    const intersecciones = raycaster.intersectObjects(objetos);
    if (intersecciones.length > 0) {
      foco_camara = intersecciones[0].object;
    }
  }
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  estrella.rotation.y += 0.01;
  camcontrols.target.x = foco_camara.position.x;
  camcontrols.target.y = foco_camara.position.y;
  camcontrols.target.z = foco_camara.position.z;
  renderer.render(escena, camara);
}
