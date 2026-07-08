import {
  crearGUI,
  carpetaRotacion,
  focoCamara,
  usarVistaNave,
  usarVistaOrbital,
  crearInfo,
  rotacionAnilloX,
  rotacionAnilloY,
  rotacionAnilloZ,
  velocidadRotacion,
  velocidadTraslacion,
} from "./modules/gui";

import { 
  createSimObjects, 
  escena, 
  t0, 
  accglobal, 
  reloj, 
  orbitCamControls, 
  flyCamControls, 
  renderer,
  camaraOrbital,
  camaraNave
} from "./modules/simObjects";

import { 
  createVisualObjects, 
  estrella, 
  objetos, 
  nubes 
} from "./modules/visualObjects";

let timestamp;

// Se inicializa la simulación
init();
// Se inicial el bucle de animación
animationLoop();

function init() {
  crearInfo();
  createSimObjects();
  createVisualObjects();
  crearGUI();
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
