// Pruebas estáticas y de comportamiento del prototipo v0.2 de ADOPTA YA.
// Uso (desde la carpeta que contiene www/, android/, package.json):
//   npm i jsdom --no-save && node test_estatico_adopta_ya.js
// Salida: tabla en consola y resultados_pruebas.json
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const ROOT = process.argv[2] || process.cwd();
const WWW = path.join(ROOT, 'www');
const res = [];
const add = (id, req, desc, ok, detalle) => res.push({ id, req, desc, resultado: ok ? 'PASA' : 'FALLA', detalle });

const htmlPath = path.join(WWW, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const dom0 = new JSDOM(html);
const doc0 = dom0.window.document;

// P-01 Los recursos enlazados existen (sistema de archivos sensible a mayúsculas, como Android/Linux)
const refs = [...doc0.querySelectorAll('link[href],script[src]')].map(e => e.getAttribute('href') || e.getAttribute('src'));
const faltan = refs.filter(r => !fs.existsSync(path.join(WWW, r)) || !fs.readdirSync(path.dirname(path.join(WWW, r))).includes(path.basename(r)));
const dirsReales = fs.readdirSync(WWW);
const casoOk = refs.every(r => dirsReales.includes(r.split('/')[0]));
add('P-01', 'REQ-04', 'Recursos CSS/JS de index.html resuelven con mayúsculas exactas', casoOk && faltan.length === 0,
  `referencias: ${refs.join(', ')}; carpetas reales en www/: ${dirsReales.filter(d => fs.statSync(path.join(WWW, d)).isDirectory()).join(', ')}`);

// P-02 viewport y lang
const vp = doc0.querySelector('meta[name=viewport]');
add('P-02', 'REQ-04', 'Meta viewport responsivo y lang="es"', !!vp && /width=device-width/.test(vp.content) && doc0.documentElement.lang === 'es', `viewport=${vp && vp.content}; lang=${doc0.documentElement.lang}`);

// P-03 media query móvil
const css = fs.readFileSync(path.join(WWW, 'css/style.css'), 'utf8');
add('P-03', 'REQ-04', 'Existe regla @media para pantallas pequeñas', /@media\s*\(max-width/.test(css), (css.match(/@media[^{]+/) || ['sin @media'])[0].trim());

// P-04 catálogo
const tarjetas = doc0.querySelectorAll('.tarjeta');
add('P-04', 'REQ-01', 'El catálogo muestra mascotas con nombre, edad y botón de acción', tarjetas.length >= 1 && [...tarjetas].every(t => t.querySelector('h3') && t.querySelector('button')), `${tarjetas.length} tarjetas`);

// P-05 catálogo proviene de la BD (no hardcodeado)
const scriptSrc = fs.readFileSync(path.join(WWW, 'js/script.js'), 'utf8');
const usaRed = /fetch\s*\(|XMLHttpRequest|axios/.test(scriptSrc);
add('P-05', 'REQ-01', 'El catálogo se carga desde la base de datos vía API (no está escrito en el HTML)', usaRed, usaRed ? 'usa red' : 'sin fetch/XHR en script.js: las mascotas están fijas en index.html');

// P-06/P-07 comportamiento de funciones con DOM simulado
function nuevaVentana() {
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const w = dom.window; w.__alerts = []; w.__fetch = 0;
  w.alert = m => w.__alerts.push(m); w.fetch = () => { w.__fetch++; return Promise.resolve({}); };
  w.Element.prototype.scrollIntoView = function () { w.__scroll = this.id; };
  w.eval(scriptSrc);
  return w;
}
let w = nuevaVentana(); w.eval("adoptar('Max')");
add('P-06', 'REQ-02', 'adoptar(nombre) informa al usuario el nombre de la mascota', w.__alerts.length === 1 && /Max/.test(w.__alerts[0]), `alert: ${JSON.stringify(w.__alerts[0])}`);
add('P-07', 'REQ-02', 'adoptar(nombre) crea una solicitud "En revisión" (petición al backend)', w.__fetch > 0, `peticiones de red realizadas: ${w.__fetch}; sin formulario ni estado de solicitud`);
w = nuevaVentana(); w.eval('mostrarMascotas()');
add('P-08', 'REQ-04', 'mostrarMascotas() desplaza la vista a la sección #mascotas', w.__scroll === 'mascotas', `scrollIntoView sobre #${w.__scroll}`);

// P-09 autenticación / hashing
const deps = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).dependencies || {};
const tieneAuth = ['bcrypt', 'bcryptjs', 'jsonwebtoken', 'argon2'].some(k => k in deps);
add('P-09', 'REQ-05', 'Existe librería de hashing/autenticación para credenciales', tieneAuth, `dependencias: ${Object.keys(deps).length}; sin bcrypt/jsonwebtoken`);

// P-10 secretos en claro
const hallazgos = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (/node_modules|\.git$|[\\/]build$|[\\/]\.idea$/.test(p)) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(json|js|xml|properties|sql|code-workspace|env)$/.test(f) && st.size < 2e6) {
      const t = fs.readFileSync(p, 'utf8');
      if (/"password"\s*:\s*"[^"]+"/.test(t) || /(passwd|secret|api[_-]?key)\s*[=:]\s*\S+/i.test(t)) hallazgos.push(path.relative(ROOT, p));
    }
  }
})(ROOT);
add('P-10', 'RNF-02', 'No hay credenciales en texto plano en el repositorio', hallazgos.length === 0, hallazgos.length ? `credenciales en: ${hallazgos.join('; ')}` : 'sin hallazgos');

// P-11 higiene de dependencias: solo directas, sin transitivas filtradas.
// Allowlist de dependencias directas conocidas del proyecto. Evita la falsa
// contradicción con P-09 (que exige una librería de auth en "dependencies").
const directasPermitidas = ['@capacitor/core', '@capacitor/cli', '@capacitor/android', 'bcryptjs', 'jsonwebtoken'];
const declaradas = Object.keys(deps);
const noDirectas = declaradas.filter(k => !directasPermitidas.includes(k));
add('P-11', 'RNF-03', 'package.json solo declara dependencias directas (sin transitivas)', noDirectas.length === 0, noDirectas.length ? `posibles transitivas: ${noDirectas.join(', ')}` : `${declaradas.length} directas: ${declaradas.join(', ')}`);

// P-12 script de pruebas del proyecto
const scripts = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).scripts || {};
add('P-12', 'RNF-03', 'package.json define un script de pruebas real', scripts.test && !/no test specified/.test(scripts.test), `scripts.test = ${JSON.stringify(scripts.test)}`);

// P-13 coherencia de la copia empaquetada en Android
const pubDir = path.join(ROOT, 'android/app/src/main/assets/public');
if (fs.existsSync(pubDir)) {
  const norm = s => s.replace(/\r/g, '');
  const igual = norm(fs.readFileSync(path.join(pubDir, 'index.html'), 'utf8')) === norm(html);
  add('P-13', 'REQ-04', 'La copia de index.html empaquetada en Android coincide con www/', igual, igual ? 'idéntica' : 'difiere');
}
const apk = path.join(ROOT, 'android/app/build/outputs/apk/debug/app-debug.apk');
add('P-14', 'REQ-04', 'Existe un APK debug generado', fs.existsSync(apk), fs.existsSync(apk) ? `${(fs.statSync(apk).size / 1048576).toFixed(2)} MB, ${fs.statSync(apk).mtime.toISOString().slice(0, 10)}` : 'no encontrado');

console.table(res.map(r => ({ id: r.id, req: r.req, resultado: r.resultado, descripcion: r.desc })));
const pasa = res.filter(r => r.resultado === 'PASA').length;
console.log(`Total ${res.length} | PASA ${pasa} | FALLA ${res.length - pasa}`);
fs.writeFileSync(path.join(process.cwd(), 'resultados_pruebas.json'), JSON.stringify(res, null, 2));
