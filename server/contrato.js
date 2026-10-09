// Generador de contrato de adopción en PDF, sin dependencias externas (M-13).
// Construye un PDF 1.4 de una página con las fuentes base Helvetica.

const ANCHO = 595;
const ALTO = 842;
const MARGEN = 60;

function limpiar(texto) {
  return String(texto == null ? '' : texto)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2014/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
}

function escapar(texto) {
  return texto.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function partir(texto, max) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let actual = '';
  for (const palabra of palabras) {
    const candidato = actual ? actual + ' ' + palabra : palabra;
    if (candidato.length > max && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = candidato;
    }
  }
  lineas.push(actual);
  return lineas;
}

function generarContrato(solicitud) {
  const s = solicitud || {};
  const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  const bloques = [];

  function add(texto, size, negrita) {
    const ancho = size >= 16 ? 42 : 92;
    partir(limpiar(texto), ancho).forEach(function (linea) {
      bloques.push({ linea: linea, size: size || 11, negrita: !!negrita });
    });
  }

  add('CONTRATO DE ADOPCION', 18, true);
  add('Programa ADOPTA YA - CUN', 12, false);
  add(' ', 11);
  add('Fecha de generacion: ' + fecha, 11);
  add(' ', 11);
  add('DATOS DEL ADOPTANTE', 13, true);
  add('Nombre: ' + (s.solicitante_nombre || 'Por completar'), 11);
  add('Correo: ' + (s.solicitante_email || 'Por completar'), 11);
  add('Telefono: ' + (s.solicitante_telefono || 'Por completar'), 11);
  add(' ', 11);
  add('MASCOTA ADOPTADA', 13, true);
  add('Nombre: ' + (s.mascota || ('#' + s.mascota_id)), 11);
  add('Identificador de solicitud: #' + (s.id != null ? s.id : ''), 11);
  add(' ', 11);
  add('CLAUSULAS', 13, true);
  add('1. Brindar alimentacion, vivienda, atencion veterinaria y trato digno al animal.', 11);
  add('2. No abandonar ni maltratar al animal y notificar cualquier cambio de domicilio.', 11);
  add('3. Aceptar el seguimiento post-adopcion durante los primeros 6 meses (evidencias a los 30/60/90 dias).', 11);
  add('4. Autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012 (consentimiento registrado: ' + (s.consentimiento ? 'SI' : 'NO') + ').', 11);
  add('5. El incumplimiento de las clausulas faculta al refugio a retomar la custodia del animal.', 11);
  add(' ', 11);
  add(' ', 11);
  add('_______________________________      _______________________________', 11);
  add('Firma del adoptante                   Representante del refugio', 11);
  add('Nombre: ' + (s.solicitante_nombre || '____________________') + '         ADOPTA YA!', 11);

  let y = ALTO - MARGEN;
  let contenido = '';
  for (const bloque of bloques) {
    if (y < MARGEN) break;
    contenido += 'BT /' + (bloque.negrita ? 'F1' : 'F2') + ' ' + bloque.size + ' Tf ' +
      MARGEN + ' ' + y + ' Tm (' + escapar(bloque.linea) + ') Tj ET\n';
    y -= (bloque.negrita ? bloque.size : 11) * 1.6;
  }

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + ANCHO + ' ' + ALTO + '] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Length ' + Buffer.byteLength(contenido, 'latin1') + ' >>\nstream\n' + contenido + 'endstream'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objetos.forEach(function (objeto, i) {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += (i + 1) + ' 0 obj\n' + objeto + '\nendobj\n';
  });

  const inicioXref = Buffer.byteLength(pdf, 'latin1');
  const total = objetos.length + 1;
  pdf += 'xref\n0 ' + total + '\n0000000000 65535 f \n';
  offsets.forEach(function (o) {
    pdf += String(o).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + inicioXref + '\n%%EOF';

  return Buffer.from(pdf, 'latin1');
}

module.exports = { generarContrato };
