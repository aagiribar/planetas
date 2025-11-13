import * as THREE from "three";

// Carga de las texturas, mapas de rugosidad y mapas de transparencia de los planetas y sus anillos
export const tx_merc = new THREE.TextureLoader().load(
    "/assets/8k_mercury.jpg"
);

export const bump_merc = new THREE.TextureLoader().load(
    "/assets/mercurybump.jpg"
);

export const tx_venus = new THREE.TextureLoader().load(
    "/assets/8k_venus_surface.jpg"
);

export const tx_venus_atmos = new THREE.TextureLoader().load(
    "/assets/4k_venus_atmosphere.jpg"
);

export const bump_venus = new THREE.TextureLoader().load(
    "/assets/venusbump.jpg"
);

export const tx_tierra = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_daymap.jpg"
);

export const tx_tierra_noche = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_nightmap.jpg"
);

export const bump_tierra = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_normal_map.tif"
);

export const spec_tierra = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_specular_map.tif"
);

export const nubes_tierra = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_clouds.jpg"
);

export const trans_nubes = new THREE.TextureLoader().load(
    "/assets/earth/8k_earth_clouds.jpg"
);

export const tx_luna = new THREE.TextureLoader().load(
    "/assets/8k_moon.jpg"
);

export const tx_marte = new THREE.TextureLoader().load(
    "/assets/8k_mars.jpg"
);

export const bump_marte = new THREE.TextureLoader().load(
    "/assets/marsbump1k.jpg"
);

export const tx_jupiter = new THREE.TextureLoader().load(
    "/assets/8k_jupiter.jpg"
);

export const tx_saturno = new THREE.TextureLoader().load(
    "/assets/8k_saturn.jpg"
);

export const tx_anillo_sat = new THREE.TextureLoader().load(
    "/assets/8k_saturn_ring_alpha.png"
);

export const trans_anillo_sat = new THREE.TextureLoader().load(
    "/assets/saturnringpattern.gif"
);

export const tx_urano = new THREE.TextureLoader().load(
    "/assets/2k_uranus.jpg"
);

export const tx_anillo_ur = new THREE.TextureLoader().load(
    "/assets/uranusringcolour.jpg"
);

export const trans_anillo_ur = new THREE.TextureLoader().load(
    "/assets/uranusringtrans.gif"
);

export const tx_neptuno = new THREE.TextureLoader().load(
    "/assets/2k_neptune.jpg"
);

export const tx_pluton = new THREE.TextureLoader().load(
    "/assets/plutomap2k.jpg"
);

export const bump_pluton = new THREE.TextureLoader().load(
    "/assets/plutobump2k.jpg"
);

// Carga de la textura del fondo de estrellas
export const cubeTexture = new THREE.CubeTextureLoader().load([
    "/assets/skybox/px.png",
    "/assets/skybox/nx.png",
    "/assets/skybox/py.png",
    "/assets/skybox/ny.png",
    "/assets/skybox/pz.png",
    "/assets/skybox/nz.png",
]);