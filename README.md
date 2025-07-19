# Visor del Sistema Solar
## Agustín Alfonso González Iríbar

Simulación del sistema solar realizada con _three.js_ en la que se encuentran simulados el sol y todos los planetas del Sistema Solar (incluido Plutón).

## Ejecución del proyecto en local

A continuación, se detallan las instrucciones de ejecución del proyecto de forma local en caso de que la version web fallara.

1. Descargar o clonar el repositorio

![Menú de clonación o descarga del repositorio](assets/readme/clonar.png)

2. Descargar e instalar la version mas reciente de ``Node.js`` desde [este enlace](https://nodejs.org/en)

3. Para asegurar que la instalación se realizó correctamente utilizar los siguientes comandos en un terminal o símbolo del sistema:

```
node --version
npm --version
```

4. Una vez correctamente instalado ejecutar el siguiente comando desde un terminal o símbolo del sistema en el directorio o carpeta en el que se encuentre el proyecto:

```
npm install
```

5. Una vez termine el comando anterior ejecutar el siguiente comando desde el mismo terminal o simbolo del sístema:

```
npm run start
```

6. Una vez ejecutado este comando se observará en la consola algo parecido a esto:
```
> planetas-agustin@1.0.0 start
> node server.js

Your app is listening on port 3000
```

7. Abrir un navegador y, en la barra de direcciones, escribir ```localhost:3000``` sustituyendo el 3000 por el número indicado anteriormente.

8. Para terminar la simulación, pulsar la combinación de botones ```Ctrl + C``` en la consola donde se realizó el paso 5


## Controles de la simulación

La simulación incluye un panel de control con diferentes opciones explicadas a continuación.

![Controles de la simulación](assets/readme/controles.png)

### Controles de cámara

Se han implementado dos tipos de camara para la simulación: una `cámara orbital` y una `cámara de nave`. Para cambiar el tipo de camara se hace uso del selector denominado _Vista seleccionada_. En este selector se puede seleccionar los dos modos de camara mencionados además de un tercer modo en el que se muestran las dos cámaras a la vez, quedando la orbital a la izquierda y la de la nave a la derecha.

#### Cámara orbital
![Simulación en modo de cámara orbital](assets/readme/orbital.png)

En este modo la cámara _orbita_ alrededor de alguno de los objetos presentes en la simulación. Se puedo mover la camara arrastrando el ratón por la pantalla. Además se puede hacer _zoom_ utilizando la rueda del ratón hacía delante para aumentarñp y hacía atrás para disminuirlo.

Se puede seleccionar el objeto sobre el que orbita la cámara pulsando con el botón derecho del ratón sobre el objeto deseado o seleccionándolo en el selector denominado _Objeto seleccionado_.

También se puede activar la rotación automática marcando la casilla _Rotación automática_.
![Controles de camara órbital](assets/readme/controles_orbital.png)

#### Cámara de nave

![Simulación en modo de cámara de nave](assets/readme/nave.png)
En este modo la cámara se mueve libremente sobre la escena. Para mover la camara se utilizan las teclas _WASD_ y, para rotar se puede arrastrar con el ratón o utilizar las _teclas direccionales_.

#### Cámara múltiple
![Simulación en modo de cámara múltiple](assets/readme/multiple.png)

Como se ha comentado previamente, la simulación incluye un modo en el que se puede observar la escena desde ambas cámaras.

En la parte superior de la pantalla se incluyen las instrucciones para manejar las camaras seleccionadas.

### Controles de velocidad de rotación y traslación
![Controles de velocidad de la simulación](assets/readme/velocidades.png)

La interfaz de usuario incluye unos selectores que permiten modificar la velocidad de _traslación_ y _rotación_ de todos los objetos presentes. 

### Otras funcionalidades
#### Rotación de los anillos de los planetas
![Controles de rotación de los anillos de un planeta](assets/readme/rotacion_anillos.png)

Al seleccionar un planeta con anillos (`Saturno` o `Urano`) aparecerá en la sección _Planetas_ de la interfaz de usuario unos selectores que permitirán modificar la rotación del anillo de dicho planeta en X, Y, y Z.

## Referencias
Todas las texturas, mapas de rugosidad, mapas de transparencia y el mapa de reflexión especular de la Tierra han sido sacados de [aquí](http://planetpixelemporium.com/planets.html).
