// Prepara la base de datos local MySQL de ¡ADOPTA YA! (M-17).
//   node sql/preparar_bd.js          → crea la BD/tablas si no existen y siembra lo que falte
//   node sql/preparar_bd.js --reset  → borra las tablas y vuelve a sembrar (UAT y pruebas)
//
// Requiere el servidor MySQL local corriendo (npm run db:iniciar) en DB_HOST:DB_PORT.
// Variables (valores por defecto entre paréntesis): DB_HOST (127.0.0.1), DB_PORT (3307),
// DB_USER (root), DB_PASSWORD (vacía), DB_NAME (adoptaya), CLAVE_ADMIN (admin123).
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const BD = process.env.DB_NAME || 'adoptaya';
const RESET = process.argv.includes('--reset');

const CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const MASCOTAS_SEMILLA = [
  { nombre: 'Max',   especie: 'perro', edad: '2 años', descripcion: 'Amigable, cariñoso y lleno de energía.',        emoji: '🐶', estado: 'disponible', salud: 'Sano. Vacunado y desparasitado.',    vacunas: 'Rabia, parvovirus', esterilizado: 1 },
  { nombre: 'Luna',  especie: 'gato',  edad: '1 año',  descripcion: 'Tranquila, tierna y busca una familia amorosa.', emoji: '🐱', estado: 'disponible', salud: 'Sana. En buen estado general.',     vacunas: 'Triple felina',     esterilizado: 1 },
  { nombre: 'Rocky', especie: 'perro', edad: '3 años', descripcion: 'Juguetón, obediente y muy cariñoso.',            emoji: '🐶', estado: 'disponible', salud: 'Sano. Control veterinario al día.', vacunas: 'Rabia',             esterilizado: 0 }
];

const TABLAS = ['evidencias', 'historial_estados', 'solicitudes', 'mascotas', 'usuarios'];

async function contar(conexion, tabla, condicion, parametros) {
  const [filas] = await conexion.query('SELECT COUNT(*) AS total FROM ' + tabla + ' WHERE ' + condicion, parametros || []);
  return Number(filas[0].total);
}

async function existeColumna(conexion, tabla, columna) {
  const [filas] = await conexion.query(
    'SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [tabla, columna]
  );
  return Number(filas[0].total) > 0;
}

// Migración idempotente para bases creadas antes del login con Google (#11).
async function migrarUsuariosGoogle(conexion) {
  await conexion.query('ALTER TABLE usuarios MODIFY COLUMN clave_hash VARCHAR(255) NULL');
  if (!(await existeColumna(conexion, 'usuarios', 'proveedor'))) {
    await conexion.query("ALTER TABLE usuarios ADD COLUMN proveedor ENUM('local','google') NOT NULL DEFAULT 'local'");
  }
  if (!(await existeColumna(conexion, 'usuarios', 'google_sub'))) {
    await conexion.query('ALTER TABLE usuarios ADD COLUMN google_sub VARCHAR(64) NULL UNIQUE');
  }
}

async function main() {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const esquema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await conexion.query(esquema);
  await conexion.changeUser({ database: process.env.DB_NAME || 'adoptaya' });
  await migrarUsuariosGoogle(conexion);

  if (process.argv.includes('--reset')) {
    await conexion.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const tabla of TABLAS) await conexion.query('TRUNCATE TABLE ' + tabla);
    await conexion.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  let totalMascotas = await contar(conexion, 'mascotas', '1 = 1');
  if (totalMascotas === 0) {
    for (const m of MASCOTAS_SEMILLA) {
      await conexion.query(
        'INSERT INTO mascotas (nombre, especie, edad, descripcion, emoji, estado, salud, vacunas, esterilizado) VALUES (?,?,?,?,?,?,?,?,?)',
        [m.nombre, m.especie, m.edad, m.descripcion, m.emoji, m.estado, m.salud, m.vacunas, m.esterilizado]
      );
    }
    totalMascotas = await contar(conexion, 'mascotas', '1 = 1');
  }

  const emailAdmin = 'admin@adoptaya.local';
  if (await contar(conexion, 'usuarios', 'email = ?', [emailAdmin]) === 0) {
    const clave = process.env.CLAVE_ADMIN || 'admin123';
    await conexion.query(
      'INSERT INTO usuarios (nombre, email, clave_hash, rol) VALUES (?,?,?,?)',
      ['Administrador', emailAdmin, bcrypt.hashSync(clave, 10), 'administrador']
    );
  }

  const nombreBd = process.env.DB_NAME || 'adoptaya';
  console.log('Base de datos "' + nombreBd + '" ' + (RESET ? 'reiniciada' : 'preparada') + '.');
  console.log('  mascotas: ' + totalMascotas + ' · usuarios: ' + await contar(conexion, 'usuarios', '1 = 1'));
  await conexion.end();
}

main().catch((e) => {
  console.error('No se pudo preparar la base de datos:', e.message);
  console.error('¿Está corriendo el servidor? Ejecuta `npm run db:iniciar`.');
  process.exit(1);
});
