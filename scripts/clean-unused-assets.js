#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.resolve(projectRoot, 'assets');
const exts = ['.png', '.jpg', '.jpeg', '.gif', '.tif', '.tiff', '.webp', '.svg'];

// Recorrer directorios y archivos
function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, cb);
    else cb(full);
  }
}

// Verificar si es un archivo de texto
function isTextFile(file) {
  return ['.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json'].includes(path.extname(file).toLowerCase());
}

// Coleccionar referencias a assets
function collectReferences() {
  const refs = new Set();
  walk(projectRoot, (file) => {
    const rel = path.relative(projectRoot, file);
    // omitir node_modules y assets
    if (rel.split(path.sep)[0] === 'node_modules') return;
    if (rel.split(path.sep)[0] === 'assets') return;
    if (!isTextFile(file)) return;
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (e) { return; }
    // regex para encontrar /assets/... o assets/... 
    const re = /(\/?assets\/[^\s"'`)\]]+\.(?:png|jpe?g|gif|tif|tiff|webp|svg))/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      const raw = m[1];
      let cleaned = raw.replace(/^\/+/, ''); // quitar slash inicial
      // normalizar slashes y convertir a minúsculas para comparación
      const normalized = cleaned.split('/').join(path.sep).toLowerCase();
      // aceptar solo si apunta dentro del directorio de assets
      const abs = path.resolve(projectRoot, normalized);
      if (abs.startsWith(assetsDir)) {
        const relToAssets = path.relative(assetsDir, abs).split(path.sep).join('/');
        refs.add(relToAssets.toLowerCase());
      }
    }
  });
  return refs;
}

// Listar archivos en el directorio de assets
function listAssetFiles() {
  const files = [];
  if (!fs.existsSync(assetsDir)) return files;
  walk(assetsDir, (f) => {
    // Obtener la ruta relativa dentro de assets y normalizar separadores
    const relPath = path.relative(assetsDir, f);
    const relSegments = relPath.split(path.sep);
    // Ignorar cualquier archivo que esté dentro de la carpeta "readme" (case-insensitive)
    if (relSegments.length > 0 && relSegments[0].toLowerCase() === 'readme') return;
    if (exts.includes(path.extname(f).toLowerCase())) {
      const rel = relPath.split(path.sep).join('/');
      files.push({ abs: f, rel: rel.toLowerCase() });
    }
  });
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const doDelete = args.includes('--delete');
  const assumeYes = args.includes('--yes');

  console.log('Proyecto root:', projectRoot);
  console.log('Assets dir  :', assetsDir);
  const refs = collectReferences();
  const assets = listAssetFiles();

  const unused = assets.filter(a => !refs.has(a.rel));

  if (unused.length === 0) {
    console.log('No se encontraron archivos de imagen sin referencia.');
    return;
  }

  console.log('\nArchivos de imagen detectados en assets:', assets.length);
  console.log('Archivos NO referenciados encontrados:', unused.length);
  unused.forEach(u => console.log('  -', u.rel));

  if (!doDelete) {
    console.log('\nModo dry-run: para eliminar ejecutar con --delete');
    return;
  }

  if (!assumeYes) {
    // petición de confirmación
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write('\n¿Borrar los archivos listados? (yes/no) ');
    stdin.setEncoding('utf8');
    stdin.once('data', function(data) {
      const resp = data.toString().trim().toLowerCase();
      if (resp === 'yes' || resp === 'y') {
        performDelete(unused);
      } else {
        console.log('Operación cancelada.');
        process.exit(0);
      }
    });
  } else {
    performDelete(unused);
  }
}

function performDelete(list) {
  for (const item of list) {
    try {
      fs.unlinkSync(item.abs);
      console.log('Borrado:', item.rel);
      // intentar eliminar carpetas vacías ascendiendo hasta assetsDir
      let dir = path.dirname(item.abs);
      while (dir !== assetsDir) {
        if (fs.readdirSync(dir).length === 0) {
          fs.rmdirSync(dir);
          dir = path.dirname(dir);
        } else break;
      }
    } catch (e) {
      console.error('Error borrando', item.rel, e.message);
    }
  }
  console.log('Eliminación completada.');
}

main();