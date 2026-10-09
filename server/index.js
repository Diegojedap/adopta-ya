const http = require('http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PUERTO = Number(process.env['PORT'] || 3000);
const CLAVE_JWT = process.env['JWT_SECRET'] || 'adopta-ya-desarrollo';
const ROLES = ['administrador', 'adoptante', 'veterinario'];
const ESTADOS_REVISION = ['aprobada', 'rechazada'];

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

async function resolverMascota(datos) {
  const id = Number(datos.mascota_id);
  if (pool) {
    if (id) {
      const [filas] = await pool.query('SELECT id, nombre FROM mascotas WHERE id = ? LIMIT 1', [id]);
      return filas.length ? filas[0] : null;
    }
    if (datos.mascota) {
      const [filas] = await pool.query('SELECT id, nombre FROM mascotas WHERE nombre = ? LIMIT 1', [datos.mascota]);
      return filas.length ? filas[0] : null;
    }
    return null;
  }
  if (id) return mascotas.find(m => m.id === id) || null;
  if (datos.mascota) return mascotas.find(m => m.nombre === datos.mascota) || null;
  return null;
}

async function crearSolicitud(datos, sesion) {
  const mascota = await resolverMascota(datos);
  if (!mascota) return null;

  const base = {
    mascota_id: mascota.id,
    mascota: mascota.nombre,
    adoptante_id: sesion ? sesion.id : null,
    solicitante_nombre: (datos.nombre || '').trim() || null,
    solicitante_email: (datos.email || '').trim().toLowerCase() || null,
    solicitante_telefono: (datos.telefono || '').trim() || null,
    motivacion: (datos.motivacion || '').trim() || null,
    consentimiento: datos.consentimiento === true,
    estado: 'en_revision'
  };

  if (pool) {
    const [resultado] = await pool.query(
      'INSERT INTO solicitudes (mascota_id, adoptante_id, solicitante_nombre, solicitante_email, solicitante_telefono, motivacion, consentimiento, estado) VALUES (?,?,?,?,?,?,?,?)',
      [base.mascota_id, base.adoptante_id, base.solicitante_nombre, base.solicitante_email, base.solicitante_telefono, base.motivacion, base.consentimiento ? 1 : 0, 'en_revision']
    );
    return Object.assign({ id: resultado.insertId, creado_en: new Date().toISOString() }, base);
  }

  const solicitud = Object.assign({
    id: siguienteSolicitud++,
    creado_en: new Date().toISOString(),
    revisado_en: null,
    historial: [{ estado: 'en_revision', nota: null, revisor: null, creado_en: new Date().toISOString() }]
  }, base);
  solicitudes.push(solicitud);
  return solicitud;
}

async function listarSolicitudes() {
  if (pool) {
    const [filas] = await pool.query(
      'SELECT s.*, m.nombre AS mascota FROM solicitudes s JOIN mascotas m ON m.id = s.mascota_id ORDER BY s.id DESC'
    );
    return filas;
  }
  return solicitudes.slice().reverse();
}

async function actualizarEstado(id, estado, nota, sesion) {
  if (pool) {
    await pool.query('UPDATE solicitudes SET estado = ?, revisado_en = NOW() WHERE id = ?', [estado, id]);
    await pool.query('INSERT INTO historial_estados (solicitud_id, estado, nota, revisor_id) VALUES (?,?,?,?)',
      [id, estado, nota || null, sesion ? sesion.id : null]);
    const [filas] = await pool.query('SELECT * FROM solicitudes WHERE id = ?', [id]);
    return filas.length ? filas[0] : null;
  }
  const solicitud = solicitudes.find(s => s.id === id);
  if (!solicitud) return null;
  solicitud.estado = estado;
  solicitud.revisado_en = new Date().toISOString();
  solicitud.historial.push({
    estado: estado,
    nota: nota || null,
    revisor: sesion ? sesion.email : null,
    creado_en: new Date().toISOString()
  });
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
      const sesion = autenticar(req);
      const solicitud = await crearSolicitud(await leerCuerpo(req), sesion);
      return solicitud
        ? enviar(res, 201, solicitud)
        : enviar(res, 400, { error: 'Mascota inválida' });
    }

    if (req.method === 'GET' && ruta === '/solicitudes') {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      if (sesion.rol !== 'administrador') return enviar(res, 403, { error: 'Solo administradores' });
      return enviar(res, 200, await listarSolicitudes());
    }

    const revision = ruta.match(/^\/solicitudes\/(\d+)\/estado$/);
    if (req.method === 'POST' && revision) {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      if (sesion.rol !== 'administrador') return enviar(res, 403, { error: 'Solo administradores' });
      const cuerpo = await leerCuerpo(req);
      if (!ESTADOS_REVISION.includes(cuerpo.estado)) return enviar(res, 400, { error: 'Estado inválido' });
      const solicitud = await actualizarEstado(Number(revision[1]), cuerpo.estado, cuerpo.nota, sesion);
      return solicitud ? enviar(res, 200, solicitud) : enviar(res, 404, { error: 'Solicitud no encontrada' });
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
