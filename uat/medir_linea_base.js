// Línea base de tiempos de la UAT de ¡ADOPTA YA!
// Lee un CSV de resultados (docs/uat/...) y calcula por escenario: ejecuciones,
// % de éxito (Aceptado + Condicional), tiempo mínimo/promedio/máximo y defectos.
// Uso:
//   node uat/medir_linea_base.js [ruta_csv] [ruta_json]
//   npm run uat:medir
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const CSV = process.argv[2] || 'docs/uat/resultados_simulacion_2026-10-13.csv';
const SALIDA = process.argv[3] || 'docs/uat/linea_base_tiempos.json';

function leerCSV(ruta) {
  const texto = fs.readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '');
  const filas = [];
  let campo = '';
  let fila = [];
  let entreComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') { entreComillas = false; }
      else { campo += c; }
    } else if (c === '"') {
      entreComillas = true;
    } else if (c === ',') {
      fila.push(campo); campo = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo);
      if (fila.some(v => v !== '')) filas.push(fila);
      fila = []; campo = '';
    } else {
      campo += c;
    }
  }
  if (campo !== '' || fila.length) { fila.push(campo); if (fila.some(v => v !== '')) filas.push(fila); }
  const cabecera = filas.shift();
  return filas.map(f => {
    const o = {};
    cabecera.forEach((k, idx) => { o[k.trim()] = (f[idx] || '').trim(); });
    return o;
  });
}

const esExito = r => r === 'Aceptado' || r === 'Condicional';

if (!fs.existsSync(CSV)) {
  console.error('No se encontró el CSV: ' + CSV);
  process.exit(1);
}

const registros = leerCSV(CSV).filter(r => r.escenario);
const porEscenario = new Map();

for (const r of registros) {
  if (!porEscenario.has(r.escenario)) {
    porEscenario.set(r.escenario, { escenario: r.escenario, requisito: r.requisito, rol: r.rol, tiempos: [], resultados: [], defectos: [] });
  }
  const e = porEscenario.get(r.escenario);
  const t = Number(r.tiempo_seg);
  if (Number.isFinite(t) && t > 0) e.tiempos.push(t);
  e.resultados.push(r.resultado);
  if (r.defecto) e.defectos.push({ id: r.defecto, severidad: r.severidad || '', nota: r.observacion || '' });
}

const escenarios = [...porEscenario.values()].map(e => {
  const exitos = e.resultados.filter(esExito).length;
  const suma = e.tiempos.reduce((a, b) => a + b, 0);
  return {
    escenario: e.escenario,
    requisito: e.requisito,
    rol: e.rol,
    ejecuciones: e.resultados.length,
    exitos,
    porcentaje_exito: e.resultados.length ? Math.round((exitos / e.resultados.length) * 100) : 0,
    tiempo_min_seg: e.tiempos.length ? Math.min(...e.tiempos) : null,
    tiempo_prom_seg: e.tiempos.length ? Number((suma / e.tiempos.length).toFixed(1)) : null,
    tiempo_max_seg: e.tiempos.length ? Math.max(...e.tiempos) : null,
    defectos: e.defectos
  };
}).sort((a, b) => a.escenario.localeCompare(b.escenario));

const tiemposGlobales = registros.map(r => Number(r.tiempo_seg)).filter(t => Number.isFinite(t) && t > 0);
const exitosGlobales = registros.filter(r => esExito(r.resultado)).length;
const resumen = {
  fuente: CSV,
  generado_en: new Date().toISOString(),
  total_ejecuciones: registros.length,
  escenarios_evaluados: escenarios.length,
  porcentaje_exito_global: registros.length ? Math.round((exitosGlobales / registros.length) * 100) : 0,
  tiempo_prom_global_seg: tiemposGlobales.length ? Number((tiemposGlobales.reduce((a, b) => a + b, 0) / tiemposGlobales.length).toFixed(1)) : null,
  defectos: registros.filter(r => r.defecto).map(r => ({ escenario: r.escenario, id: r.defecto, severidad: r.severidad || '' }))
};

const salida = { resumen, escenarios };
fs.mkdirSync(path.dirname(path.resolve(ROOT, SALIDA)), { recursive: true });
fs.writeFileSync(path.join(ROOT, SALIDA), JSON.stringify(salida, null, 2));

console.log('Línea base de tiempos (UAT ¡ADOPTA YA!)');
console.table(escenarios.map(e => ({
  escenario: e.escenario, req: e.requisito, ejec: e.ejecuciones, 'exito%': e.porcentaje_exito,
  'min(s)': e.tiempo_min_seg, 'prom(s)': e.tiempo_prom_seg, 'max(s)': e.tiempo_max_seg, defectos: e.defectos.length
})));
console.log('Resumen: ' + resumen.escenarios_evaluados + ' escenarios | éxito global ' +
  resumen.porcentaje_exito_global + '% | promedio global ' + resumen.tiempo_prom_global_seg + ' s');
console.log('Escrito: ' + SALIDA);
