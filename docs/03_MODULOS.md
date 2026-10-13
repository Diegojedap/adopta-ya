# Módulos de la aplicación — ¡ADOPTA YA! 1.0

Inventario de módulos funcionales con su **estado real de implementación**, trazabilidad
a requisitos (REQ-01…REQ-05, RNF-01…RNF-03 de las Entregas 1 y 2) y a las pruebas
automatizadas P-01…P-18. Estado verificado el 12/10/2026 mediante `npm test` y revisión
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
- **Archivos:** `www/index.html:33-71`; `www/js/script.js` (`cargarMascotas`, `pintarMascotas`); estilos `www/css/style.css:76-121`
- **Funciona:** el catálogo se carga con `fetch` desde `GET /mascotas` de la API; si la
  API no responde, se conservan las 3 tarjetas estáticas (Max, Luna, Rocky) de reserva.
- **Limitación:** sin filtro por especie ni detalle ampliado; la ficha clínica y el estado
  editable se gestionan desde M-10 (panel del refugio).
- **Pruebas:** P-04 ✅ (presenta nombre/acción) · P-05 ✅ (usa red/API)
- **Requisitos:** REQ-01 («Registrar y mostrar mascotas con información básica y estado»)

### M-04 · Interacción de adopción (`adoptar(nombre)`) (◐ Parcial)
Al pulsar «Quiero adoptar…» se muestra un mensaje y se registra una solicitud.
- **Archivos:** `www/js/script.js` (`adoptar`); botones `www/index.html:44-66`
- **Funciona:** confirmación visual (P-06 ✅) y `POST /solicitudes` que crea la solicitud
  con estado «en_revision» (P-07 ✅).
- **Limitación:** sin formulario de postulación ni datos del adoptante (M-11 pendiente);
  la solicitud se guarda en el store en memoria de la API (o MySQL si está conectado).
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

### M-07 · Empaquetado Android (✅ Implementado)
App híbrida Capacitor 8 con `MainActivity` (BridgeActivity), permiso INTERNET y APK debug.
- **Archivos:** `capacitor.config.json`, `android/` (compileSdk 36, minSdk 24)
- **Funciona:** proyecto Gradle completo; `npm run sync` mantiene coherente la copia web
  (P-13 ✅); APK debug regenerado sobre la fuente corregida (P-14 ✅).
- **Limitación:** para compilar en esta máquina se requiere JDK 21 (Capacitor 8) y el SDK
  local; la publicación cloud (demo web) sigue siendo M-18.
- **Requisitos:** REQ-04

### M-08 · Suite de pruebas automatizadas (✅ Implementado)
18 comprobaciones estáticas y de comportamiento con jsdom (P-01…P-18); genera `resultados_pruebas.json`.
- **Archivos:** `test_estatico_adopta_ya.js`, script `npm test`
- **Nota P-11:** verificación corregida a allowlist de dependencias directas (08/10/2026)
  para que no contradiga a P-09.
- **Requisitos:** RNF-03; soporta REQ-01/02/04/05 y RNF-02

### M-09 · Autenticación y roles (◐ Prototipo)
Registro, login con hashing y control de acceso por JWT; roles administrador/adoptante/veterinario.
- **Archivos:** `server/index.js` (`/auth/registro`, `/auth/login`, `/auth/perfil`);
  UI `www/index.html` + `www/js/script.js` (`ingresar`, `registrarse`, `mostrarSesion`).
- **Funciona:** hash con `bcryptjs` (10 rondas) y token `jsonwebtoken` (24 h); admin de demo
  `admin@adoptaya.local` / `admin123`.
- **Limitación:** usuarios en memoria (no persisten en MySQL) y sin panel por rol todavía.
- **Pruebas:** P-09 ✅
- **Requisitos:** REQ-05

### M-16 · API REST (◐ Prototipo)
Servidor con el módulo `http` de Node (sin framework): `GET /health`, `GET /mascotas`,
`GET /mascotas/:id`, `POST/PUT/DELETE /mascotas` (solo admin), `POST /solicitudes`,
`GET /solicitudes` y `POST /solicitudes/:id/estado` (admin), `GET /solicitudes/:id/contrato`,
`POST/GET /solicitudes/:id/evidencias`, `GET /seguimiento/alertas` (admin) y
`/auth/registro`, `/auth/login`, `/auth/perfil`; CORS habilitado.
- **Archivos:** `server/index.js`; script `npm start`; config `server/.env.example`
- **Funciona:** store en memoria con las mascotas de semilla; hook **opcional** a `mysql2`
  (se activa si está instalado y hay conexión a MySQL).
- **Pruebas:** P-05 ✅ · P-07 ✅
- **Requisitos:** RNF-01 (parcial)

### M-17 · Persistencia MySQL (◐ Esquema versionado)
Esquema e inserción de datos de ejemplo para todas las entidades.
- **Archivos:** `sql/schema.sql` (usuarios, mascotas, solicitudes, evidencias) y `sql/seed.sql`
- **Limitación:** sin conexión activa en esta máquina (MySQL no confirmado); la API opera en memoria.
- **Requisitos:** RNF-01

### M-11 · Formulario de postulación (◐ Parcial)
Captura los datos del adoptante y su consentimiento para iniciar el proceso.
- **Archivos:** `www/index.html` (`#postulacion`), `www/js/script.js` (`enviarPostulacion`);
  backend `POST /solicitudes` (extendido con datos del solicitante).
- **Funciona:** valida nombre, correo y mascota, exige el consentimiento (Ley 1581) y crea
  la solicitud «en_revision» con los datos del postulante.
- **Limitación:** sin carga de anexos ni verificación de identidad.
- **Requisitos:** REQ-02

### M-12 · Panel de evaluación (◐ Parcial)
Panel del refugio para revisar y resolver solicitudes.
- **Archivos:** `www/index.html` (`#panel`), `www/js/script.js` (`cargarSolicitudes`,
  `cambiarEstado`); backend `GET /solicitudes` y `POST /solicitudes/:id/estado`.
- **Funciona:** lista las solicitudes (solo rol administrador) y permite aprobar o rechazar
  con registro de historial de estados.
- **Limitación:** sin notificación al adoptante ni asignación de veterinario.
- **Requisitos:** REQ-02 / RNF-01

### M-13 · Contrato PDF (◐ Prototipo)
Genera el contrato de adopción en PDF sin dependencias externas.
- **Archivos:** `server/contrato.js` (escritor PDF 1.4 con fuentes base Helvetica);
  ruta `GET /solicitudes/:id/contrato` en `server/index.js`; botón «Descargar contrato» en
  `www/js/script.js` (`descargarContrato`) dentro del panel.
- **Funciona:** sólo sobre solicitudes «aprobada»; el adoptante dueño o un administrador con
  JWT descarga el PDF (datos del adoptante, mascota y 5 cláusulas con referencia a la Ley 1581).
- **Limitación:** plantilla fija, sin firma digital ni anexos.
- **Requisitos:** Alcance Entrega 1 (contrato y aceptación formal)

### M-14 · Seguimiento post-adopción (◐ Parcial)
Registro de reportes con notas y fotos durante los primeros meses tras la adopción aprobada.
- **Archivos:** `server/index.js` (`POST/GET /solicitudes/:id/evidencias`); sección
  `#seguimiento` en `www/index.html`; `www/js/script.js` (`registrarEvidencia`,
  `cargarEvidencias`, `tarjetaEvidencia`); tabla `evidencias` en `sql/schema.sql`.
- **Funciona:** una adopción «aprobada» permite al adoptante dueño o al administrador (JWT)
  registrar evidencias (descripción obligatoria u opcional + foto data-URL leída con
  FileReader, tope 300 KB) con su `dia` desde la aprobación; se listan en un timeline.
  Sin token → 401; sin permiso → 403; solicitud no aprobada → 409.
- **Limitación:** la foto viaja como base64 en el JSON (sin almacenamiento de archivos real);
  no hay subida a blob/CDN.
- **Pruebas:** P-15 ✅
- **Requisitos:** REQ-03

### M-15 · Alertas automáticas (◐ Parcial)
Recordatorios de seguimiento a los 30/60/90 días para cargar evidencias.
- **Archivos:** `server/index.js` (`GET /seguimiento/alertas`, solo admin); botón
  «Cargar alertas de seguimiento» en el panel + `cargarAlertas()`/`tarjetaAlerta()`.
- **Funciona:** calcula por cada adopción aprobada `dias_acumulados`, próximo hito (30/60/90)
  y `estado_alerta` (`al_dia`/`vencida`/`vencida_final`/`completada`) comparando el calendario
  con las evidencias registradas en cada ventana; insignias de color en la UI.
- **Limitación:** no hay scheduler ni notificación real (correo/push); en producción sería
  un cron + proveedor de correo (diseñado en Entregas 1-2).
- **Pruebas:** P-16 ✅
- **Requisitos:** REQ-03

### M-10 · Gestión de mascotas (CRUD) (✅ Implementado)
Panel de administración para registrar, editar y retirar mascotas, con ficha clínica.
- **Archivos:** `server/index.js` (`crearMascota`, `actualizarMascota`, `eliminarMascota`,
  rutas `POST/PUT/DELETE /mascotas`), `www/index.html` (`#gestion-mascotas`),
  `www/js/script.js` (`guardarMascota`, `editarMascota`, `eliminarMascota`,
  `cargarMascotasAdmin`, `tarjetaMascotaAdmin`), `sql/schema.sql` (columnas `salud`,
  `vacunas`, `esterilizado`).
- **Funciona:** el administrador (JWT) crea (201), actualiza (200) y elimina (200) mascotas;
  las rutas de escritura exigen rol `administrador` (401 sin token, 403 si es adoptante);
  valida `especie` (`perro`/`gato`/`otro`) y `estado` (`disponible`/`en_revision`/`adoptado`);
  la ficha clínica incluye salud, vacunas y esterilización. El catálogo público se refresca
  tras cada cambio.
- **Limitación:** datos en memoria (o MySQL si hay pool); sin carga de imágenes por mascota.
- **Pruebas:** P-18 ✅
- **Requisitos:** REQ-01

---

## 2. Módulos diseñados aún NO implementados

| ID | Módulo | Descripción (diseño Entregas 1-2) | Requisito | Estado |
|---|---|---|---|---|
| M-16 | API REST | Endpoints de mascotas, solicitudes, usuarios, evidencias y estados | RNF-01 | ◐ (mascotas, solicitudes, auth, evidencias) |
| M-17 | Persistencia MySQL | Esquema y acceso a datos de todas las entidades | RNF-01 | ◐ (esquema versionado, sin conexión) |
| M-18 | Despliegue cloud | Publicación web (Vercel + Render free tier) y APK de producción | Viabilidad Entrega 1 | ✗ |

> Evidencia indirecta de intención MySQL: `sql/adopta_ya.session.sql`
> (`SELECT * FROM mascotas;`) y la conexión SQLTools configurada en el `.code-workspace`.

---

## 3. Matriz de trazabilidad

| Requisito | Prioridad | Módulo(s) | Prueba | Estado real |
|---|---|---|---|---|
| REQ-01 · Registrar y mostrar mascotas con información básica y estado | Alta | M-03, M-10, M-17 | P-04, P-05, P-18 | ✅ Catálogo vía API + CRUD del refugio con ficha clínica y estado |
| REQ-02 · Iniciar solicitud de adopción desde la mascota | Alta | M-04, M-11, M-12 | P-06, P-07 | ◐ Formulario de postulación + evaluación con historial; falta ficha y notificaciones |
| REQ-03 · Seguimiento post-adopción y recordatorios | Alta | M-14, M-15 | P-15, P-16 | ◐ Evidencias cargadas por el adoptante y alertas 30/60/90 calculadas; falta notificación real |
| REQ-04 · Interfaz responsive móvil/escritorio | Alta | M-06, M-07 | P-02, P-03, P-08, P-13, P-14 | ✅ Cumplido (APK regenerado 13/10/2026) |
| REQ-05 · Hashing y autenticación de credenciales | Alta | M-09 | P-09 | ✅ bcrypt + JWT (usuarios en memoria) |
| RNF-01 · Trazabilidad de solicitudes y estados | Alta | M-12, M-16, M-17 | — | ✗ Sin persistencia |
| RNF-02 · Sin secretos en texto plano | Alta | — (higiene) | P-10 | ✅ Corregido en esta revisión |
| RNF-03 · Pruebas automatizadas/repetibles | Media | M-08 | P-11, P-12, P-17 | ✅ `npm test` ejecutable + kit UAT |

**Cobertura hoy:** REQ-01, REQ-04 y REQ-05 cumplidos; REQ-02 y REQ-03 parciales (con API);
RNF-01 con prototipo de API; RNF-02 y RNF-03 cumplidos. Pruebas: **18/18**. UAT: kit y
línea base de tiempos con simulación (`docs/04_UAT.md`); falta la sesión con el refugio.

---

## 4. Backlog sugerido para la Entrega 3 (orden de ataque)

| # | Tarea | Módulo | Prioridad | Nota |
|---|---|---|---|---|
| 1 | Modelar el esquema MySQL (usuarios, mascotas, solicitudes, estados, evidencias) y versionarlo en SQL | M-17 | P0 | ✅ Hecho 08/10/2026 (`sql/schema.sql`, `sql/seed.sql`) |
| 2 | API REST mínima: `GET /mascotas`, `POST /solicitudes` (estado «En revisión») | M-16 | P0 | ✅ Hecho 08/10/2026 (`server/index.js`; habilita P-05/P-07) |
| 3 | Consumir la API en `script.js` (reemplazar catálogo hardcodeado y `alert`) | M-03, M-04 | P0 | ✅ Hecho 08/10/2026 (con reserva estática) |
| 4 | Registro/login con bcrypt + JWT y roles | M-09 | P1 | ✅ Hecho 08/10/2026 (`server/index.js`; P-09) |
| 5 | Formulario de postulación + panel de evaluación | M-11, M-12 | P1 | ✅ Hecho 08/10/2026 (datos + consentimiento + historial) |
| 6 | Regenerar APK con Android Studio y publicar demo web | M-18 | P1 | ✅ APK regenerado 13/10/2026 (JDK 21 + SDK local; cierra F-08). ◐ Falta publicar la demo web (Vercel + Render) |
| 7 | Contrato PDF con plantilla | M-13 | P2 | ✅ Hecho 09/10/2026 (`server/contrato.js`, sin dependencias) |
| 8 | Seguimiento con evidencias y alertas a 30/60/90 días | M-14, M-15 | P2 | ✅ Hecho 12/10/2026 (evidencias + alertas; sin notificación real) |
| 9 | UAT con el refugio y línea base de tiempos | — | P2 | ◐ Kit + simulación hechos 12/10/2026 (12 escenarios) y **ampliados a 16 con el CRUD de mascotas (UAT-13…UAT-16) el 13/10/2026**; ejecución con el refugio pendiente (`docs/04_UAT.md`). Defectos de la simulación **D-001** (n.º de solicitud) y **D-002** (nota de rechazo en la tarjeta) corregidos 12/10/2026 |
| 10 | CRUD de mascotas con ficha clínica para el refugio | M-10 | P1 | ✅ Hecho 12/10/2026 (`server/index.js` + panel `#gestion-mascotas`; P-18) |

---

## 5. Resumen para sustentación

- **Se puede demostrar:** interfaz responsive, catálogo dinámico desde la API, registro de
  solicitud «en revisión», login/registro con JWT, panel de evaluación con descarga del
  contrato de adopción en PDF, seguimiento post-adopción con evidencias (notas y fotos) y
  alertas del refugio a los 30/60/90 días, CRUD de mascotas con ficha clínica, navegación,
  empaquetado Android y 18 pruebas automatizadas en verde; además, el **kit de UAT con línea
  base de tiempos** (16 escenarios y medición reproducible con `npm run uat:medir`).
- **Se puede probar con evidencia:** `npm test` (tabla P-01…P-18), `resultados_pruebas.json`,
  la API local (`npm start`) y los artefactos UAT (`docs/04_UAT.md`, `docs/uat/`).
- **No se puede afirmar:** que exista un sistema integral de adopciones en producción; hoy
  es la capa de presentación con una API de prototipo (datos en memoria, notificaciones reales
  pendientes) y la arquitectura/backlog definidos para completarlo.
