const http = require('http');

const PUERTO = Number(process.env['PORT'] || 3000);

const mascotas = [
  { id: 1, nombre: 'Max',   especie: 'perro', edad: '2 años', descripcion: 'Amigable, cariñoso y lleno de energía.',        emoji: '🐶', estado: 'disponible' },
  { id: 2, nombre: 'Luna',  especie: 'gato',  edad: '1 año',  descripcion: 'Tranquila, tierna y busca una familia amorosa.', emoji: '🐱', estado: 'disponible' },
  { id: 3, nombre: 'Rocky', especie: 'perro', edad: '3 años', descripcion: 'Juguetón, obediente y muy cariñoso.',            emoji: '🐶', estado: 'disponible' }
];

const solicitudes = [];
let siguienteSolicitud = 1;

let pool = null;
let fuenteDatos = 'memoria';

async function conectarBaseDatos() {
  const cfg = {
    host: process.env['DB_HOST'] || 'localhost',
    port: Number(process.env['DB_PORT'] || 3307),
    user: process.env['DB_USER'] || 'root',
    database: process.env['DB_NAME'] || 'adoptaya'
  };
  if (process.env['DB_PASSWORD']) cfg.password = process.env['DB_PASSWORD'];
  try {
    const mysql = require('mysql2/promise');
    pool = mysql.createPool(cfg);
    await pool.query('SELECT 1');
    fuenteDatos = 'mysql';
  } catch (e) {
    pool = null;
    fuenteDatos = 'memoria';
  }
}

function enviar(res, codigo, datos) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(cuerpo);
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let datos = '';
    req.on('data', c => { datos += c; });
    req.on('end', () => {
      if (!datos) return resolve({});
      try { resolve(JSON.parse(datos)); } catch (e) { resolve({}); }
    });
  });
}

async function listarMascotas() {
  if (pool) {
    const [filas] = await pool.query('SELECT id, nombre, especie, edad, descripcion, emoji, estado FROM mascotas ORDER BY id');
    return filas;
  }
  return mascotas;
}

async function crearSolicitud(datos) {
  const idMascota = Number(datos.mascota_id);
  const nombreMascota = datos.mascota || null;
  if (pool) {
    let id = idMascota;
    if (!id && nombreMascota) {
      const [filas] = await pool.query('SELECT id FROM mascotas WHERE nombre = ? LIMIT 1', [nombreMascota]);
      id = filas.length ? filas[0].id : null;
    }
    if (!id) return null;
    const [resultado] = await pool.query(
      'INSERT INTO solicitudes (mascota_id, estado) VALUES (?, ?)',
      [id, 'en_revision']
    );
    return { id: resultado.insertId, mascota_id: id, estado: 'en_revision' };
  }
  let id = idMascota;
  if (!id && nombreMascota) {
    const encontrada = mascotas.find(m => m.nombre === nombreMascota);
    id = encontrada ? encontrada.id : null;
  }
  if (!id) return null;
  const solicitud = { id: siguienteSolicitud++, mascota_id: id, estado: 'en_revision', creado_en: new Date().toISOString() };
  solicitudes.push(solicitud);
  return solicitud;
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const ruta = url.pathname;

  if (req.method === 'OPTIONS') return enviar(res, 204, {});

  try {
    if (req.method === 'GET' && ruta === '/health') {
      return enviar(res, 200, { ok: true, fuente: fuenteDatos });
    }

    if (req.method === 'GET' && ruta === '/mascotas') {
      return enviar(res, 200, await listarMascotas());
    }

    if (req.method === 'GET' && ruta.startsWith('/mascotas/')) {
      const id = Number(ruta.split('/')[2]);
      const todas = await listarMascotas();
      const mascota = todas.find(m => m.id === id);
      return mascota ? enviar(res, 200, mascota) : enviar(res, 404, { error: 'Mascota no encontrada' });
    }

    if (req.method === 'POST' && ruta === '/solicitudes') {
      const datos = await leerCuerpo(req);
      const solicitud = await crearSolicitud(datos);
      return solicitud
        ? enviar(res, 201, solicitud)
        : enviar(res, 400, { error: 'Mascota inválida' });
    }

    return enviar(res, 404, { error: 'Ruta no encontrada' });
  } catch (e) {
    return enviar(res, 500, { error: 'Error interno' });
  }
});

conectarBaseDatos().finally(() => {
  servidor.listen(PUERTO, () => {
    console.log('API ¡ADOPTA YA! en http://localhost:' + PUERTO + ' (datos: ' + fuenteDatos + ')');
  });
});
