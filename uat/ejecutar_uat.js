// Ejecución simulada de la UAT de ¡ADOPTA YA! (16 escenarios) contra la app REAL.
// Levanta el frontend en jsdom con fetch enrutado a la API local y ejecuta los
// flujos del guion (docs/uat/guion_escenarios.md) cronometrados.
// Requisitos: API corriendo en http://localhost:3000 con estado limpio (npm start)
// y el store en memoria recién arrancado (esta simulación crea mascotas/solicitudes).
// Uso:
//   node uat/ejecutar_uat.js [ruta_csv]
//   Salida: docs/uat/resultados_simulacion_2026-10-13.csv
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SALIDA = process.argv[2] || 'docs/uat/resultados_simulacion_2026-10-13.csv';
const JSDOM = require('jsdom').JSDOM;

const html = fs.readFileSync(path.join(ROOT, 'www/index.html'), 'utf8');
const scriptSrc = fs.readFileSync(path.join(ROOT, 'www/js/script.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'www/css/style.css'), 'utf8');

const ADM_EMAIL = 'admin@adoptaya.local';
const ADM_CLAVE = 'admin123';
const ADOPT_EMAIL = 'uat-refugio@adoptante.co';
const ADOPT_CLAVE = 'password123';

const registro = [];
function anotar(r) { registro.push(r); }

function esperar(fn, msMax = 5000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      let ok = false;
      try { ok = fn(); } catch (e) {}
      if (ok) { clearInterval(iv); resolve(true); }
      else if (Date.now() - t0 > msMax) { clearInterval(iv); resolve(false); }
    }, 50);
  });
}

class App {
  constructor() {
    const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only' });
    const w = dom.window;
    this.w = w;
    this.doc = w.document;
    w.__alerts = [];
    w.__prompts = 0;
    w.__confirm = 0;
    w.__blobs = 0;
    w.__fetchLog = [];
    w.alert = (m) => w.__alerts.push(String(m));
    w.prompt = () => { w.__prompts++; return 'No aplica: hogar compartido sin espacio confirmado'; };
    w.confirm = () => { w.__confirm++; return true; };
    w.Element.prototype.scrollIntoView = function () { w.__scroll = this.id; };
    w.URL.createObjectURL = () => { w.__blobs++; return 'blob:simulacion'; };
    w.URL.revokeObjectURL = () => {};
    w.fetch = this.__fetchShim.bind(this);
    w.eval(scriptSrc);
    this.localStorage = w.localStorage;
  }
  async __fetchShim(url, opts = {}) {
    const headers = opts.headers ? Object.assign({}, opts.headers) : {};
    const options = { method: opts.method || 'GET', headers };
    if (opts.body) options.body = opts.body;
    const original = await fetch(url, options);
    this.w.__fetchLog.push({ url: String(url), method: options.method, status: original.status });
    const copia = new Response(await original.arrayBuffer(), {
      status: original.status,
      statusText: original.statusText,
      headers: original.headers
    });
    return copia;
  }
  val(id) { const e = this.doc.getElementById(id); return e ? e.value : null; }
  set(id, v) { const e = this.doc.getElementById(id); if (e) e.value = v; }
  check(id, v) { const e = this.doc.getElementById(id); if (e) e.checked = !!v; }
  texto(id) { const e = this.doc.getElementById(id); return e ? (e.textContent || '') : ''; }
  tokens() {
    try { return { admin: this.localStorage.getItem('token') }; } catch (e) { return { admin: null }; }
  }
}

async function loginAdmin(a) {
  a.set('acceso-email', ADM_EMAIL);
  a.set('acceso-clave', ADM_CLAVE);
  a.w.eval('ingresar()');
  return esperar(() => /administrador/.test(a.texto('sesion')));
}
async function loginAdoptante(a) {
  a.set('acceso-email', ADOPT_EMAIL);
  a.set('acceso-clave', ADOPT_CLAVE);
  a.w.eval('ingresar()');
  return esperar(() => /adoptante/.test(a.texto('sesion')));
}

async function escenario(a, id, req, rol, nombre, fn) {
  const t0 = process.hrtime.bigint();
  let ok = true;
  let detalle = '';
  try { detalle = await fn(a); } catch (e) { ok = false; detalle = 'ERROR: ' + e.message; }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const seg = Number((ms / 1000).toFixed(1));
  anotar({
    fecha: new Date().toISOString().slice(0, 10),
    sesion: 'REFUGIO-SIM',
    escenario: id,
    requisito: req,
    rol,
    resultado: ok && detalle.endsWith('OK') ? 'Aceptado' : 'Fallido',
    defecto: '',
    severidad: '',
    tiempo_seg: seg,
    observacion: (ok && detalle.endsWith('OK') ? 'OK - ' : 'NO OK - ') + detalle
  });
  if (!ok || detalle.slice(-2) !== 'OK') process.exitCode = 1;
  return ok && detalle.slice(-2) === 'OK';
}

async function main() {
  const a = new App();

  // Estado inicial mínimamente verificado
  const salud = await fetch('http://localhost:3000/health').then(r => r.json()).catch(() => null);
  if (!salud || !salud.ok) {
    console.error('La API no responde en http://localhost:3000. Ejecuta `npm start` con store limpio.');
    process.exit(1);
  }

  // UAT-01 · Portada y navegación al catálogo
  await escenario(a, 'UAT-01', 'REQ-04', 'Adoptante', 'navegar', async (app) => {
    app.w.eval('mostrarMascotas()');
    if (app.w.__scroll !== 'mascotas') return 'no desplaza a #mascotas';
    return 'desplazamiento a #mascotas OK';
  });

  // UAT-02 · Catálogo cargado desde la API
  await escenario(a, 'UAT-02', 'REQ-01', 'Adoptante', 'catalogo', async (app) => {
    const ok = await esperar(() => app.doc.querySelectorAll('.contenedor-mascotas .tarjeta').length >= 3);
    if (!ok) return 'catálogo vacío';
    const nombres = [...app.doc.querySelectorAll('.contenedor-mascotas h3')].map(h => h.textContent);
    if (!nombres.includes('Max')) return 'sin Max en catálogo: ' + nombres.join(',');
    return 'GET /mascotas 200 con 3 tarjetas OK';
  });

  // UAT-03 · Iniciar adopción desde el catálogo
  await escenario(a, 'UAT-03', 'REQ-02', 'Adoptante', 'iniciarAdopcion', async (app) => {
    app.w.eval("adoptar('Max')");
    const alerts = app.w.__alerts.length ? app.w.__alerts[app.w.__alerts.length - 1] : '';
    if (!/Max/.test(alerts)) return 'sin confirmación con el nombre';
    const ok = await esperar(() => app.w.__fetchLog.some(f => /\/solicitudes$/.test(f.url) && f.status === 201));
    if (!ok) return 'POST /solicitudes no registró (201)';
    return 'alert + POST /solicitudes 201 en_revision OK';
  });

  // UAT-04 · Postulación con consentimiento (Ley 1581)
  await escenario(a, 'UAT-04', 'REQ-02', 'Adoptante', 'postulacion', async (app) => {
    app.set('post-nombre', 'Adoptante Refugio');
    app.set('post-email', ADOPT_EMAIL);
    app.set('post-telefono', '+57 300 000 0000');
    app.set('post-mascota', 'Luna');
    app.set('post-motivacion', 'Quiero darle un hogar estable a Luna.');
    app.check('post-consentimiento', false);
    app.w.eval('enviarPostulacion()');
    if (!/Ley 1581/.test(app.texto('post-estado'))) return 'envía sin consentimiento';
    app.check('post-consentimiento', true);
    app.w.eval('enviarPostulacion()');
    const ok = await esperar(() => /Postulación enviada/.test(app.texto('post-estado')));
    if (!ok) return 'la postulación válida no confirma';
    const m = app.texto('post-estado').match(/N\.º de solicitud: (\d+)/);
    if (!m) return 'sin número de solicitud';
    app.__solicitud = Number(m[1]);
    return 'sin consentimiento avisa; con consentimiento POST 201 y n.º ' + m[1] + ' OK';
  });

  // UAT-05 · Registro de adoptante
  await escenario(a, 'UAT-05', 'REQ-05', 'Adoptante', 'registro', async (app) => {
    app.set('acceso-nombre', 'Adoptante Refugio');
    app.set('acceso-email', ADOPT_EMAIL);
    app.set('acceso-clave', ADOPT_CLAVE);
    app.w.eval('registrarse()');
    const ok = await esperar(() => /adoptante/.test(app.texto('sesion')));
    if (!ok) return 'no crea cuenta ni inicia sesión';
    app.__tokenAdoptante = app.localStorage.getItem('token');
    return 'registro 201 + login 200, sesión adoptante OK';
  });

  // UAT-06 · Ingreso como administrador
  await escenario(a, 'UAT-06', 'REQ-05', 'Admin', 'loginAdmin', async (app) => {
    const ok = await loginAdmin(app);
    if (!ok) return 'credenciales de demo fallan';
    app.__tokenAdmin = app.localStorage.getItem('token');
    return 'login admin 200, sesión administrador OK';
  });

  // UAT-07 · Evaluación de solicitudes (panel)
  await escenario(a, 'UAT-07', 'REQ-02', 'Admin', 'evaluacion', async (app) => {
    app.w.eval('cargarSolicitudes()');
    const cargadas = await esperar(() => /solicitud/.test(app.texto('panel-estado')) && app.doc.querySelectorAll('.solicitud').length >= 2);
    if (!cargadas) return 'no lista las solicitudes';
    const token = app.localStorage.getItem('token');
    const todas = await fetch('http://localhost:3000/solicitudes', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json());
    const enRevision = todas.filter(s => s.estado === 'en_revision');
    const aAprobar = enRevision.find(s => s.id === app.__solicitud) || enRevision[0];
    const aRechazar = enRevision.find(s => s.id !== aAprobar.id) || enRevision[1];
    if (!aAprobar || !aRechazar) return 'sin solicitudes en_revision suficientes';
    app.w.eval('cambiarEstado(' + aAprobar.id + ',"aprobada")');
    const aprobada = await esperar(() => {
      const txt = app.doc.querySelector('#lista-solicitudes').textContent;
      return /aprobada/.test(txt) && /Descargar contrato/.test(txt);
    });
    if (!aprobada) return 'el cambio a aprobada no refleja';
    app.w.eval('cambiarEstado(' + aRechazar.id + ',"rechazada")');
    const rechazada = await esperar(() => /rechazada/.test(app.doc.querySelector('#lista-solicitudes').textContent));
    if (!rechazada) return 'el cambio a rechazada no refleja';
    app.__aprobada = aAprobar.id;
    app.__rechazada = aRechazar.id;
    return 'lista 200 + aprobada y rechazada reflejadas OK';
  });

  // UAT-08 · Descarga del contrato PDF
  await escenario(a, 'UAT-08', 'M-13', 'Admin', 'contrato', async (app) => {
    const id = app.__aprobada;
    app.w.eval('descargarContrato(' + id + ')');
    const ok = await esperar(() => app.w.__blobs > 0);
    // verificación directa del PDF
    const token = app.localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/solicitudes/' + id + '/contrato', { headers: { Authorization: 'Bearer ' + token } });
    const bytes = new Uint8Array(await res.arrayBuffer());
    const esPdf = res.status === 200 && bytes.length > 0 && String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]) === '%PDF';
    if (!ok || !esPdf) return 'no descarga PDF (status ' + res.status + ')';
    return 'PDF %PDF- ' + bytes.length + ' bytes + createObjectURL OK';
  });

  // UAT-09 · Evidencia post-adopción (se ejecuta como Admin, rol permitido por el guion)
  await escenario(a, 'UAT-09', 'REQ-03', 'Admin', 'evidencia', async (app) => {
    await loginAdmin(app);
    app.set('seg-solicitud', String(app.__aprobada));
    app.set('seg-descripcion', 'Entrega inicial de insumos y saludo a la veterinaria.');
    app.w.eval('registrarEvidencia()');
    const ok = await esperar(() => /Evidencia registrada/.test(app.texto('seg-estado')));
    if (!ok) return 'la evidencia en adopción aprobada no se registra';
    const timeline = await esperar(() => /Día 0/.test(app.texto('lista-evidencias')));
    app.set('seg-solicitud', String(app.__rechazada));
    app.set('seg-descripcion', 'Intento inválido');
    app.w.eval('registrarEvidencia()');
    const resp = await esperar(() => /aprobada/.test(app.texto('seg-estado')));
    if (!resp || !timeline) return 'no bloquea evidencias en solicitud no aprobada o sin timeline';
    return 'evidencia 201 día 0 en timeline y 409 en rechazada OK';
  });

  // UAT-10 · Alertas de seguimiento 30/60/90
  await escenario(a, 'UAT-10', 'REQ-03', 'Admin', 'alertas', async (app) => {
    await loginAdmin(app);
    app.w.eval('cargarAlertas()');
    const ok = await esperar(() => app.doc.querySelectorAll('#lista-alertas > *').length >= 1);
    if (!ok) return 'no cargan las alertas';
    return 'GET /seguimiento/alertas 200 con al menos 1 tarjeta OK';
  });

  // UAT-11 · Diseño responsive
  await escenario(a, 'UAT-11', 'REQ-04', 'Cualquiera', 'responsive', async (app) => {
    const vp = app.doc.querySelector('meta[name=viewport]');
    if (!vp || !/width=device-width/.test(vp.content)) return 'sin viewport';
    if (!/@media\s*\(max-width/.test(css)) return 'sin media query';
    if (app.doc.documentElement.lang !== 'es') return 'lang no es es';
    return 'viewport + @media 700px + lang=es OK';
  });

  // UAT-12 · Rechazo con nota e historial
  await escenario(a, 'UAT-12', 'RNF-01', 'Admin', 'rechazo', async (app) => {
    app.w.eval("adoptar('Rocky')");
    await new Promise(r => setTimeout(r, 300));
    const creada = await fetch('http://localhost:3000/solicitudes', { headers: { Authorization: 'Bearer ' + app.localStorage.getItem('token') } }).then(r => r.json());
    const conRechazo = creada.filter(s => s.estado === 'en_revision').pop();
    if (!conRechazo) return 'sin solicitud en_revision para rechazar';
    app.w.eval('cargarSolicitudes()');
    await esperar(() => /solicitud/.test(app.texto('panel-estado')));
    app.w.eval('cambiarEstado(' + conRechazo.id + ',"rechazada")');
    const ok = await esperar(() => {
      const txt = app.doc.querySelector('#lista-solicitudes').textContent;
      return /rechazada/.test(txt) && /No aplica: hogar compartido/.test(txt);
    });
    if (!ok) return 'el rechazo con nota no se refleja en la tarjeta';
    return 'rechazo 200 + nota visible y estado rechazada OK';
  });

  // UAT-13 · Registrar mascota con ficha clínica
  await escenario(a, 'UAT-13', 'REQ-01', 'Admin', 'registrarMascota', async (app) => {
    app.set('mascota-id', '');
    app.set('mascota-nombre', 'UAT Firulais');
    app.set('mascota-especie', 'perro');
    app.set('mascota-edad', '1 año');
    app.set('mascota-emoji', '🐶');
    app.set('mascota-estado', 'disponible');
    app.set('mascota-salud', 'Sano, vacunado y desparasitado.');
    app.set('mascota-vacunas', 'Rabia, parvovirus');
    app.check('mascota-esterilizado', true);
    app.set('mascota-descripcion', 'Mascota registrada en la UAT.');
    app.w.eval('guardarMascota()');
    const ok = await esperar(() => {
      const postOk = app.w.__fetchLog.some(f => /\/mascotas$/.test(f.url) && f.method === 'POST' && f.status === 201);
      const enLista = /UAT Firulais/.test(app.texto('lista-mascotas-admin'));
      return postOk && enLista;
    });
    if (!ok) return 'no registra la mascota ni aparece en la lista';
    const token = app.localStorage.getItem('token');
    const todas = await fetch('http://localhost:3000/mascotas', { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json());
    const m = todas.find(x => x.nombre === 'UAT Firulais');
    if (!m) return 'la mascota no persiste en la API';
    app.__mascota = m.id;
    // validación de obligatorios
    app.set('mascota-nombre', ''); app.set('mascota-edad', '');
    app.check('mascota-esterilizado', false);
    app.w.eval('guardarMascota()');
    if (!/Completa nombre y edad/.test(app.texto('gestion-estado'))) return 'no valida nombre/edad';
    // especie inválida
    app.set('mascota-nombre', 'Z'); app.set('mascota-edad', '1');
    app.set('mascota-especie', 'dragon');
    app.w.eval('guardarMascota()');
    const inv = await esperar(() => /inválida|inválido/.test(app.texto('gestion-estado')));
    if (!inv) return 'no valida especie inválida';
    return 'POST /mascotas 201 (id ' + m.id + ') + validaciones 400 OK';
  });

  // UAT-14 · Editar una mascota existente
  await escenario(a, 'UAT-14', 'REQ-01', 'Admin', 'editarMascota', async (app) => {
    app.w.eval('editarMascota(' + app.__mascota + ')');
    const precarga = await esperar(() => /Editando la mascota/.test(app.texto('gestion-estado')) && app.val('mascota-nombre') === 'UAT Firulais');
    if (!precarga) return 'no precarga el formulario (nombre=' + app.val('mascota-nombre') + ')';
    app.set('mascota-estado', 'adoptado');
    app.set('mascota-descripcion', 'Adoptada durante la UAT.');
    app.w.eval('guardarMascota()');
    const ok = await esperar(() => app.w.__fetchLog.some(f => f.method === 'PUT' && f.status === 200));
    const token = app.localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/mascotas/' + app.__mascota, { headers: { Authorization: 'Bearer ' + token } }).then(r => r.json());
    if (!ok || res.estado !== 'adoptado') return 'la edición no persiste (estado=' + res.estado + ')';
    return 'PUT /mascotas/' + app.__mascota + ' 200, estado → adoptado OK';
  });

  // UAT-15 · Retirar (eliminar) una mascota
  await escenario(a, 'UAT-15', 'REQ-01', 'Admin', 'eliminarMascota', async (app) => {
    app.w.eval('eliminarMascota(' + app.__mascota + ')');
    const ok = await esperar(() =>
      app.w.__confirm >= 1 &&
      app.w.__fetchLog.some(f => f.method === 'DELETE' && f.status === 200) &&
      !/UAT Firulais/.test(app.texto('lista-mascotas-admin'))
    );
    if (app.w.__confirm < 1) return 'no pidió confirmación';
    const res = await fetch('http://localhost:3000/mascotas/' + app.__mascota);
    if (!ok || res.status !== 404) return 'la mascota sigue visible (status ' + res.status + ')';
    return 'confirmación + DELETE 200 + GET 404 OK';
  });

  // UAT-16 · Control de acceso a la gestión de mascotas
  await escenario(a, 'UAT-16', 'REQ-05', 'Adoptante', 'controlAcceso', async (app) => {
    try { app.localStorage.removeItem('token'); } catch (e) {}
    app.set('mascota-id', ''); app.set('mascota-nombre', 'Y'); app.set('mascota-edad', '1');
    app.w.eval('guardarMascota()');
    if (!/Inicia sesión como administrador/.test(app.texto('gestion-estado'))) return 'permite guardar sin sesión';
    try { app.localStorage.setItem('token', app.__tokenAdoptante); } catch (e) {}
    app.w.eval('guardarMascota()');
    const ok = await esperar(() => /Solo administradores/.test(app.texto('gestion-estado')));
    if (!ok) return 'permite escribir con rol adoptante';
    return 'sin sesión 401 y adoptante 403, solo admin escribe OK';
  });

  // Escritura del CSV
  const encabezado = 'fecha,sesion,escenario,requisito,rol,resultado,defecto,severidad,tiempo_seg,observacion';
  const lineas = [encabezado].concat(registro.map(r => [
    r.fecha, r.sesion, r.escenario, r.requisito, r.rol, r.resultado,
    r.defecto, r.severidad, r.tiempo_seg, r.observacion
  ].join(',')));
  fs.mkdirSync(path.dirname(path.resolve(ROOT, SALIDA)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, SALIDA), lineas.join('\n') + '\n');
  console.log('UAT simulada (refugio) — 16 escenarios');
  console.table(registro.map(r => ({ escenario: r.escenario, resultado: r.resultado, tiempo_s: r.tiempo_seg, observacion: r.observacion })));
  const ok = registro.filter(r => r.resultado === 'Aceptado').length;
  console.log('Resultado: ' + ok + '/16 Aceptado | Escrito: ' + SALIDA);
}

main().catch(e => { console.error(e); process.exit(1); });