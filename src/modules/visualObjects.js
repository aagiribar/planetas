import * as THREE from "three";

import {
    cubeTexture,
    tx_sol,
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
} from "./textures";

import { escena } from "./simObjects";
import { setFocoCamara } from "./gui";

export let estrella;
export let objetos = [];
let anillos = [];
export let nubes;

export function createVisualObjects() {
    // Creación de el objeto que representa al sol
    Estrella(10, tx_sol);
    // Al empezar la simulación la camara orbita alrededor del sol
    setFocoCamara(estrella);

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