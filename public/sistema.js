import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

let escena, renderer, camaraOrbital, camaraNave;
let estrella;
let objetos = [];
let anillos = [];
let luz;
let foco_camara;
let raycaster;
let orbitCamControls, flyCamControls;
let usarVistaNave, usarVistaOrbital;
let nubes;
let elementosUI;
let selectorCamara;
let selectorRotacion;
let carpetaRotacion;
let rotacionAnilloX, rotacionAnilloY, rotacionAnilloZ;
let t0 = 0;
let accglobal = 0.001;
let timestamp;
let velocidadTraslacion = 1;
let velocidadRotacion = 1;
let reloj;

const gui = new GUI();

init();
animationLoop();

function init() {
  escena = new THREE.Scene();
  camaraOrbital = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camaraOrbital.position.set(0, 0, 70);

  camaraNave = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camaraNave.position.set(0, 0, 70);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  orbitCamControls = new OrbitControls(camaraOrbital, renderer.domElement);
  flyCamControls = new FlyControls(camaraNave, renderer.domElement);
  flyCamControls.dragToLook = true;
  flyCamControls.movementSpeed = 10;
  flyCamControls.rollSpeed = Math.PI / 16;
  reloj = new THREE.Clock();
  flyCamControls.enabled = false;
  usarVistaNave = false;
  usarVistaOrbital = true;

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

  const tx_saturno = new THREE.TextureLoader().load(
    "saturnmap.jpg"
  )

  const tx_anillo_sat = new THREE.TextureLoader().load(
    "saturnringcolor.jpg"
  )

  const trans_anillo_sat = new THREE.TextureLoader().load(
    "saturnringpattern.gif"
  )

  const tx_urano = new THREE.TextureLoader().load(
    "uranusmap.jpg"
  )

  const tx_anillo_ur = new THREE.TextureLoader().load(
    "uranusringcolour.jpg"
  )

  const trans_anillo_ur = new THREE.TextureLoader().load(
    "uranusringtrans.gif"
  )

  const tx_neptuno = new THREE.TextureLoader().load(
    "neptunemap.jpg"
  )

  const tx_pluton = new THREE.TextureLoader().load(
    "plutomap2k.jpg"
  )

  const bump_pluton = new THREE.TextureLoader().load(
    "plutobump2k.jpg"
  )
  
  Planeta(15, 0, 0, 0.24, 0xffffff, 1.61, 0.01, 1, 1, "Mercurio", tx_merc, bump_merc);
  Planeta(25, 0, 0, 0.60, 0xffffff, 1.17, 0.01, 1, 1, "Venus", tx_venus, bump_venus);
  Planeta(35, 0, 0, 0.38, 0xffffff, 1, 0.01, 1, 1, "Tierra", tx_tierra, bump_tierra, spec_tierra);
  Planeta(35, 0, 0, 0.39, 0xffffff, 1, 1, 1, 1, undefined, nubes_tierra, undefined, undefined, trans_nubes);
  Planeta(45, 0, 0, 0.34, 0xffffff, 0.81, 0.01, 1, 1, "Marte", tx_marte, bump_marte);
  Planeta(70, 0, 0, 7.77, 0xffffff, 0.43, 0.01, 1, 1, "Jupiter", tx_jupiter);
  Planeta(100, 0, 0, 5.85, 0xffffff, 0.32, 0.01, 1, 1, "Saturno", tx_saturno);
  Anillo(objetos[6].position.x, objetos[6].position.y, objetos[6].position.z, objetos[6], 7, 10, 0xdaca8f, tx_anillo_sat, trans_anillo_sat);
  Planeta(120, 0, 0, 2.55, 0xffffff, 0.22, 0.01, 1, 1, "Urano", tx_urano);
  Anillo(objetos[7].position.x, objetos[7].position.y, objetos[7].position.z, objetos[7], 3, 4, 0xffffff, tx_anillo_ur, trans_anillo_ur);
  Planeta(140, 0, 0, 2.47, 0xffffff, 0.17, 0.01, 1, 1, "Neptuno", tx_neptuno);
  Planeta(160, 0, 0, 0.11, 0xffffff, 0.15, 0.01, 1, 1, "Plutón", tx_pluton, bump_pluton);

  luz = new THREE.PointLight();
  luz.position.set(0,0,0);
  escena.add(luz);
  
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousedown", onDocumentMouseDown);
  
  const carpetaCamara = gui.addFolder("Cámara");
  elementosUI = {
    "Objeto seleccionado": "Sol",
    "Rotación automática": false,
    "Rotación en X": Math.PI / 2,
    "Rotación en Y": Math.PI / 4,
    "Rotación en Z": 0,
    "Velocidad de traslación": 1,
    "Velocidad de rotación": 1,
    "Vista seleccionada": "Vista orbital"
  };
  selectorCamara = carpetaCamara.add(elementosUI, "Objeto seleccionado", obtenerNombresObjetos());
  selectorCamara.onChange(function (valor) {
    foco_camara = objetos.find((objeto) => {
      return objeto.userData.nombre === valor;
    });
  });
  selectorRotacion = carpetaCamara.add(elementosUI, "Rotación automática");
  selectorRotacion.onChange(function (valor) {
    orbitCamControls.autoRotate = valor;
  });
  let carpetaPlaneta = gui.addFolder("Planeta");
  carpetaRotacion = carpetaPlaneta.addFolder("Rotación del anillo");
  rotacionAnilloX = carpetaRotacion.add(elementosUI, "Rotación en X", 0, Math.PI * 2, 0.01);
  rotacionAnilloY = carpetaRotacion.add(elementosUI, "Rotación en Y", 0, Math.PI * 2, 0.01);
  rotacionAnilloZ = carpetaRotacion.add(elementosUI, "Rotación en Z", 0, Math.PI * 2, 0.01);

  rotacionAnilloX.onChange(function (valor) {
    foco_camara.userData.anillo.rotation.x = valor;
  });

  rotacionAnilloY.onChange(function (valor) {
    foco_camara.userData.anillo.rotation.y = valor;
  });

  rotacionAnilloZ.onChange(function (valor) {
    foco_camara.userData.anillo.rotation.z = valor;
  });

  let carpetaSimulacion = gui.addFolder("Simulación");
  carpetaSimulacion.add(elementosUI, "Velocidad de traslación", 0, 2, 0.01).onChange(function (valor) {
    velocidadTraslacion = valor;
  });
  carpetaSimulacion.add(elementosUI, "Velocidad de rotación", 0, 2, 0.01).onChange(function (valor) {
    velocidadRotacion = valor;
  });
  carpetaCamara.add(elementosUI, "Vista seleccionada", ["Vista orbital", "Vista desde nave", "Ambas"]).onChange(function (valor) {
    if (valor == "Vista desde nave") {
      usarVistaNave = true;
      usarVistaOrbital = false;
      selectorCamara.hide();
      selectorRotacion.hide();
      flyCamControls.enabled = false;
      orbitCamControls.enabled = false;
    }
    else if (valor == "Vista orbital") {
      usarVistaNave = false;
      usarVistaOrbital = true;
      selectorCamara.show();
      selectorRotacion.show();
      flyCamControls.enabled = false;
      orbitCamControls.enabled = true;
    }
    else if (valor == "Ambas") {
      usarVistaNave = true;
      usarVistaOrbital = true;
      selectorCamara.show();
      selectorRotacion.show();
      flyCamControls.enabled = true;
      orbitCamControls.enabled = true;
    }
  });
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

function Planeta(x, y, z, radio, color, velTras, velRot, f1, f2, nombre, textura = undefined, texbump = undefined, texspec = undefined, texalpha = undefined, sombra = false) {
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
  planeta.userData.velTras = velTras;
  planeta.userData.velRot = velRot;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;
  planeta.userData.dist = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
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
  orbita.rotation.x += Math.PI / 2;
  escena.add(orbita);
}

function Anillo(x, y, z, planeta, radioInterno, radioExterno, color, textura = undefined, texalpha = undefined, sombra = false) {
  let geometria = new THREE.RingGeometry(radioInterno, radioExterno);
  let material = new THREE.MeshPhongMaterial({
    color: color,
    side: THREE.DoubleSide
  });

  if (textura != undefined){
    material.map = textura;
  }

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

  let anillo = new THREE.Mesh(geometria, material);
  if (sombra) anillo.castShadow = true;
  anillo.position.set(x, y, z);
  escena.add(anillo);
  anillos.push(anillo);
  planeta.userData.anillo = anillo;
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
    raycaster.setFromCamera(mouse, camaraOrbital);
    
    const intersecciones = raycaster.intersectObjects(objetos);
    if (intersecciones.length > 0) {
      foco_camara = intersecciones[0].object;
      selectorCamara.setValue(foco_camara.userData.nombre);
    }
  }
}

function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  const delta = reloj.getDelta();
  requestAnimationFrame(animationLoop);
  estrella.rotation.y += (0.01) * velocidadRotacion;
  orbitCamControls.target.x = foco_camara.position.x;
  orbitCamControls.target.y = foco_camara.position.y;
  orbitCamControls.target.z = foco_camara.position.z;
  orbitCamControls.update();
  if (foco_camara.userData.anillo != undefined) {
    carpetaRotacion.show();
    rotacionAnilloX.setValue(foco_camara.userData.anillo.rotation.x);
    rotacionAnilloY.setValue(foco_camara.userData.anillo.rotation.y);
    rotacionAnilloZ.setValue(foco_camara.userData.anillo.rotation.z);
  }
  else {
    carpetaRotacion.hide();
  }
  for (let object of objetos) {
    if (object.userData.nombre == "Sol") continue;
    object.position.x =
      Math.cos(timestamp * (object.userData.velTras * velocidadTraslacion)) *
      object.userData.f1 *
      object.userData.dist;
    object.position.z =
      Math.sin(timestamp * (object.userData.velTras * velocidadTraslacion)) *
      object.userData.f2 *
      object.userData.dist;
    if (object.userData.anillo != undefined) {
      object.userData.anillo.position.x = object.position.x;
      object.userData.anillo.position.z = object.position.z;
    }
    object.rotation.y += (object.userData.velRot * velocidadRotacion);
  }
  nubes.position.x = objetos[3].position.x;
  nubes.position.z = objetos[3].position.z;

  flyCamControls.update(delta);

  let x, y, w, h;
  if (usarVistaNave && usarVistaOrbital) {

    x = Math.floor(window.innerWidth * 0.0);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 0.5);
    h = Math.floor(window.innerHeight * 1.0);

    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x,y,w,h);
    renderer.setScissorTest(true);
    camaraOrbital.aspect = w / h;
    camaraOrbital.updateProjectionMatrix();
    renderer.render(escena, camaraOrbital);

    x = Math.floor(window.innerWidth * 0.5);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 1.0);
    h = Math.floor(window.innerHeight * 1.0);

    renderer.setViewport(x, y, w, h);
    renderer.setScissor( x,y,w,h );
    camaraNave.aspect = w / h;
    camaraNave.updateProjectionMatrix();
    renderer.render(escena, camaraNave);
  }
  else  {
    x = Math.floor(window.innerWidth * 0.0);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 1.0);
    h = Math.floor(window.innerHeight * 1.0);

    renderer.setViewport(x, y, w, h);
    renderer.setScissor( x,y,w,h );
    
    if (usarVistaOrbital) {
      camaraOrbital.aspect = w / h;
      camaraOrbital.updateProjectionMatrix();
      renderer.render(escena, camaraOrbital);
    }
    else if (usarVistaNave) {
      camaraNave.aspect = w / h;
      camaraNave.updateProjectionMatrix();
      renderer.render(escena, camaraNave);
    }
  }
}
