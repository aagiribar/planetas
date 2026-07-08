import { GUI } from "lil-gui";
import { orbitCamControls, flyCamControls } from "./simObjects";
import { objetos } from "./visualObjects";

// Creación de la interfaz de usuario
export const gui = new GUI();

let elementosUI;
let selectorRotacion;
export let selectorCamara;
export let carpetaRotacion;
export let rotacionAnilloX, rotacionAnilloY, rotacionAnilloZ;
export let focoCamara;
export let usarVistaNave = false;
export let usarVistaOrbital = true;
let info, infoCamaraOrbital, infoCamaraNave;
export let velocidadTraslacion = 1;
export let velocidadRotacion = 1;

export function crearGUI() {
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
        focoCamara = objetos.find((objeto) => {
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
        focoCamara.userData.anillo.rotation.x = valor;
    });

    rotacionAnilloY.onChange(function (valor) {
        focoCamara.userData.anillo.rotation.y = valor;
    });

    rotacionAnilloZ.onChange(function (valor) {
        focoCamara.userData.anillo.rotation.z = valor;
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

export function crearInfo() {
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
}

// Función para obtener un array con el nombre de los objetos creados
function obtenerNombresObjetos() {
    let nombres = []
    for (const objeto of objetos) {
        nombres.push(objeto.userData.nombre)
    }
    return nombres;
}
export function setFocoCamara(object) {
    focoCamara = object;
}