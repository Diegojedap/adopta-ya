# Módulos de la aplicación — ¡ADOPTA YA! 1.0

Inventario de módulos funcionales con su **estado real de implementación**, trazabilidad
a requisitos (REQ-01…REQ-05, RNF-01…RNF-03 de las Entregas 1 y 2) y a las pruebas
automatizadas P-01…P-14. Estado verificado el 08/10/2026 mediante `npm test` y revisión
de código.

**Leyenda de estado:** ✅ Implementado · ◐ Parcial · ✗ No implementado (diseñado)

---

## 1. Módulos del prototipo actual

### M-01 · Portada e información (✅ Implementado)
Página de bienvenida con propuesta de valor y llamado a la acción.
- **Archivos:** `www/index.html:13-31` (header + sección `.inicio`)
- **Funciona:** encabezado, texto de propuesta, botón «Ver mascotas».
- **Requisitos:** — (soporte de UX para REQ-04)

### M-02 · Navegación (`mostrarMascotas()`) (✅ Implementado)
Desplazamiento suave hasta el catálogo.
- **Archivos:** `www/js/script.js:1-7`, botón `www/index.html:28-30`
- **Pruebas:** P-08 ✅
- **Requisitos:** REQ-04 (usabilidad de acceso al catálogo)

### M-03 · Catálogo de mascotas (◐ Parcial)
Muestra tarjetas con emoji, nombre, edad, descripción y botón de adopción.
- **Archivos:** `www/index.html:33-71`; estilos `www/css/style.css:76-121`
- **Funciona:** visualización de 3 mascotas de ejemplo (Max, Luna, Rocky).
- **Limitación crítica:** los datos están **hardcodeados en el HTML**; no se leen de una
  base de datos ni de una API, y no hay detalle/ficha clínica ni filtro por especie.
- **Pruebas:** P-04 ✅ (presenta nombre/acción) · P-05 ❌ (no usa red/API)
- **Requisitos:** REQ-01 («Registrar y mostrar mascotas con información básica y estado»)

### M-04 · Interacción de adopción (`adoptar(nombre)`) (◐ Parcial)
Al pulsar «Quiero adoptar…» se muestra un mensaje con el nombre de la mascota.
- **Archivos:** `www/js/script.js:9-14`; botones `www/index.html:44-66`
- **Funciona:** confirmación visual al usuario (P-06 ✅).
- **Limitación crítica:** no hay formulario de postulación, ni datos del adoptante, ni
  creación de una solicitud con estado «En revisión»: la acción **no genera ningún
  registro** (P-07 ❌).
- **Requisitos:** REQ-02 («Permitir iniciar una solicitud de adopción desde la mascota»)

### M-05 · Responsabilidad en la adopción (✅ Implementado)
Sección educativa sobre hogar, salud y amor; refuerza el mensaje de campaña.
- **Archivos:** `www/index.html:73-104`; estilos `www/css/style.css:124-163`
- **Requisitos:** — (comunicación, complementa REQ-03)

### M-06 · Diseño responsivo (✅ Implementado)
Viewport, `lang="es"` y media query para pantallas ≤700 px.
- **Archivos:** `www/index.html:4-5`, `www/css/style.css:175-193`
- **Pruebas:** P-02 ✅ · P-03 ✅
- **Requisitos:** REQ-04

### M-07 · Empaquetado Android (◐ Parcial)
App híbrida Capacitor 8 con `MainActivity` (BridgeActivity), permiso INTERNET y APK debug.
- **Archivos:** `capacitor.config.json`, `android/` (compileSdk 36, minSdk 24)
- **Funciona:** proyecto Gradle completo; `npm run sync` mantiene coherente la copia web
  (P-13 ✅); APK debug como evidencia (P-14 ✅).
- **Limitación:** el APK vigente fue compilado antes de la corrección de rutas (F-08) y
  esta máquina no puede regenerarlo (sin Android SDK/JDK 17+).
- **Requisitos:** REQ-04

### M-08 · Suite de pruebas automatizadas (✅ Implementado)
14 comprobaciones estáticas y de comportamiento con jsdom; genera `resultados_pruebas.json`.
- **Archivos:** `test_estatico_adopta_ya.js`, script `npm test`
- **Requisitos:** RNF-03; soporta REQ-01/02/04/05 y RNF-02

---

## 2. Módulos diseñados y NO implementados

| ID | Módulo | Descripción (diseño Entregas 1-2) | Requisito | Estado |
|---|---|---|---|---|
| M-09 | Autenticación y roles | Login/registro con hashing bcrypt, roles administrador / adoptante / veterinario | REQ-05 | ✗ |
| M-10 | Gestión de mascotas (CRUD) | Panel admin para registrar/editar mascotas con ficha clínica y estado | REQ-01 | ✗ |
| M-11 | Formulario de postulación | Captura de datos del adoptante, anexos y consentimiento (Ley 1581) | REQ-02 | ✗ |
| M-12 | Motor de evaluación | Panel del refugio para aprobar/rechazar solicitudes con historial | REQ-02 / RNF-01 | ✗ |
| M-13 | Contrato PDF | Generación automática del contrato de adopción y aceptación formal | Alcance Entrega 1 | ✗ |
| M-14 | Seguimiento post-adopción | Registro de reportes con fotos/evidencias durante los primeros 6 meses | REQ-03 | ✗ |
| M-15 | Alertas automáticas | Recordatorios programados (p. ej. 30 días) para cargar evidencias | REQ-03 | ✗ |
| M-16 | API REST | Endpoints de mascotas, solicitudes, usuarios, evidencias y estados | RNF-01 | ✗ |
| M-17 | Persistencia MySQL | Esquema y acceso a datos de todas las entidades | RNF-01 | ✗ |
| M-18 | Despliegue cloud | Publicación web (Vercel + Render free tier) y APK de producción | Viabilidad Entrega 1 | ✗ |

> Evidencia indirecta de intención MySQL: `sql/adopta_ya.session.sql`
> (`SELECT * FROM mascotas;`) y la conexión SQLTools configurada en el `.code-workspace`.

---

## 3. Matriz de trazabilidad

| Requisito | Prioridad | Módulo(s) | Prueba | Estado real |
|---|---|---|---|---|
| REQ-01 · Registrar y mostrar mascotas con información básica y estado | Alta | M-03, M-10, M-17 | P-04, P-05 | ◐ Muestra mascotas, pero estáticas y sin estado ni ficha clínica |
| REQ-02 · Iniciar solicitud de adopción desde la mascota | Alta | M-04, M-11, M-12 | P-06, P-07 | ◐ Acción visible sin persistencia ni formulario |
| REQ-03 · Seguimiento post-adopción y recordatorios | Alta | M-14, M-15 | — | ✗ Sólo mensaje educativo (M-05) |
| REQ-04 · Interfaz responsive móvil/escritorio | Alta | M-06, M-07 | P-02, P-03, P-08, P-13, P-14 | ✅ Cumplido (APK pendiente de regenerar) |
| REQ-05 · Hashing y autenticación de credenciales | Alta | M-09 | P-09 | ✗ Sin librerías ni pantalla de acceso |
| RNF-01 · Trazabilidad de solicitudes y estados | Alta | M-12, M-16, M-17 | — | ✗ Sin persistencia |
| RNF-02 · Sin secretos en texto plano | Alta | — (higiene) | P-10 | ✅ Corregido en esta revisión |
| RNF-03 · Pruebas automatizadas/repetibles | Media | M-08 | P-11, P-12 | ✅ `npm test` ejecutable |

**Cobertura hoy:** REQ-04 cumplido; REQ-01 y REQ-02 parciales; REQ-03, REQ-05 y RNF-01
pendientes; RNF-02 y RNF-03 cumplidos tras la auditoría.

---

## 4. Backlog sugerido para la Entrega 3 (orden de ataque)

| # | Tarea | Módulo | Prioridad | Nota |
|---|---|---|---|---|
| 1 | Modelar el esquema MySQL (usuarios, mascotas, solicitudes, estados, evidencias) y versionarlo en SQL | M-17 | P0 | Base de todo lo demás |
| 2 | API REST mínima: `GET /mascotas`, `POST /solicitudes` (estado «En revisión») | M-16 | P0 | Habilita P-05 y P-07 |
| 3 | Consumir la API en `script.js` (reemplazar catálogo hardcodeado y `alert`) | M-03, M-04 | P0 | Cierre del flujo visible |
| 4 | Registro/login con bcrypt + JWT y roles | M-09 | P1 | Cumple REQ-05 (P-09) |
| 5 | Formulario de postulación + panel de evaluación | M-11, M-12 | P1 | Corazón del proceso |
| 6 | Regenerar APK con Android Studio y publicar demo web | M-18 | P1 | Cierre del hallazgo F-08 |
| 7 | Contrato PDF con plantilla | M-13 | P2 | — |
| 8 | Seguimiento con evidencias y alertas a 30/60/90 días | M-14, M-15 | P2 | REQ-03 |
| 9 | UAT con el refugio y línea base de tiempos | — | P2 | Indicadores Entrega 2 |

---

## 5. Resumen para sustentación

- **Se puede demostrar:** interfaz responsive, catálogo, interacción básica de adopción,
  navegación, empaquetado Android y 11 pruebas automatizadas en verde.
- **Se puede probar con evidencia:** `npm test` (tabla P-01…P-14) y `resultados_pruebas.json`.
- **No se puede afirmar:** que exista un sistema integral de adopciones; hoy es la capa de
  presentación con la arquitectura y el backlog definidos para completarlo.
