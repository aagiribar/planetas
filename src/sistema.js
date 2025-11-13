import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import {
  crearGUI,
  carpetaRotacion,
  focoCamara,
  setFocoCamara,
  usarVistaNave,
  usarVistaOrbital,
  crearInfo,
  rotacionAnilloX,
  rotacionAnilloY,
  rotacionAnilloZ,
  velocidadRotacion,
  velocidadTraslacion,
  selectorCamara
} from "./modules/gui";

import { 
  cubeTexture,
  tx_merc,
  bump_merc,
  tx_venus,
  bump_venus,
  tx_tierra,
  bump_tierra,
  spec_tierra,
  nubes_tierra,
  trans_nubes,
  tx_marte,
  bump_marte,
  tx_jupiter,
  tx_saturno,
  tx_anillo_sat,
  trans_anillo_sat,
  tx_urano,
  tx_anillo_ur,
  trans_anillo_ur,
  tx_neptuno,
  tx_pluton,
  bump_pluton,
} from "./modules/textures"

let escena, renderer, camaraOrbital, camaraNave;
let estrella;
export let objetos = [];
let anillos = [];
let luz;
let luzAmbiental;
let raycaster;
export let orbitCamControls, flyCamControls;
let nubes;
let t0 = 0;
let accglobal = 0.001;
let timestamp;
let reloj;

// Se inicializa la simulación
init();
// Se inicial el bucle de animación
animationLoop();

function init() {
  crearInfo();

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
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Redimensión de la ventana
  window.addEventListener("resize", function (event) {
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

  // Carga de la textura del sol
  const tx_sol = new THREE.TextureLoader().load(
    "/assets/8k_sun.jpg"
  );
  // Creación de el objeto que representa al sol
  Estrella(10, tx_sol);
  // Al empezar la simulación la camara orbita alrededor del sol
  setFocoCamara(estrella)

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
  luz = new THREE.PointLight(0xFFFFFF, 1);
  luz.position.set(0, 0, 0);
  luz.castShadow = true;
  escena.add(luz);

  // Creación de una luz ambiental para iluminar las zonas en sombra de los planetas
  luzAmbiental = new THREE.AmbientLight(0x222222);
  escena.add(luzAmbiental);

  // Creación del Raycaster para implementar enfocar la cámara hacieno click derecho sobre un planeta
  raycaster = new THREE.Raycaster();
  document.addEventListener("mousedown", onDocumentMouseDown);

  crearGUI();
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
  if (textura != undefined) {
    material.map = textura;
  }
  //Rugosidad
  if (texbump != undefined) {
    material.bumpMap = texbump;
    material.bumpScale = 0.5;
  }

  //Especular
  if (texspec != undefined) {
    material.specularMap = texspec;
    material.specular = new THREE.Color('grey');
  }

  //Transparencia
  if (texalpha != undefined) {
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
  if (textura != undefined) {
    material.map = textura;
  }

  // Transparencia del anillos
  if (texalpha != undefined) {
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
      setFocoCamara(intersecciones[0].object);
      // Se actualiza el selector en la interfaz de usuario
      selectorCamara.setValue(focoCamara.userData.nombre);
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
  orbitCamControls.target.copy(focoCamara.position);
  orbitCamControls.update();

  // Se muestran los controles de rotación de anillo si esta seleccionado un planeta con anillos (Saturno o Urano)
  if (focoCamara.userData.anillo != undefined) {
    carpetaRotacion.show();
    // Se actualiza el valor mostrado en la interfaz de usuario
    rotacionAnilloX.setValue(focoCamara.userData.anillo.rotation.x);
    rotacionAnilloY.setValue(focoCamara.userData.anillo.rotation.y);
    rotacionAnilloZ.setValue(focoCamara.userData.anillo.rotation.z);
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
    renderer.setScissor(x, y, w, h);
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
    renderer.setScissor(x, y, w, h);
    // Se actualiza la relación de aspecto de la camara
    camaraNave.aspect = w / h;
    camaraNave.updateProjectionMatrix();
    // Se renderiza la escena con la camara de la nave
    renderer.render(escena, camaraNave);
  }
  else {
    // Se calculan las dimensiones del puerto de vista para que este ocupe toda la pantalla
    x = Math.floor(window.innerWidth * 0.0);
    y = Math.floor(window.innerHeight * 0.0);
    w = Math.floor(window.innerWidth * 1.0);
    h = Math.floor(window.innerHeight * 1.0);

    // Se establece el puerto de vista
    renderer.setViewport(x, y, w, h);
    renderer.setScissor(x, y, w, h);

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
