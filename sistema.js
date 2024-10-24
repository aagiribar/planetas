import * as THREE from 'three';

let escena, renderer, camara;

init();
animationLoop();

function init() {
  escena = new THREE.Scene();
  camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camara.position.set(0, 0, 10);
  
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );
  escena.add( cube );
  
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  renderer.render(escena, camara);
}