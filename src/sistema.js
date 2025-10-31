import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';

let escena, renderer, camaraOrbital, camaraNave;
let estrella;
let objetos = [];
let anillos = [];
let luz;
let luzAmbiental;
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
let info, infoCamaraOrbital, infoCamaraNave;

// Creación de la interfaz de usuario
const gui = new GUI();

// Se inicializa la simulación
init();
// Se inicial el bucle de animación
animationLoop();

function init() {
  // Información en pantalla sobre como controlar las camaras
  info = document.createElement('div');
  info.style.position = 'absolute';
  info.style.top = '30px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.style.color = '#fff';
  info.style.fontWeight = 'bold';
  info.style.backgroundColor = 'transparent';
  info.style.zIndex = '1';
  info.style.fontFamily = 'Monospace';
  info.innerHTML = "La simulación puede ser controlada desde el panel de la derecha";
  document.body.appendChild(info);
  infoCamaraOrbital = document.createElement("div");
  infoCamaraNave = document.createElement("div");
  infoCamaraOrbital.innerHTML = "Controles de camara órbital<br>Movimiento: Arrastre con el ratón.<br>Zoom: Rueda del ratón<br>Enfocar un planeta o estrella: Click derecho"
  infoCamaraNave.innerHTML = "Controles de camara de nave<br>Movimiento de la nave: WASD<br>Movimiento de la camara: Arrastre con el ratón o flechas direccionales"
  info.appendChild(infoCamaraOrbital);
  
  // Creación de la escena
  escena = new THREE.Scene();
  // Creación de la camara controlada con el control orbital (vista general)
  camaraOrbital = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camaraOrbital.position.set(0, 20, 70);

  // Creación de la camara controlada por el control de vuelo (vista de nave)
  camaraNave = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camaraNave.position.set(0, 20, 70);

  // Creación del renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Redimensión de la ventana
  window.addEventListener("resize", function(event) {
    camaraOrbital.aspect = window.innerWidth / window.innerHeight;
    camaraOrbital.updateProjectionMatrix();

    camaraNave.aspect = window.innerWidth / window.innerHeight;
    camaraNave.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });  

  // Creación del control de tipo orbital
  orbitCamControls = new OrbitControls(camaraOrbital, renderer.domElement);
  orbitCamControls.enableDamping = true;
  orbitCamControls.enableZoom = true;
  orbitCamControls.enableRotate = true;
  orbitCamControls.enablePan = false;
  
  // Creación del control de tipo vuelo
  flyCamControls = new FlyControls(camaraNave, renderer.domElement);
  flyCamControls.dragToLook = true;
  flyCamControls.movementSpeed = 10;
  flyCamControls.rollSpeed = Math.PI / 16;

  // Creación de un objeto de tipo Clock para la actualización de los controles de vuelo
  reloj = new THREE.Clock();

  // Modo inicial de vista (vista orbital)
  flyCamControls.enabled = false;
  usarVistaNave = false;
  usarVistaOrbital = true;

  // Carga de la textura del sol
  const tx_sol = new THREE.TextureLoader().load(
    new URL("/assets/8k_sun.jpg", import.meta.url)
  );
  // Creación de el objeto que representa al sol
  Estrella(10, tx_sol);
  // Al empezar la simulación la camara orbita alrededor del sol
  foco_camara = estrella;
  
  // Carga de las texturas, mapas de rugosidad y mapas de transparencia de los planetas y sus anillos
  const tx_merc = new THREE.TextureLoader().load(
    new URL("/assets/8k_mercury.jpg", import.meta.url)
  );
  
  const bump_merc = new THREE.TextureLoader().load(
    new URL("/assets/mercurybump.jpg", import.meta.url)
  );
  
  const tx_venus = new THREE.TextureLoader().load(
    new URL("/assets/8k_venus_surface.jpg", import.meta.url)
  );

  const tx_venus_atmos = new THREE.TextureLoader().load(
    new URL("/assets/4k_venus_atmosphere.jpg", import.meta.url)
  );
  
  const bump_venus = new THREE.TextureLoader().load(
    new URL("/assets/venusbump.jpg", import.meta.url)
  );
  
  const tx_tierra = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_daymap.jpg", import.meta.url)
  );

  const tx_tierra_noche = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_nightmap.jpg", import.meta.url)
  );
  
  const bump_tierra = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_normal_map.tif", import.meta.url)
  );
  
  const spec_tierra = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_specular_map.tif", import.meta.url)
  );
  
  const nubes_tierra = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_clouds.jpg", import.meta.url)
  );
  
  const trans_nubes = new THREE.TextureLoader().load(
    new URL("/assets/earth/8k_earth_clouds.jpg", import.meta.url)
  );

  const tx_luna = new THREE.TextureLoader().load(
    new URL("/assets/8k_moon.jpg", import.meta.url)
  );
  
  const tx_marte = new THREE.TextureLoader().load(
    new URL("/assets/8k_mars.jpg", import.meta.url)
  );
  
  const bump_marte = new THREE.TextureLoader().load(
    new URL("/assets/marsbump1k.jpg", import.meta.url)
  );
  
  const tx_jupiter = new THREE.TextureLoader().load(
    new URL("/assets/8k_jupiter.jpg", import.meta.url)
  );

  const tx_saturno = new THREE.TextureLoader().load(
    new URL("/assets/8k_saturn.jpg", import.meta.url)
  );

  const tx_anillo_sat = new THREE.TextureLoader().load(
    new URL("/assets/8k_saturn_ring_alpha.png", import.meta.url)
  );

  const trans_anillo_sat = new THREE.TextureLoader().load(
    new URL("/assets/saturnringpattern.gif", import.meta.url)
  );

  const tx_urano = new THREE.TextureLoader().load(
    new URL("/assets/2k_uranus.jpg", import.meta.url)
  );

  const tx_anillo_ur = new THREE.TextureLoader().load(
    new URL("/assets/uranusringcolour.jpg", import.meta.url)
  );

  const trans_anillo_ur = new THREE.TextureLoader().load(
    new URL("/assets/uranusringtrans.gif", import.meta.url)
  );

  const tx_neptuno = new THREE.TextureLoader().load(
    new URL("/assets/2k_neptune.jpg", import.meta.url)
  );

  const tx_pluton = new THREE.TextureLoader().load(
    new URL("/assets/plutomap2k.jpg", import.meta.url)
  );

  const bump_pluton = new THREE.TextureLoader().load(
    new URL("/assets/plutobump2k.jpg", import.meta.url)
  );

  // Carga de la textura del fondo de estrellas
  const cubeTexture = new THREE.CubeTextureLoader().load([
    new URL("/assets/skybox/px.png", import.meta.url),
    new URL("/assets/skybox/nx.png", import.meta.url),
    new URL("/assets/skybox/py.png", import.meta.url),
    new URL("/assets/skybox/ny.png", import.meta.url),
    new URL("/assets/skybox/pz.png", import.meta.url),
    new URL("/assets/skybox/nz.png", import.meta.url),
  ]);

  escena.background = cubeTexture;

  // Creación de los planetas y anillos
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

  // Creación de una luz puntual que representará la luz del sol
  luz = new THREE.PointLight();
  luz.position.set(0,0,0);
  escena.add(luz);

  // Creación de una luz ambiental para iluminar las zonas en sombra de los planetas
  luzAmbiental = new THREE.AmbientLight(0x222222);
  escena.add(luzAmbiental);
  
  // Creación del Raycaster para implementar enfocar la cámara hacieno click derecho sobre un planeta
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousedown", onDocumentMouseDown);
  
  // Objeto que almacena los elementos de la interfaz de usuario
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
  // Creación de carpeta para almacenar los controles de camara
  const carpetaCamara = gui.addFolder("Cámara");

  // Selector de objeto sobre el que orbitará la camara (camara orbital)
  selectorCamara = carpetaCamara.add(elementosUI, "Objeto seleccionado", obtenerNombresObjetos());
  selectorCamara.onChange(function (valor) {
    foco_camara = objetos.find((objeto) => {
      return objeto.userData.nombre === valor;
    });
  });

  // Selector de rotación automática de la camara (camara orbital)
  selectorRotacion = carpetaCamara.add(elementosUI, "Rotación automática");
  selectorRotacion.onChange(function (valor) {
    orbitCamControls.autoRotate = valor;
  });

  // Creación de carpeta para almacenar los controles sobre los planetas
  let carpetaPlaneta = gui.addFolder("Planeta");

  // Creación de carpeta para almacenar los controles de rotación de los anillos de los planetas (Saturno y Urano)
  carpetaRotacion = carpetaPlaneta.addFolder("Rotación del anillo");
  // Controles de rotación del anillo en los 3 angulos
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

  // Creación de carpeta para almacenar los controles sobre la simulación
  let carpetaSimulacion = gui.addFolder("Simulación");
  // Control de velocidad de traslación de los planetas
  carpetaSimulacion.add(elementosUI, "Velocidad de traslación", 0, 2, 0.01).onChange(function (valor) {
    velocidadTraslacion = valor;
  });
  // Control de velocidad de rotación de los planetas
  carpetaSimulacion.add(elementosUI, "Velocidad de rotación", 0, 2, 0.01).onChange(function (valor) {
    velocidadRotacion = valor;
  });

  // Selector de camaras
  carpetaCamara.add(elementosUI, "Vista seleccionada", ["Vista orbital", "Vista desde nave", "Ambas"]).onChange(function (valor) {
    if (valor == "Vista desde nave") {
      usarVistaNave = true;
      usarVistaOrbital = false;
      selectorCamara.hide();
      selectorRotacion.hide();
      flyCamControls.enabled = false;
      orbitCamControls.enabled = false;
      info.removeChild(infoCamaraOrbital);
      info.appendChild(infoCamaraNave);
    }
    else if (valor == "Vista orbital") {
      usarVistaNave = false;
      usarVistaOrbital = true;
      selectorCamara.show();
      selectorRotacion.show();
      flyCamControls.enabled = false;
      orbitCamControls.enabled = true;
      info.removeChild(infoCamaraNave);
      info.appendChild(infoCamaraOrbital);
    }
    else if (valor == "Ambas") {
      usarVistaNave = true;
      usarVistaOrbital = true;
      selectorCamara.show();
      selectorRotacion.show();
      flyCamControls.enabled = true;
      orbitCamControls.enabled = true;
      info.appendChild(infoCamaraOrbital);
      info.appendChild(infoCamaraNave);
    }
  });
}

// Función para crear una estrella en el centro de la simulación
// Parámetros:
// radio: Radio de la estrella
// textura: Textura que se aplicará a la estrella
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

// Función para crear un planeta en la simulación
// Parámetros:
// x, y, z: Coordenadas iniciales donde se creará el planeta
// radio: Radio del planeta
// color: Color del planeta
// velTras: Velocidad de traslación del planeta (movimiento alrededor del sol)
// velRot: Velocidad de rotación del planeta (movimiento sobre su propio eje)
// f1, f2: Valores de los ejes de la elipse de la órbita
// textura: Textura que se aplicará al planeta
// texbump: Mapa de rugosidad que se aplicará al planeta
// texspec: Mapa para determinar las zonas de reflexión especular del planeta
// texalpha: Mapa de transparencias del planetas
function Planeta(x, y, z, radio, color, velTras, velRot, f1, f2, nombre, textura = undefined, texbump = undefined, texspec = undefined, texalpha = undefined) {
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
  planeta.castShadow = true;
  planeta.receiveShadow = true;
  planeta.position.set(x, y, z);
  planeta.userData.nombre = nombre;
  escena.add(planeta);

  // Si no tiene nombre se trata de la esfera con textura de nubes de la tierra
  if (nombre != undefined) {
    objetos.push(planeta);
  }
  else {
    nubes = planeta;
  }

  // Creación de la curva para representar la orbita
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

// Función para crear los anillos de un planeta
// Parámetros: 
// x, y, z: Coordenadas iniciales donde se creará el anillo
// radioInterno: Valor del radio interior del anillo
// radioExterno: Valor del radio exterior del anillo
// color: Color del anillo
// textura: Textura que se aplicará al anillo
// texalpha: Mapa de transparencias del anillo
function Anillo(x, y, z, planeta, radioInterno, radioExterno, color, textura = undefined, texalpha = undefined) {
  let geometria = new THREE.RingGeometry(radioInterno, radioExterno);
  let material = new THREE.MeshPhongMaterial({
    color: color,
    side: THREE.DoubleSide
  });

  // Textura del anillo
  if (textura != undefined){
    material.map = textura;
  }

  // Transparencia del anillos
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
  anillo.castShadow = true;
  anillo.receiveShadow = true;
  anillo.position.set(x, y, z);
  escena.add(anillo);
  anillos.push(anillo);
  planeta.userData.anillo = anillo;
}

// Función para obtener un array con el nombre de los objetos creados
function obtenerNombresObjetos() {
  let nombres = []
  for (const objeto of objetos) {
    nombres.push(objeto.userData.nombre)
  }
  return nombres;
}

// Función para controlar el evento de ratón cuando se hace click
// Se utiliza para cambiar el foco de la camara orbital al hacer click derecho en un planeta
function onDocumentMouseDown(event) {
  if (event.buttons == 2) {
    const mouse = {
    x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    };

    // Intersección, define rayo
    raycaster.setFromCamera(mouse, camaraOrbital);
    
    // Se detectan las intersecciones con el rayo
    const intersecciones = raycaster.intersectObjects(objetos);
    if (intersecciones.length > 0) {
      // Se cambia el foco de la camara
      foco_camara = intersecciones[0].object;
      // Se actualiza el selector en la interfaz de usuario
      selectorCamara.setValue(foco_camara.userData.nombre);
    }
  }
}

// Bucle de animación
function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  const delta = reloj.getDelta();
  // Rotación del sol
  estrella.rotation.y += (0.01) * velocidadRotacion;
  // Se recoloca el foco de la camara orbital
  orbitCamControls.target.copy(foco_camara.position);
  orbitCamControls.update();
  
  // Se muestran los controles de rotación de anillo si esta seleccionado un planeta con anillos (Saturno o Urano)
  if (foco_camara.userData.anillo != undefined) {
    carpetaRotacion.show();
    // Se actualiza el valor mostrado en la interfaz de usuario
    rotacionAnilloX.setValue(foco_camara.userData.anillo.rotation.x);
    rotacionAnilloY.setValue(foco_camara.userData.anillo.rotation.y);
    rotacionAnilloZ.setValue(foco_camara.userData.anillo.rotation.z);
  }
  else {
    carpetaRotacion.hide();
  }
  for (let object of objetos) {
    if (object.userData.nombre == "Sol") continue;
    // Se calcula la posición de los planetas para implementar la traslación
    object.position.x =
      Math.cos(timestamp * (object.userData.velTras * velocidadTraslacion)) *
      object.userData.f1 *
      object.userData.dist;
    object.position.z =
      Math.sin(timestamp * (object.userData.velTras * velocidadTraslacion)) *
      object.userData.f2 *
      object.userData.dist;
    // Si el objeto tiene anillos, se actualiza la posición de los mismos para que se trasladen con él
    if (object.userData.anillo != undefined) {
      object.userData.anillo.position.x = object.position.x;
      object.userData.anillo.position.z = object.position.z;
    }
    // Se rota el objeto
    object.rotation.y += (object.userData.velRot * velocidadRotacion);
  }
  // Se actualiza la posición de la esfera de nubes de la tierra
  nubes.position.x = objetos[3].position.x;
  nubes.position.z = objetos[3].position.z;

  // Se actualiza el control de vuelo
  flyCamControls.update(delta);

  // Se definen las variables para configurar los puertos de vista en función del modo de camara seleccionado
  let x, y, w, h;
  // Si seleccionan ambas camaras
  if (usarVistaNave && usarVistaOrbital) {

    // Se calculan las dimensiones del puerto de vista de forma que la camara orbital ocupe la mitad izquierda de la pantalla
    x = Math.floor(window.innerWidth * 0.0);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 0.5);
    h = Math.floor(window.innerHeight * 1.0);

    // Se establece el puerto de vista
    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x,y,w,h);
    renderer.setScissorTest(true);
    // Se actualiza la relación de aspecto de la camara
    camaraOrbital.aspect = w / h;
    camaraOrbital.updateProjectionMatrix();
    // Se renderiza la escena con la camara orbital
    renderer.render(escena, camaraOrbital);

    // A continuación, Se calculan las dimensiones del puerto de vista de forma que la camara de la nave ocupe la mitad derecha de la pantalla
    x = Math.floor(window.innerWidth * 0.5);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 1.0);
    h = Math.floor(window.innerHeight * 1.0);

    // Se establece el puerto de vista
    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x,y,w,h);
    // Se actualiza la relación de aspecto de la camara
    camaraNave.aspect = w / h;
    camaraNave.updateProjectionMatrix();
    // Se renderiza la escena con la camara de la nave
    renderer.render(escena, camaraNave);
  }
  else  {
    // Se calculan las dimensiones del puerto de vista para que este ocupe toda la pantalla
    x = Math.floor(window.innerWidth * 0.0);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 1.0);
    h = Math.floor(window.innerHeight * 1.0);

    // Se establece el puerto de vista
    renderer.setViewport(x, y, w, h);
    renderer.setScissor( x,y,w,h );
    
    // Se renderiza con la camara seleccionada actualizando la relación de aspecto antes
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
  requestAnimationFrame(animationLoop);
}
