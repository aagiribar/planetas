import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

let escena, renderer, camara;
let estrella;
let objetos = [];
let luz;
let foco_camara;
let raycaster;
let camcontrols;
let nubes;
let elementosUI;
let selectorCamara;
let selectorRotacion;

const gui = new GUI();

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
  camcontrols.autoRotate = true;

  const tx_sol = new THREE.TextureLoader().load(
    "sunmap.jpg"
  );
  Estrella(10, tx_sol);
  foco_camara = estrella;
  
  const tx_merc = new THREE.TextureLoader().load(
    "mercurymap.jpg"
  );
  
  const bump_merc = new THREE.TextureLoader().load(
    "mercurybump.jpg"
  );
  
  const tx_venus = new THREE.TextureLoader().load(
    "venusmap.jpg"
  );
  
  const bump_venus = new THREE.TextureLoader().load(
    "venusbump.jpg"
  );
  
  const tx_tierra = new THREE.TextureLoader().load(
    "earthmap1k.jpg"
  );
  
  const bump_tierra = new THREE.TextureLoader().load(
    "earthbump1k.jpg"
  );
  
  const spec_tierra = new THREE.TextureLoader().load(
    "earthspec1k.jpg"
  );
  
  const nubes_tierra = new THREE.TextureLoader().load(
    "earthcloudmap.jpg"
  );
  
  const trans_nubes = new THREE.TextureLoader().load(
    "earthcloudmaptrans_invert.jpg"
  );
  
  const tx_marte = new THREE.TextureLoader().load(
    "mars_1k_color.jpg"
  );
  
  const bump_marte = new THREE.TextureLoader().load(
    "marsbump1k.jpg"
  );
  
  const tx_jupiter = new THREE.TextureLoader().load(
    "jupitermap.jpg"
  );
  
  Planeta(15, 0, 0, 0.24, 0xffffff, 1, 1, 1, "Mercurio", tx_merc, bump_merc);
  Planeta(25, 0, 0, 0.60, 0xffffff, 1, 1, 1, "Venus", tx_venus, bump_venus);
  Planeta(35, 0, 0, 0.38, 0xffffff, 1, 1, 1, "Tierra", tx_tierra, bump_tierra, spec_tierra);
  Planeta(35, 0, 0, 0.39, 0xffffff, 1, 1, 1, undefined, nubes_tierra, undefined, undefined, trans_nubes);
  Planeta(45, 0, 0, 0.34, 0xffffff, 1, 1, 1, "Marte", tx_marte, bump_marte);
  Planeta(70, 0, 0, 7.77, 0xffffff, 1, 1, 1, "Jupiter", tx_jupiter);
  
  luz = new THREE.PointLight();
  luz.position.set(0,0,0);
  escena.add(luz);
  
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousedown", onDocumentMouseDown);
  
  const carpetaCamara = gui.addFolder("Cámara");
  elementosUI = {
    "Objeto seleccionado": "Sol",
    "Rotación automática": true
  };
  selectorCamara = carpetaCamara.add(elementosUI, "Objeto seleccionado", obtenerNombresObjetos());
  selectorCamara.onChange(function (valor) {
    foco_camara = objetos.find((objeto) => {
      return objeto.userData.nombre === valor;
    });
  });
  selectorRotacion = carpetaCamara.add(elementosUI, "Rotación automática");
  selectorRotacion.onChange(function (valor) {
    camcontrols.autoRotate = valor;
  })
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

function obtenerNombresObjetos() {
  let nombres = []
  for (const objeto of objetos) {
    nombres.push(objeto.userData.nombre)
  }
  return nombres;
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
      selectorCamara.setValue(foco_camara.userData.nombre);
    }
  }
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  estrella.rotation.y += 0.01;
  camcontrols.target.x = foco_camara.position.x;
  camcontrols.target.y = foco_camara.position.y;
  camcontrols.target.z = foco_camara.position.z;
  camcontrols.update();
  renderer.render(escena, camara);
}
