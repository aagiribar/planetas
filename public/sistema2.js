import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let escena, camara, renderer;
let grid;
let plano;
let estrella;
let Planetas = [];
let raycaster;
let t0 = 0;
let accglobal = 0.001;
let timestamp;

init();
animationLoop();


function init() {
  escena = new THREE.Scene();
  
  camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camara.position.set(0,0,10);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  raycaster = new THREE.Raycaster();
  
  document.body.appendChild(renderer.domElement);
  
  grid = new THREE.GridHelper(20, 20);
  grid.geometry.rotateX(Math.PI / 2);
  
  escena.add(grid);
  
  let geometryp = new THREE.PlaneGeometry(20, 20);
  let materialp = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  plano = new THREE.Mesh(geometryp, materialp);
  plano.visible = false;
  escena.add(plano);
  
  let camcontrols = new OrbitControls(camara, renderer.domElement);
  
  Estrella(1.5, 0xffff00);
  
  document.addEventListener("mousedown", onDocumentMouseDown);
}

function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  requestAnimationFrame(animationLoop);
  for (let object of Planetas) {
    object.position.x =
      Math.cos(timestamp * object.userData.vel) *
      object.userData.f1 *
      object.userData.dist;
    object.position.y =
      Math.sin(timestamp * object.userData.vel) *
      object.userData.f2 *
      object.userData.dist;
  }
  estrella.rotation.y += 0.01;
  renderer.render(escena, camara);
}

function Estrella(radio, color) {
  let geometria = new THREE.SphereGeometry(radio, 10, 10);
  let material = new THREE.MeshBasicMaterial({color: color});
  estrella = new THREE.Mesh(geometria, material);
  escena.add(estrella);
}

function Planeta(x, y, z, radio, color, vel, f1, f2) {
  let geometria = new THREE.SphereGeometry(radio, 10, 10);
  let material = new THREE.MeshBasicMaterial({color: color});
  let planeta = new THREE.Mesh(geometria, material);
  planeta.userData.vel = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;
  planeta.userData.dist = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  planeta.position.set(x, y, z);
  Planetas.push(planeta);
  escena.add(planeta);
  
  let curve = new THREE.EllipseCurve(
    0,
    0, // centro
    planeta.userData.dist * f1,
    planeta.userData.dist * f2 // radios elipse
  );
  //Crea geometría
  let points = curve.getPoints(50);
  let geome = new THREE.BufferGeometry().setFromPoints(points);
  let mate = new THREE.LineBasicMaterial({ color: 0xffffff });
  // Objeto
  let orbita = new THREE.Line(geome, mate);
  escena.add(orbita);
}

function onDocumentMouseDown(event) {
  if (event.buttons == 2) {
    const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };

    //Intersección, define rayo
    raycaster.setFromCamera(mouse, camara);
    
    var c = new THREE.Color();
    c.set( THREE.MathUtils.randInt(0, Math.pow(2, 24) - 1) );
    
    var radio = THREE.MathUtils.randFloat(0.2, 1);
    var vel = THREE.MathUtils.randFloat(0.1, 0.5);
    var f1 = THREE.MathUtils.randFloat(1, 1);
    var f2 = THREE.MathUtils.randFloat(1, 1);
    
    const intersecciones = raycaster.intersectObject(plano);
    if (intersecciones.length > 0) {
      Planeta(intersecciones[0].point.x, intersecciones[0].point.y, intersecciones[0].point.z, radio, c, vel, f1, f2);
    }
  }
}