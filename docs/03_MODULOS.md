﻿# MÃ³dulos de la aplicaciÃ³n â€” Â¡ADOPTA YA! 1.0

Inventario de mÃ³dulos funcionales con su **estado real de implementaciÃ³n**, trazabilidad
a requisitos (REQ-01â€¦REQ-05, RNF-01â€¦RNF-03 de las Entregas 1 y 2) y a las pruebas
automatizadas P-01â€¦P-18. Estado verificado el 12/10/2026 mediante `npm test` y revisiÃ³n
de cÃ³digo.

**Leyenda de estado:** âœ… Implementado Â· â— Parcial Â· âœ— No implementado (diseÃ±ado)

---

## 1. MÃ³dulos del prototipo actual

### M-01 Â· Portada e informaciÃ³n (âœ… Implementado)
PÃ¡gina de bienvenida con propuesta de valor y llamado a la acciÃ³n.
- **Archivos:** `www/index.html` (barra de navegaciÃ³n `.barra-navegacion` + hero `.inicio`)
- **Funciona:** encabezado, texto de propuesta, botÃ³n Â«Ver mascotasÂ».
- **Requisitos:** â€” (soporte de UX para REQ-04)

### M-02 Â· NavegaciÃ³n (`mostrarMascotas()` + modales) (âœ… Implementado)
Barra de navegaciÃ³n con botones que abren **modales** (login, postulaciÃ³n, seguimiento, panel,
gestiÃ³n), **tema claro/oscuro** (`#btn-tema`) y **bilingÃ¼e ES/EN** (`#btn-idioma`), mÃ¡s
desplazamiento suave hasta el catÃ¡logo.
- **Archivos:** `www/js/script.js` (`mostrarMascotas`, `abrirModal`, `cerrarModal`, `alternarTema`,
  `alternarIdioma`), barra y modales en `www/index.html`
- **Pruebas:** P-08 âœ…
- **Requisitos:** REQ-04 (usabilidad de acceso al catÃ¡logo)

### M-03 Â· CatÃ¡logo de mascotas (â— Parcial)
Muestra tarjetas con emoji, nombre, edad, descripciÃ³n y botÃ³n de adopciÃ³n.
- **Archivos:** `www/index.html` (`#mascotas`); `www/js/script.js` (`cargarMascotas`, `pintarMascotas`); estilos `www/css/style.css` (`.mascotas`, `.contenedor-mascotas`, `.tarjeta`)
- **Funciona:** el catÃ¡logo se carga con `fetch` desde `GET /mascotas` de la API; si la
  API no responde, se conservan las 3 tarjetas estÃ¡ticas (Max, Luna, Rocky) de reserva.
- **LimitaciÃ³n:** sin filtro por especie ni detalle ampliado; la ficha clÃ­nica y el estado
  editable se gestionan desde M-10 (panel del refugio).
- **Pruebas:** P-04 âœ… (presenta nombre/acciÃ³n) Â· P-05 âœ… (usa red/API)
- **Requisitos:** REQ-01 (Â«Registrar y mostrar mascotas con informaciÃ³n bÃ¡sica y estadoÂ»)

### M-04 Â· InteracciÃ³n de adopciÃ³n (`adoptar(nombre)`) (â— Parcial)
Al pulsar Â«Quiero adoptarâ€¦Â» se muestra un mensaje y se registra una solicitud.
- **Archivos:** `www/js/script.js` (`adoptar`); botones de las tarjetas en `www/index.html` (`#mascotas`)
- **Funciona:** confirmaciÃ³n visual (P-06 âœ…) y `POST /solicitudes` que crea la solicitud
  con estado Â«en_revisionÂ» (P-07 âœ…).
- **LimitaciÃ³n:** sin formulario de postulaciÃ³n ni datos del adoptante (M-11 pendiente);
  la solicitud se guarda en la API (persistida en MySQL cuando estÃ¡ arrancado).
- **Requisitos:** REQ-02 (Â«Permitir iniciar una solicitud de adopciÃ³n desde la mascotaÂ»)

### M-05 Â· Responsabilidad en la adopciÃ³n (âœ… Implementado)
SecciÃ³n educativa sobre hogar, salud y amor; refuerza el mensaje de campaÃ±a.
- **Archivos:** `www/index.html` (`.responsabilidad`); estilos `www/css/style.css` (`.responsabilidad`, `.cuidados`)
- **Requisitos:** â€” (comunicaciÃ³n, complementa REQ-03)

### M-06 Â· DiseÃ±o responsivo (âœ… Implementado)
Viewport, `lang="es"` y media query para pantallas â‰¤700 px. Incluye **tema claro/oscuro**
(`#btn-tema`, `[data-theme="dark"]`) que sigue la preferencia del sistema y recuerda la
elecciÃ³n en `localStorage.tema`, y **bilingÃ¼e ES/EN** (`#btn-idioma`, `data-i18n`,
`alternarIdioma`) con espaÃ±ol por defecto y preferencia en `localStorage.idioma`.
- **Archivos:** `www/index.html` (meta viewport, `lang="es"` y script anti-parpadeo),
  `www/css/style.css` (`@media (max-width: 700px)` y variables de tema),
  `www/js/script.js` (`alternarTema`, `inicializarTema`, `alternarIdioma`, `inicializarIdioma`)
- **Pruebas:** P-02 âœ… Â· P-03 âœ…
- **Requisitos:** REQ-04

### M-07 Â· Empaquetado Android (âœ… Implementado)
App hÃ­brida Capacitor 8 con `MainActivity` (BridgeActivity), permiso INTERNET y APK debug.
- **Archivos:** `capacitor.config.json`, `android/` (compileSdk 36, minSdk 24)
- **Funciona:** proyecto Gradle completo; `npm run sync` mantiene coherente la copia web
  (P-13 âœ…); APK debug regenerado sobre la fuente corregida (P-14 âœ…).
- **LimitaciÃ³n:** para compilar en esta mÃ¡quina se requiere JDK 21 (Capacitor 8) y el SDK
  local; la publicaciÃ³n cloud (demo web) sigue siendo M-18.
- **Requisitos:** REQ-04

### M-08 Â· Suite de pruebas automatizadas (âœ… Implementado)
18 comprobaciones estÃ¡ticas y de comportamiento con jsdom (P-01â€¦P-18); genera `resultados_pruebas.json`.
- **Archivos:** `test_estatico_adopta_ya.js`, script `npm test`
- **Nota P-11:** verificaciÃ³n corregida a allowlist de dependencias directas (08/10/2026)
  para que no contradiga a P-09.
- **Requisitos:** RNF-03; soporta REQ-01/02/04/05 y RNF-02

### M-09 Â· AutenticaciÃ³n y roles (â— Prototipo)
Registro, login con hashing y control de acceso por JWT; roles administrador/adoptante/veterinario.
- **Archivos:** `server/index.js` (`/auth/registro`, `/auth/login`, `/auth/perfil`);
  UI `www/index.html` + `www/js/script.js` (`ingresar`, `registrarse`, `mostrarSesion`, `cerrarSesion`).
- **Funciona:** hash con `bcryptjs` (10 rondas) y token `jsonwebtoken` (24 h); admin de demo
  `admin@adoptaya.local` / `admin123`; **cerrar sesiÃ³n** (`#btn-salir`, visible solo con sesiÃ³n
  activa) que borra el token de `localStorage` y vuelve a Â«Sin sesiÃ³n iniciadaÂ».
- **Login con Google (#11):** `POST /auth/google` verifica el ID token con `google-auth-library`
  y emite el mismo JWT; web vÃ­a Google Identity Services y APK vÃ­a plugin nativo
  (`@capgo/capacitor-social-login`). Funciona a nivel local; **falta configurar el Web client
  ID** (`docs/05_LOGIN_GOOGLE.md`).
- **LimitaciÃ³n:** sin recuperaciÃ³n de contraseÃ±a; el rol veterinario estÃ¡ definido pero sin
  panel propio.
- **Pruebas:** P-09 âœ…
- **Requisitos:** REQ-05

### M-16 Â· API REST (â— Prototipo)
Servidor con el mÃ³dulo `http` de Node (sin framework): `GET /health`, `GET /mascotas`,
`GET /mascotas/:id`, `POST/PUT/DELETE /mascotas` (solo admin), `POST /solicitudes`,
`GET /solicitudes` y `POST /solicitudes/:id/estado` (admin), `GET /solicitudes/:id/contrato`,
  `POST/GET /solicitudes/:id/evidencias`, `GET /seguimiento/alertas` (admin) y
  `/auth/registro`, `/auth/login`, `/auth/google`, `/auth/perfil`; CORS habilitado.
- **Archivos:** `server/index.js`; script `npm start`; config `server/.env.example`
- **Archivos:** `server/index.js`; scripts `npm start`, `npm run db:*`; config `server/.env.example`
- **Funciona:** usa **MySQL** si responde (`/health` â†’ `fuente: "mysql"`) y persiste todas las
  entidades; si no, cae a un store **en memoria** con aviso. Sirve tambiÃ©n la web (`www/`).
- **Pruebas:** P-05 âœ… Â· P-07 âœ…
- **Requisitos:** RNF-01 (parcial)

### M-17 Â· Persistencia MySQL (âœ… En uso)
Esquema, semilla y acceso a datos de todas las entidades sobre MySQL local.
- **Archivos:** `sql/schema.sql`, `sql/seed.sql`, `sql/servidor_mysql.js` (arranque/detenciÃ³n) y
  `sql/preparar_bd.js` (aplica esquema y siembra; `--reset`).
- **Funciona:** MySQL 8.4.9 portÃ¡til en `127.0.0.1:3307` (BD `adoptaya`); la API usa un pool de
  `mysql2` y persiste usuarios, mascotas, solicitudes, historial, evidencias y alertas.
- **LimitaciÃ³n:** MySQL es **local** (no hay servidor en la nube); si no estÃ¡ arrancado, la API
  opera en memoria.
- **Requisitos:** RNF-01

### M-11 Â· Formulario de postulaciÃ³n (â— Parcial)
Captura los datos del adoptante y su consentimiento para iniciar el proceso.
- **Archivos:** `www/index.html` (`#postulacion`), `www/js/script.js` (`enviarPostulacion`);
  backend `POST /solicitudes` (extendido con datos del solicitante).
- **Funciona:** valida nombre, correo y mascota, exige el consentimiento (Ley 1581) y crea
  la solicitud Â«en_revisionÂ» con los datos del postulante.
- **LimitaciÃ³n:** sin carga de anexos ni verificaciÃ³n de identidad.
- **Requisitos:** REQ-02

### M-12 Â· Panel de evaluaciÃ³n (â— Parcial)
Panel del refugio para revisar y resolver solicitudes.
- **Archivos:** `www/index.html` (`#panel`), `www/js/script.js` (`cargarSolicitudes`,
  `cambiarEstado`); backend `GET /solicitudes` y `POST /solicitudes/:id/estado`.
- **Funciona:** lista las solicitudes (solo rol administrador) y permite aprobar o rechazar
  con registro de historial de estados.
- **LimitaciÃ³n:** sin notificaciÃ³n al adoptante ni asignaciÃ³n de veterinario.
- **Requisitos:** REQ-02 / RNF-01

### M-13 Â· Contrato PDF (â— Prototipo)
Genera el contrato de adopciÃ³n en PDF sin dependencias externas.
- **Archivos:** `server/contrato.js` (escritor PDF 1.4 con fuentes base Helvetica);
  ruta `GET /solicitudes/:id/contrato` en `server/index.js`; botÃ³n Â«Descargar contratoÂ» en
  `www/js/script.js` (`descargarContrato`) dentro del panel.
- **Funciona:** sÃ³lo sobre solicitudes Â«aprobadaÂ»; el adoptante dueÃ±o o un administrador con
  JWT descarga el PDF (datos del adoptante, mascota y 5 clÃ¡usulas con referencia a la Ley 1581).
- **LimitaciÃ³n:** plantilla fija, sin firma digital ni anexos.
- **Requisitos:** Alcance Entrega 1 (contrato y aceptaciÃ³n formal)

### M-14 Â· Seguimiento post-adopciÃ³n (â— Parcial)
Registro de reportes con notas y fotos durante los primeros meses tras la adopciÃ³n aprobada.
- **Archivos:** `server/index.js` (`POST/GET /solicitudes/:id/evidencias`); secciÃ³n
  `#seguimiento` en `www/index.html`; `www/js/script.js` (`registrarEvidencia`,
  `cargarEvidencias`, `tarjetaEvidencia`); tabla `evidencias` en `sql/schema.sql`.
- **Funciona:** una adopciÃ³n Â«aprobadaÂ» permite al adoptante dueÃ±o o al administrador (JWT)
  registrar evidencias (descripciÃ³n obligatoria u opcional + foto data-URL leÃ­da con
  FileReader, tope 300 KB) con su `dia` desde la aprobaciÃ³n; se listan en un timeline.
  Sin token â†’ 401; sin permiso â†’ 403; solicitud no aprobada â†’ 409.
- **LimitaciÃ³n:** la foto viaja como base64 en el JSON (sin almacenamiento de archivos real);
  no hay subida a blob/CDN.
- **Pruebas:** P-15 âœ…
- **Requisitos:** REQ-03

### M-15 Â· Alertas automÃ¡ticas (â— Parcial)
Recordatorios de seguimiento a los 30/60/90 dÃ­as para cargar evidencias.
- **Archivos:** `server/index.js` (`GET /seguimiento/alertas`, solo admin); botÃ³n
  Â«Cargar alertas de seguimientoÂ» en el panel + `cargarAlertas()`/`tarjetaAlerta()`.
- **Funciona:** calcula por cada adopciÃ³n aprobada `dias_acumulados`, prÃ³ximo hito (30/60/90)
  y `estado_alerta` (`al_dia`/`vencida`/`vencida_final`/`completada`) comparando el calendario
  con las evidencias registradas en cada ventana; insignias de color en la UI.
- **LimitaciÃ³n:** no hay scheduler ni notificaciÃ³n real (correo/push); en producciÃ³n serÃ­a
  un cron + proveedor de correo (diseÃ±ado en Entregas 1-2).
- **Pruebas:** P-16 âœ…
- **Requisitos:** REQ-03

### M-10 Â· GestiÃ³n de mascotas (CRUD) (âœ… Implementado)
Panel de administración para registrar, editar y retirar mascotas, con ficha clÃ­nica.
- **Archivos:** `server/index.js` (`crearMascota`, `actualizarMascota`, `eliminarMascota`,
  rutas `POST/PUT/DELETE /mascotas`), `www/index.html` (`#gestion-mascotas`),
  `www/js/script.js` (`guardarMascota`, `editarMascota`, `eliminarMascota`,
  `cargarMascotasAdmin`, `tarjetaMascotaAdmin`), `sql/schema.sql` (columnas `salud`,
  `vacunas`, `esterilizado`).
- **Funciona:** el administrador (JWT) crea (201), actualiza (200) y elimina (200) mascotas;
  las rutas de escritura exigen rol `administrador` (401 sin token, 403 si es adoptante);
  valida `especie` (`perro`/`gato`/`otro`) y `estado` (`disponible`/`en_revision`/`adoptado`);
  la ficha clÃ­nica incluye salud, vacunas y esterilizaciÃ³n. El catÃ¡logo pÃºblico se refresca
  tras cada cambio.
- **LimitaciÃ³n:** datos en memoria (o MySQL si hay pool); sin carga de imÃ¡genes por mascota.
- **Pruebas:** P-18 âœ…
- **Requisitos:** REQ-01

---

## 2. MÃ³dulos diseÃ±ados aÃºn NO implementados

| ID | MÃ³dulo | DescripciÃ³n (diseÃ±o Entregas 1-2) | Requisito | Estado |
|---|---|---|---|---|
| M-16 | API REST | Endpoints de mascotas, solicitudes, usuarios, evidencias y estados | RNF-01 | â— (mascotas, solicitudes, auth, evidencias) |
| M-17 | Persistencia MySQL | Esquema y acceso a datos de todas las entidades | RNF-01 | âœ… (MySQL local en uso) |
| M-19 | Panel CEO | Panel de administración de alto nivel (KPIs, distribuciones, flujo, actividad y base de datos) solo para el administrador | RNF-01 | âœ… (implementado 14/10/2026) |
| M-18 | Despliegue cloud | PublicaciÃ³n web (Vercel + Render free tier) y APK de producciÃ³n | Viabilidad Entrega 1 | âœ— |

> Evidencia indirecta de intenciÃ³n MySQL: `sql/adopta_ya.session.sql`
> (`SELECT * FROM mascotas;`) y la conexiÃ³n SQLTools configurada en el `.code-workspace`.

---

## 3. Matriz de trazabilidad

| Requisito | Prioridad | MÃ³dulo(s) | Prueba | Estado real |
|---|---|---|---|---|
| REQ-01 Â· Registrar y mostrar mascotas con informaciÃ³n bÃ¡sica y estado | Alta | M-03, M-10, M-17 | P-04, P-05, P-18 | âœ… CatÃ¡logo vÃ­a API + CRUD del refugio con ficha clÃ­nica y estado |
| REQ-02 Â· Iniciar solicitud de adopciÃ³n desde la mascota | Alta | M-04, M-11, M-12 | P-06, P-07 | â— Formulario de postulaciÃ³n + evaluaciÃ³n con historial; falta ficha y notificaciones |
| REQ-03 Â· Seguimiento post-adopciÃ³n y recordatorios | Alta | M-14, M-15 | P-15, P-16 | â— Evidencias cargadas por el adoptante y alertas 30/60/90 calculadas; falta notificaciÃ³n real |
| REQ-04 Â· Interfaz responsive mÃ³vil/escritorio | Alta | M-06, M-07 | P-02, P-03, P-08, P-13, P-14 | âœ… Cumplido (APK regenerado 13/10/2026) |
| REQ-05 Â· Hashing y autenticaciÃ³n de credenciales | Alta | M-09 | P-09 | âœ… bcrypt + JWT (usuarios en memoria) |
| RNF-01 Â· Trazabilidad de solicitudes y estados | Alta | M-12, M-16, M-17 | â€” | âœ… Persistido en MySQL |
| RNF-02 Â· Sin secretos en texto plano | Alta | â€” (higiene) | P-10 | âœ… Corregido en esta revisiÃ³n |
| RNF-03 Â· Pruebas automatizadas/repetibles | Media | M-08 | P-11, P-12, P-17 | âœ… `npm test` ejecutable + kit UAT |

**Cobertura hoy:** REQ-01, REQ-04 y REQ-05 cumplidos; REQ-02 y REQ-03 parciales (con API);
RNF-01 con prototipo de API; RNF-02 y RNF-03 cumplidos. Pruebas: **18/18**. UAT: kit y
lÃ­nea base de tiempos con simulaciÃ³n (`docs/04_UAT.md`); falta la sesiÃ³n con el refugio.

---

## 4. Backlog sugerido para la Entrega 3 (orden de ataque)

| # | Tarea | MÃ³dulo | Prioridad | Nota |
|---|---|---|---|---|
| 1 | Modelar el esquema MySQL (usuarios, mascotas, solicitudes, estados, evidencias) y versionarlo en SQL | M-17 | P0 | âœ… Hecho 08/10/2026 (`sql/schema.sql`, `sql/seed.sql`). MySQL local **en uso desde 14/10/2026** (scripts `db:*` + API con `mysql2`) |
| 2 | API REST mÃ­nima: `GET /mascotas`, `POST /solicitudes` (estado Â«En revisiÃ³nÂ») | M-16 | P0 | âœ… Hecho 08/10/2026 (`server/index.js`; habilita P-05/P-07) |
| 3 | Consumir la API en `script.js` (reemplazar catÃ¡logo hardcodeado y `alert`) | M-03, M-04 | P0 | âœ… Hecho 08/10/2026 (con reserva estÃ¡tica) |
| 4 | Registro/login con bcrypt + JWT y roles | M-09 | P1 | âœ… Hecho 08/10/2026 (`server/index.js`; P-09) |
| 5 | Formulario de postulaciÃ³n + panel de evaluaciÃ³n | M-11, M-12 | P1 | âœ… Hecho 08/10/2026 (datos + consentimiento + historial) |
| 6 | Regenerar APK con Android Studio y publicar demo web | M-18 | P1 | âœ… APK regenerado 13/10/2026 (JDK 21 + SDK local; cierra F-08). â— Falta publicar la demo web (Vercel + Render) |
| 7 | Contrato PDF con plantilla | M-13 | P2 | âœ… Hecho 09/10/2026 (`server/contrato.js`, sin dependencias) |
| 8 | Seguimiento con evidencias y alertas a 30/60/90 dÃ­as | M-14, M-15 | P2 | âœ… Hecho 12/10/2026 (evidencias + alertas; sin notificaciÃ³n real) |
| 9 | UAT con el refugio y lÃ­nea base de tiempos | â€” | P2 | â— Kit + simulaciÃ³n (16 escenarios) hechos 13/10/2026 y **re-ejecutados contra MySQL el 14/10/2026 (16/16)**; ejecuciÃ³n con el refugio pendiente (`docs/04_UAT.md`). Defectos **D-001** y **D-002** corregidos 12/10/2026 |
| 10 | CRUD de mascotas con ficha clÃ­nica para el refugio | M-10 | P1 | âœ… Hecho 12/10/2026 (`server/index.js` + panel `#gestion-mascotas`; P-18) |
| 11 | Login con Google (web + APK) | M-09 | P2 | â— Implementado 14/10/2026 (`POST /auth/google` + GIS web + plugin nativo; P-11). Falta **configurar el Web client ID** y probarlo (`docs/05_LOGIN_GOOGLE.md`) |

---

## 5. Resumen para sustentaciÃ³n

- **Se puede demostrar:** interfaz responsive, catÃ¡logo dinÃ¡mico desde la API, registro de
  solicitud Â«en revisiÃ³nÂ», login/registro con JWT (y **con Google** en local), panel de
  evaluaciÃ³n con descarga del contrato de adopciÃ³n en PDF, seguimiento post-adopciÃ³n con
  evidencias (notas y fotos) y alertas del refugio a los 30/60/90 dÃ­as, CRUD de mascotas con
  ficha clÃ­nica, navegaciÃ³n, empaquetado Android y 18 pruebas automatizadas en verde; ademÃ¡s,
  el **kit de UAT con lÃ­nea base de tiempos** (16 escenarios y mediciÃ³n reproducible con
  `npm run uat:medir`).
- **Se puede probar con evidencia:** `npm test` (tabla P-01â€¦P-18), `resultados_pruebas.json`,
  la API local (`npm start`) y los artefactos UAT (`docs/04_UAT.md`, `docs/uat/`).
- **No se puede afirmar:** que exista un sistema integral de adopciones en producciÃ³n; hoy
  es un prototipo full-stack local (web + API + MySQL local, notificaciones por correo
  pendientes) con la arquitectura/backlog definidos para completarlo. Falta publicar la demo
  web (M-18) y **configurar las credenciales para probar el login con Google (#11)**.
