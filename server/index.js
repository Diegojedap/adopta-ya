const http = require('http');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generarContrato } = require('./contrato');

const PUERTO = Number(process.env['PORT'] || 3000);
const CLAVE_JWT = process.env['JWT_SECRET'] || 'adopta-ya-desarrollo';
const ROLES = ['administrador', 'adoptante', 'veterinario'];
const ESTADOS_REVISION = ['aprobada', 'rechazada'];
const ESPECIES_MASCOTA = ['perro', 'gato', 'otro'];
const ESTADOS_MASCOTA = ['disponible', 'en_revision', 'adoptado'];

const mascotas = [
  { id: 1, nombre: 'Max',   especie: 'perro', edad: '2 años', descripcion: 'Amigable, cariñoso y lleno de energía.',        emoji: '🐶', estado: 'disponible', salud: 'Sano. Vacunado y desparasitado.',    vacunas: 'Rabia, parvovirus', esterilizado: true  },
  { id: 2, nombre: 'Luna',  especie: 'gato',  edad: '1 año',  descripcion: 'Tranquila, tierna y busca una familia amorosa.', emoji: '🐱', estado: 'disponible', salud: 'Sana. En buen estado general.',     vacunas: 'Triple felina',     esterilizado: true  },
  { id: 3, nombre: 'Rocky', especie: 'perro', edad: '3 años', descripcion: 'Juguetón, obediente y muy cariñoso.',            emoji: '🐶', estado: 'disponible', salud: 'Sano. Control veterinario al día.', vacunas: 'Rabia',             esterilizado: false }
];
let siguienteMascota = mascotas.reduce((max, m) => Math.max(max, m.id), 0) + 1;

const solicitudes = [];
let siguienteSolicitud = 1;

const evidencias = [];
let siguienteEvidencia = 1;

const usuarios = [];
let siguienteUsuario = 1;

async function sembrarUsuarios() {
  const email = 'admin@adoptaya.local';
  if (await buscarUsuarioPorEmail(email)) return;
  await crearUsuario({
    nombre: 'Administrador',
    email,
    clave_hash: bcrypt.hashSync(process.env['CLAVE_ADMIN'] || 'admin123', 10),
    rol: 'administrador'
  });
}

let pool = null;
let fuenteDatos = 'memoria';
let motivoFalloDatos = null;

async function sembrarUsuarios() {
  const email = 'admin@adoptaya.local';
  if (await buscarUsuarioPorEmail(email)) return;
  await crearUsuario({
    nombre: 'Administrador',
    email,
    clave_hash: bcrypt.hashSync(process.env['CLAVE_ADMIN'] || 'admin123', 10),
    rol: 'administrador'
  });
}

async function conectarBaseDatos() {
  const cfg = {
    host: process.env['DB_HOST'] || '127.0.0.1',
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
    motivoFalloDatos = null;
  } catch (e) {
    pool = null;
    fuenteDatos = 'memoria';
    motivoFalloDatos = e.message;
  }
}

function enviar(res, codigo, datos) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(codigo, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(cuerpo);
}

const RUTA_WEB = path.join(__dirname, '..', 'www');
const TIPOS_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function servirEstatico(req, res, ruta) {
  if (req.method !== 'GET') return false;
  const prefijosApi = ['/auth', '/mascotas', '/solicitudes', '/seguimiento'];
  if (ruta === '/health' || prefijosApi.some(p => ruta === p || ruta.startsWith(p + '/'))) return false;
  const relativa = ruta === '/' ? 'index.html' : decodeURIComponent(ruta).replace(/^\/+/, '');
  const destino = path.resolve(RUTA_WEB, relativa);
  if (!destino.startsWith(RUTA_WEB)) return false;
  if (!fs.existsSync(destino) || fs.statSync(destino).isDirectory()) return false;
  const contenido = fs.readFileSync(destino);
  res.writeHead(200, {
    'Content-Type': TIPOS_MIME[path.extname(destino).toLowerCase()] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(contenido);
  return true;
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

function aBooleano(valor) {
  return valor === true || valor === 1 || valor === '1';
}

function filaMascota(fila) {
  return Object.assign({}, fila, { esterilizado: aBooleano(fila.esterilizado) });
}

function filaSolicitud(fila) {
  return Object.assign({}, fila, { consentimiento: aBooleano(fila.consentimiento) });
}

const NOTA_SUBCONSULTA =
  '(SELECT h.nota FROM historial_estados h WHERE h.solicitud_id = s.id AND h.nota IS NOT NULL ORDER BY h.id DESC LIMIT 1) AS nota';

async function listarMascotas() {
  if (pool) {
    const [filas] = await pool.query('SELECT id, nombre, especie, edad, descripcion, emoji, estado, salud, vacunas, esterilizado FROM mascotas ORDER BY id');
    return filas.map(filaMascota);
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

function normalizarMascota(datos, base) {
  const tomar = (campo, porDefecto) => {
    if (datos[campo] != null) return String(datos[campo]).trim();
    if (base && base[campo] != null) return String(base[campo]);
    return porDefecto;
  };
  const baseEst = base && (base.esterilizado === true || base.esterilizado === 1 || base.esterilizado === '1');
  const est = datos.esterilizado != null
    ? (datos.esterilizado === true || datos.esterilizado === 1 || datos.esterilizado === '1')
    : !!baseEst;
  return {
    nombre: tomar('nombre', ''),
    especie: tomar('especie', 'perro'),
    edad: tomar('edad', ''),
    descripcion: tomar('descripcion', '') || null,
    emoji: tomar('emoji', '') || null,
    estado: tomar('estado', 'disponible'),
    salud: tomar('salud', '') || null,
    vacunas: tomar('vacunas', '') || null,
    esterilizado: est
  };
}

function validarMascota(m) {
  if (!m.nombre || !m.edad) return { error: 'Nombre y edad son obligatorios', codigo: 400 };
  if (!ESPECIES_MASCOTA.includes(m.especie)) return { error: 'Especie inválida', codigo: 400 };
  if (!ESTADOS_MASCOTA.includes(m.estado)) return { error: 'Estado inválido', codigo: 400 };
  return null;
}

async function crearMascota(datos) {
  const m = normalizarMascota(datos, null);
  const invalido = validarMascota(m);
  if (invalido) return invalido;
  if (pool) {
    const [r] = await pool.query(
      'INSERT INTO mascotas (nombre, especie, edad, descripcion, emoji, estado, salud, vacunas, esterilizado) VALUES (?,?,?,?,?,?,?,?,?)',
      [m.nombre, m.especie, m.edad, m.descripcion, m.emoji, m.estado, m.salud, m.vacunas, m.esterilizado ? 1 : 0]
    );
    return Object.assign({ id: r.insertId }, m);
  }
  const mascota = Object.assign({ id: siguienteMascota++ }, m);
  mascotas.push(mascota);
  return mascota;
}

async function actualizarMascota(id, datos) {
  const actual = pool
    ? (await pool.query('SELECT * FROM mascotas WHERE id = ? LIMIT 1', [id]))[0][0]
    : mascotas.find(m => m.id === id);
  if (!actual) return { error: 'Mascota no encontrada', codigo: 404 };
  const m = normalizarMascota(datos, actual);
  const invalido = validarMascota(m);
  if (invalido) return invalido;
  if (pool) {
    await pool.query(
      'UPDATE mascotas SET nombre=?, especie=?, edad=?, descripcion=?, emoji=?, estado=?, salud=?, vacunas=?, esterilizado=? WHERE id=?',
      [m.nombre, m.especie, m.edad, m.descripcion, m.emoji, m.estado, m.salud, m.vacunas, m.esterilizado ? 1 : 0, id]
    );
    return Object.assign({ id }, m);
  }
  Object.assign(actual, m);
  return actual;
}

async function eliminarMascota(id) {
  if (pool) {
    const [r] = await pool.query('DELETE FROM mascotas WHERE id = ?', [id]);
    return r.affectedRows > 0;
  }
  const indice = mascotas.findIndex(m => m.id === id);
  if (indice === -1) return false;
  mascotas.splice(indice, 1);
  return true;
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
      'SELECT s.*, m.nombre AS mascota, ' + NOTA_SUBCONSULTA + ' FROM solicitudes s JOIN mascotas m ON m.id = s.mascota_id ORDER BY s.id DESC'
    );
    return filas.map(filaSolicitud);
  }
  return solicitudes.slice().reverse();
}

async function obtenerSolicitud(id) {
  if (pool) {
    const [filas] = await pool.query(      'SELECT s.*, m.nombre AS mascota, ' + NOTA_SUBCONSULTA + ' FROM solicitudes s JOIN mascotas m ON m.id = s.mascota_id WHERE s.id = ? LIMIT 1', [id]);
    return filas.length ? filaSolicitud(filas[0]) : null;
  }
  return solicitudes.find(s => s.id === id) || null;
}

async function actualizarEstado(id, estado, nota, sesion) {
  if (pool) {
    await pool.query('UPDATE solicitudes SET estado = ?, revisado_en = NOW() WHERE id = ?', [estado, id]);
    await pool.query('INSERT INTO historial_estados (solicitud_id, estado, nota, revisor_id) VALUES (?,?,?,?)',
      [id, estado, nota || null, sesion ? sesion.id : null]);
    return obtenerSolicitud(id);
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

function diasEntre(desde, hasta) {
  if (!desde || !hasta) return 0;
  const inicio = new Date(desde);
  const fin = new Date(hasta);
  const ms = fin - inicio;
  return ms > 0 ? Math.floor(ms / 86400000) : 0;
}

async function listarEvidencias(solicitudId) {
  if (pool) {
    const [filas] = await pool.query(
      'SELECT id, solicitud_id, url, descripcion, creado_en FROM evidencias WHERE solicitud_id = ? ORDER BY id',
      [solicitudId]
    );
    const [sols] = await pool.query('SELECT revisado_en, creado_en FROM solicitudes WHERE id = ? LIMIT 1', [solicitudId]);
    const base = sols.length ? (sols[0].revisado_en || sols[0].creado_en) : null;
    return filas.map(f => Object.assign({}, f, { dia: diasEntre(base, f.creado_en) }));
  }
  return evidencias.filter(e => e.solicitud_id === solicitudId);
}

async function crearEvidencia(solicitud, datos) {
  const descripcion = (datos.descripcion || '').trim();
  const url = (datos.url || '').trim();
  if (!descripcion && !url) return null;
  if (solicitud.estado !== 'aprobada') return { error: 'La adopción debe estar aprobada', codigo: 409 };
  const dia = diasEntre(solicitud.revisado_en || solicitud.creado_en, new Date().toISOString());
  if (pool) {
    const [resultado] = await pool.query(
      'INSERT INTO evidencias (solicitud_id, url, descripcion) VALUES (?,?,?)',
      [solicitud.id, url || null, descripcion || null]
    );
    return { id: resultado.insertId, solicitud_id: solicitud.id, url: url || null, descripcion: descripcion || null, dia, creado_en: new Date().toISOString() };
  }
  const evidencia = {
    id: siguienteEvidencia++,
    solicitud_id: solicitud.id,
    url: url || null,
    descripcion: descripcion || null,
    dia,
    creado_en: new Date().toISOString()
  };
  evidencias.push(evidencia);
  return evidencia;
}

async function alertasSeguimiento() {
  const aprobadas = (await listarSolicitudes()).filter(s => s.estado === 'aprobada');
  const resultado = [];
  for (const s of aprobadas) {
    const evs = await listarEvidencias(s.id);
    const diasAcumulados = diasEntre(s.revisado_en || s.creado_en, new Date().toISOString());
    const ultimoDia = evs.reduce((a, e) => Math.max(a, Number(e.dia) || 0), 0);
    let estadoAlerta = 'al_dia';
    if (diasAcumulados >= 90) {
      estadoAlerta = ultimoDia >= 90 ? 'completada' : 'vencida_final';
    } else if (diasAcumulados >= 60) {
      estadoAlerta = ultimoDia >= 60 ? 'al_dia' : 'vencida';
    } else if (diasAcumulados >= 30) {
      estadoAlerta = ultimoDia >= 30 ? 'al_dia' : 'vencida';
    }
    const proximoHito = diasAcumulados < 30 ? 30 : diasAcumulados < 60 ? 60 : diasAcumulados < 90 ? 90 : null;
    resultado.push({
      solicitud_id: s.id,
      mascota: s.mascota || ('#' + s.mascota_id),
      adoptante: s.solicitante_nombre || null,
      dias_acumulados: diasAcumulados,
      proximo_hito: proximoHito,
      dias_para_hito: proximoHito ? Math.max(0, proximoHito - diasAcumulados) : null,
      cantidad_evidencias: evs.length,
      estado_alerta: estadoAlerta
    });
  }
  return resultado;
}

async function buscarUsuarioPorEmail(email) {
  if (pool) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE email = ? LIMIT 1', [email]);
    return filas.length ? filas[0] : null;
  }
  return usuarios.find(u => u.email === email) || null;
}

async function buscarUsuarioPorId(id) {
  if (pool) {
    const [filas] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
    return filas.length ? filas[0] : null;
  }
  return usuarios.find(u => u.id === id) || null;
}

async function crearUsuario(datos) {
  if (pool) {
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES (?,?,?,?)',
      [datos.nombre, datos.email, datos.clave_hash, datos.rol]
    );
    return { id: resultado.insertId, nombre: datos.nombre, email: datos.email, rol: datos.rol };
  }
  const usuario = { id: siguienteUsuario++, ...datos };
  usuarios.push(usuario);
  return usuario;
}

async function registrar(datos) {
  const nombre = (datos.nombre || '').trim();
  const email = (datos.email || '').trim().toLowerCase();
  const clave = datos.clave || '';
  if (!nombre || !email || !clave) return { error: 'Nombre, email y clave son obligatorios' };
  if (await buscarUsuarioPorEmail(email)) return { error: 'El email ya está registrado', codigo: 409 };
  const rol = ROLES.includes(datos.rol) ? datos.rol : 'adoptante';
  const usuario = await crearUsuario({ nombre, email, clave_hash: bcrypt.hashSync(clave, 10), rol });
  return { usuario: publico(usuario) };
}

async function ingresar(datos) {
  const email = (datos.email || '').trim().toLowerCase();
  const clave = datos.clave || '';
  const usuario = await buscarUsuarioPorEmail(email);
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
      const resultado = await registrar(await leerCuerpo(req));
      if (resultado.error) return enviar(res, resultado.codigo || 400, { error: resultado.error });
      return enviar(res, 201, resultado.usuario);
    }

    if (req.method === 'POST' && ruta === '/auth/login') {
      const resultado = await ingresar(await leerCuerpo(req));
      if (resultado.error) return enviar(res, resultado.codigo, { error: resultado.error });
      return enviar(res, 200, resultado);
    }

    if (req.method === 'GET' && ruta === '/auth/perfil') {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      const usuario = await buscarUsuarioPorId(sesion.id);
      return usuario ? enviar(res, 200, publico(usuario)) : enviar(res, 401, { error: 'No autenticado' });
    }

    function soloAdministrador() {
      const sesion = autenticar(req);
      if (!sesion) return { error: 'No autenticado', codigo: 401 };
      if (sesion.rol !== 'administrador') return { error: 'Solo administradores', codigo: 403 };
      return null;
    }

    if (req.method === 'GET' && ruta === '/mascotas') {
      return enviar(res, 200, await listarMascotas());
    }

    if (req.method === 'POST' && ruta === '/mascotas') {
      const denegado = soloAdministrador();
      if (denegado) return enviar(res, denegado.codigo, { error: denegado.error });
      const creada = await crearMascota(await leerCuerpo(req));
      if (creada.error) return enviar(res, creada.codigo, { error: creada.error });
      return enviar(res, 201, creada);
    }

    const mascotaRuta = ruta.match(/^\/mascotas\/(\d+)$/);

    if (req.method === 'GET' && mascotaRuta) {
      const id = Number(mascotaRuta[1]);
      const todas = await listarMascotas();
      const mascota = todas.find(m => m.id === id);
      return mascota ? enviar(res, 200, mascota) : enviar(res, 404, { error: 'Mascota no encontrada' });
    }

    if (req.method === 'PUT' && mascotaRuta) {
      const denegado = soloAdministrador();
      if (denegado) return enviar(res, denegado.codigo, { error: denegado.error });
      const actualizada = await actualizarMascota(Number(mascotaRuta[1]), await leerCuerpo(req));
      if (actualizada.error) return enviar(res, actualizada.codigo, { error: actualizada.error });
      return enviar(res, 200, actualizada);
    }

    if (req.method === 'DELETE' && mascotaRuta) {
      const denegado = soloAdministrador();
      if (denegado) return enviar(res, denegado.codigo, { error: denegado.error });
      const id = Number(mascotaRuta[1]);
      const eliminada = await eliminarMascota(id);
      return eliminada ? enviar(res, 200, { eliminado: id }) : enviar(res, 404, { error: 'Mascota no encontrada' });
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

    const contrato = ruta.match(/^\/solicitudes\/(\d+)\/contrato$/);
    if (req.method === 'GET' && contrato) {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      const id = Number(contrato[1]);
      const solicitud = await obtenerSolicitud(id);
      if (!solicitud) return enviar(res, 404, { error: 'Solicitud no encontrada' });
      const esAdmin = sesion.rol === 'administrador';
      const esDueno = solicitud.adoptante_id != null && solicitud.adoptante_id === sesion.id;
      if (!esAdmin && !esDueno) return enviar(res, 403, { error: 'Sin permiso' });
      if (solicitud.estado !== 'aprobada') return enviar(res, 409, { error: 'La solicitud no está aprobada' });
      const pdf = generarContrato(solicitud);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="contrato-adopta-ya-' + id + '.pdf"',
        'Access-Control-Allow-Origin': '*'
      });
      return res.end(pdf);
    }

    const evidencia = ruta.match(/^\/solicitudes\/(\d+)\/evidencias$/);
    if (req.method === 'POST' && evidencia) {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      const id = Number(evidencia[1]);
      const solicitud = await obtenerSolicitud(id);
      if (!solicitud) return enviar(res, 404, { error: 'Solicitud no encontrada' });
      const esAdmin = sesion.rol === 'administrador';
      const esDueno = solicitud.adoptante_id != null && solicitud.adoptante_id === sesion.id;
      if (!esAdmin && !esDueno) return enviar(res, 403, { error: 'Sin permiso' });
      const creada = await crearEvidencia(solicitud, await leerCuerpo(req));
      if (creada && creada.error) return enviar(res, creada.codigo, { error: creada.error });
      return creada ? enviar(res, 201, creada) : enviar(res, 400, { error: 'Descripción o URL requeridas' });
    }

    if (req.method === 'GET' && evidencia) {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      const id = Number(evidencia[1]);
      const solicitud = await obtenerSolicitud(id);
      if (!solicitud) return enviar(res, 404, { error: 'Solicitud no encontrada' });
      const esAdmin = sesion.rol === 'administrador';
      const esDueno = solicitud.adoptante_id != null && solicitud.adoptante_id === sesion.id;
      if (!esAdmin && !esDueno) return enviar(res, 403, { error: 'Sin permiso' });
      return enviar(res, 200, await listarEvidencias(id));
    }

    if (req.method === 'GET' && ruta === '/seguimiento/alertas') {
      const sesion = autenticar(req);
      if (!sesion) return enviar(res, 401, { error: 'No autenticado' });
      if (sesion.rol !== 'administrador') return enviar(res, 403, { error: 'Solo administradores' });
      return enviar(res, 200, await alertasSeguimiento());
    }

    if (servirEstatico(req, res, ruta)) return;

    return enviar(res, 404, { error: 'Ruta no encontrada' });
  } catch (e) {
    return enviar(res, 500, { error: 'Error interno' });
  }
});

(async () => {
  await conectarBaseDatos();
  await sembrarUsuarios();
  servidor.listen(PUERTO, () => {
    console.log('API ¡ADOPTA YA! en http://localhost:' + PUERTO + ' (datos: ' + fuenteDatos + ')');
    if (fuenteDatos === 'mysql') {
      console.log('Web y API disponibles en http://localhost:' + PUERTO);
    } else {
      console.log('Aviso: MySQL no disponible (' + (motivoFalloDatos || 'sin conexión') + '); usando store en memoria.');
      console.log('Ejecuta "npm run db:iniciar" y "npm run db:preparar" para usar la base de datos.');
    }
  });
})();
