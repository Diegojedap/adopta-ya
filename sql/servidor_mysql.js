// Arranca, detiene o consulta el estado del servidor MySQL local portátil de ¡ADOPTA YA!
// El servidor NO se instala como servicio (no requiere permisos de administrador):
// vive en MYSQL_HOME y escucha en DB_PORT (por defecto 3307), solo en 127.0.0.1.
//
// Uso:
//   node sql/servidor_mysql.js iniciar
//   node sql/servidor_mysql.js detener
//   node sql/servidor_mysql.js estado
//
// Variables (con valores por defecto):
//   MYSQL_HOME  carpeta que contiene bin/mysqld.exe y my.ini
//   DB_PORT     puerto de escucha (3307)
//   DB_USER     usuario administrador local (root)
//   DB_PASSWORD contraseña (vacía en local)
const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');
const path = require('path');

const MYSQL_HOME = process.env.MYSQL_HOME || 'C:\\Users\\diego_ojeda\\mysql';
const MYSQLD = path.join(MYSQL_HOME, 'bin', 'mysqld.exe');
const MYSQLADMIN = path.join(MYSQL_HOME, 'bin', 'mysqladmin.exe');
const MY_INI = path.join(MYSQL_HOME, 'my.ini');
const PUERTO = Number(process.env.DB_PORT || 3307);
const USUARIO = process.env.DB_USER || 'root';
const CLAVE = process.env.DB_PASSWORD || '';
const accion = (process.argv[2] || '').toLowerCase();

function puertoAbierto() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port: PUERTO });
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('error', () => resolve(false));
    socket.setTimeout(1000, () => { socket.destroy(); resolve(false); });
  });
}

async function iniciar() {
  if (await puertoAbierto()) {
    console.log('MySQL ya responde en 127.0.0.1:' + PUERTO + '.');
    return;
  }
  if (!fs.existsSync(MYSQLD)) {
    console.error('No se encuentra ' + MYSQLD + '. Define la variable MYSQL_HOME.');
    process.exit(1);
  }
  const argumentos = fs.existsSync(MY_INI) ? ['--defaults-file=' + MY_INI] : [];
  const hijo = spawn(MYSQLD, argumentos, { detached: true, stdio: 'ignore' });
  hijo.unref();
  for (let intento = 0; intento < 30; intento++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await puertoAbierto()) {
      console.log('MySQL iniciado en 127.0.0.1:' + PUERTO + ' (PID ' + hijo.pid + ').');
      return;
    }
  }
  console.error('MySQL no respondió en el puerto ' + PUERTO + '. Revisa ' + path.join(MYSQL_HOME, 'mysql-error.log') + '.');
  process.exit(1);
}

function detener() {
  if (!fs.existsSync(MYSQLADMIN)) {
    console.error('No se encuentra ' + MYSQLADMIN + '. Define la variable MYSQL_HOME.');
    process.exit(1);
  }
  const argumentos = ['-h', '127.0.0.1', '-P', String(PUERTO), '-u', USUARIO];
  if (CLAVE) argumentos.push('-p' + CLAVE);
  argumentos.push('shutdown');
  const hijo = spawn(MYSQLADMIN, argumentos, { stdio: 'inherit' });
  hijo.on('exit', (codigo) => {
    console.log(codigo === 0 ? 'MySQL detenido.' : ('mysqladmin terminó con código ' + codigo));
  });
}

async function estado() {
  console.log('MySQL en 127.0.0.1:' + PUERTO + ': ' + ((await puertoAbierto()) ? 'activo' : 'detenido') + '.');
}

if (accion === 'iniciar') iniciar();
else if (accion === 'detener') detener();
else if (accion === 'estado') estado();
else {
  console.log('Uso: node sql/servidor_mysql.js [iniciar|detener|estado]');
  process.exit(1);
}
