const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PUERTO = Number(process.env['PORT'] || 3000);
const CLAVE_JWT = process.env['JWT_SECRET'] || 'adopta-ya-desarrollo';
const ROLES = ['administrador', 'adoptante', 'veterinario'];

const mascotas = [
  { id: 1, nombre: 'Max',   especie: 'perro', edad: '2 años', descripcion: 'Amigable, cariñoso y lleno de energía.',        emoji: '🐶', estado: 'disponible' },
  { id: 2, nombre: 'Luna',  especie: 'gato',  edad: '1 año',  descripcion: 'Tranquila, tierna y busca una familia amorosa.', emoji: '🐱', estado: 'disponible' },
  { id: 3, nombre: 'Rocky', especie: 'perro', edad: '3 años', descripcion: 'Juguetón, obediente y muy cariñoso.',            emoji: '🐶', estado: 'disponible' }
];

const solicitudes = [];
let siguienteSolicitud = 1;

const usuarios = [];
let siguienteUsuario = 1;

let pool = null;
let fuenteDatos = 'memoria';

function sembrarUsuarios() {
  if (usuarios.length) return;
  usuarios.push({
    id: siguienteUsuario++,
    nombre: 'Administrador',
    email: 'admin@adoptaya.local',
    clave_hash: bcrypt.hashSync(process.env['CLAVE_ADMIN'] || 'admin123', 10),
    rol: 'administrador'
  });
}

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

function publico(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
}

function autenticar(req) {
  const cabecera = req.headers['authorization'] || '';
  const partes = cabecera.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') return null;
  try {
    return jwt.verify(partes[1], CLAVE_JWT);
  } catch (e) {
    return null;
  }
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

function registrar(datos) {
  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim().toLowerCase();
  const clave = datos.clave || '';
  if (!nombre || !email || !clave) return { error: 'Nombre, email y clave son obligatorios' };
  if (usuarios.some(u => u.email === email)) return { error: 'El email ya está registrado', codigo: 409 };
  const rol = ROLES.includes(datos.rol) ? datos.rol : 'adoptante';
  const usuario = {
    id: siguienteUsuario++,
    nombre,
    email,
    clave_hash: bcrypt.hashSync(clave, 10),
    rol
  };
  usuarios.push(usuario);
  return { usuario: publico(usuario) };
}

function ingresar(datos) {
  const email = (datos.email || '').trim().toLowerCase();
  const clave = datos.clave || '';
  const usuario = usuarios.find(u => u.email === email);
  if (!usuario || !bcrypt.compareSync(clave, usuario.clave_hash)) {
    return { error: 'Credenciales inválidas', codigo: 401 };
  }
  const token = jwt.sign({ id: usuario.id, email: usuario.email, rol: usuario.rol }, CLAVE_JWT, { expiresIn: '1d' });
  return { token, usuario: publico(usuario) };
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const ruta = url.pathname;

  if (req.method === 'OPTIONS') return enviar(res, 204, {});

  try {
    if (req.method === 'GET' && ruta === '/health') {
      return enviar(res, 200, { ok: true, fuente: fuenteDatos });
    }

    if (req.method === 'POST' && ruta === '/auth/registro') {
      const resultado = registrar(await leerCuerpo(req));
      if (resultado.error) return enviar(res, resultado.codigo || 400, { error: resultado.error });
      return enviar(res, 201, resultado.usuario);
    }

    if (req.method === 'POST' && ruta === '/auth/login') {
      const resultado = ingresar(await leerCuerpo(req));
      if (resultado.error) return enviar(res, resultado.codigo, { error: resultado.error });
      return enviar(res, 200, resultado);
    }

    if (req.method === 'GET' && ruta === '/auth/perfil') {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      const usuario = usuarios.find(u => u.id === sesion.id);
      return usuario ? enviar(res, 200, publico(usuario)) : enviar(res, 401, { error: 'No autenticado' });
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

sembrarUsuarios();
conectarBaseDatos().finally(() => {
  servidor.listen(PUERTO, () => {
    console.log('API ¡ADOPTA YA! en http://localhost:' + PUERTO + ' (datos: ' + fuenteDatos + ')');
  });
});
