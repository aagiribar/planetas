import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { objetos } from "./visualObjects";
import { setFocoCamara, selectorCamara, focoCamara } from "./gui";

export let escena, renderer, camaraOrbital, camaraNave;
let luz;
let luzAmbiental;
let raycaster;
export let orbitCamControls, flyCamControls;

export let t0 = 0;
export let accglobal = 0.001;
export let reloj;

export function createSimObjects() {
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