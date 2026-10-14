# PROGRESO — Bitácora viva de ¡ADOPTA YA!

> Se actualiza automáticamente en **cada paso completado** (Regla 2 de `AGENTS.md`) y se
> hace commit+push de inmediato: si la PC se apaga, el avance ya está en GitHub.
> Entradas más recientes arriba.

---

## 2026-10-14 (Fase 15 — Login con Google funcionando en web + Panel CEO)

### Login con Google (#11): cierre en web
- **Credenciales configuradas:** Web client ID
  `823605358525-ddd7eabhckt0ekj937npstkvnha3p8cl.apps.googleusercontent.com` puesto en
  `server/.env` (`GOOGLE_CLIENT_ID`) y en `www/js/script.js` (`GOOGLE_CLIENT_ID`);
  `server/.env` local con `JWT_SECRET` propio y `CLAVE_ADMIN` (gitignored). `npm run sync`
  ejecutado.
- **Diagnóstico en el flujo web:** `googleEstado()` + `#google-estado` (con CSS `.google-estado`)
  y claves i18n `google_cargando`/`google_error`; `cargarGoogleScript` con `onerror` y
  `dataset.cargado`; `procesarCredencialGoogle` reporta el error del servidor; `inicializarGoogle`
  con guard y arranque al abrir `#modal-login`.
- **Causa raíz del 401 «Token de Google inválido»:** la verificación de certificados de Google
  fallaba por la **inspección TLS corporativa** (`self-signed certificate in certificate chain`)
  al llamar a `https://www.googleapis.com/oauth2/v1/certs`.
- **Fix TLS duradero (no depende del entorno):** `server/index.js` arma un `https.Agent` con
  `[...tls.rootCertificates, ...CAs extra]`; las CAs extra se leen de `CA_BUNDLE_PATH` →
  `NODE_EXTRA_CA_CERTS` → por defecto `certs/windows-ca-bundle.pem`. Se pasa como
  `transporterOptions.agent` a `OAuth2Client`. `certs/` añadido a `.gitignore`; `CA_BUNDLE_PATH`
  documentado en `server/.env.example`.
- **Verificación E2E (web):** login real con `diegojedap@gmail.com` → usuario creado en MySQL
  (`proveedor: google`, `rol: adoptante`, `id: 3`). `npm run sync` + `npm test` → **18/18**.
- **P-10 ajustado:** ahora ignora el archivo `.env` local (gitignored, `**/.env`); sigue
  escaneando `.env.example` y el resto. Evita la falsa alarma al existir `server/.env`.
- **Pendiente en APK:** confirmar la **credencial Android** (paquete `com.adoptaya.app` + SHA-1)
  en Google Cloud para probar el login nativo del APK.

### Panel CEO (M-19) — vista de control solo para el administrador
- **Backend (`server/index.js`):** `usuarioAdmin()` (sanitiza, sin `clave_hash`),
  `listarUsuarios()`, `listarTodasEvidencias()`, `contarPor()` y `resumenAdmin()`
  (KPIs, distribuciones por rol/proveedor/estado/especie, `flujo`, `actividad` y `tablas`).
  Nueva ruta **`GET /admin/resumen`** (solo admin); `/admin` añadido a `prefijosApi`.
- **Frontend:** botón **«Panel CEO»** (`#btn-ceo`, gradiente teal→coral) en la barra, visible solo
  para admin; modal `#modal-ceo` con 7 pestañas (Resumen, Flujo, Mascotas, Solicitudes, Usuarios,
  Seguimiento, Base de datos). En `script.js`: `esAdmin()`, `abrirPanelCeo()`,
  `cargarResumenCeo()`, `mostrarPestanaCeo()`, `renderCeo()` y helpers (`kpiCeo`, `barrasCeo`,
  `tablaObjetosCeo`, `cajaFlujo`, `cajaBd`, `escaparCeo`) + i18n `ceo_*` ES/EN. `mostrarSesion`
  alterna `#btn-panel`, `#btn-gestion` y `#btn-ceo` según rol; al cambiar idioma con el panel
  abierto se re-renderiza. Estilos del dashboard en `style.css` (`.ceo-*`).
- **Verificación:** `GET /admin/resumen` con token admin → `fuente=mysql`, KPIs y tablas (usuarios
  sin `clave_hash`); HTML/JS servidos contienen el modal y las funciones; `npm test` **18/18**.

---



- **Backend:** `POST /auth/google` verifica el ID token con `google-auth-library@11.3.0`
  (audiencia = `GOOGLE_CLIENT_ID`), crea/vincula el usuario y emite el JWT propio. `server/.env`
  se carga con `process.loadEnvFile` (sin `dotenv`). Esquema `usuarios` migrado de forma
  idempotente en `sql/preparar_bd.js`: `clave_hash` → NULL, `proveedor` (`local`/`google`) y
  `google_sub` (único). `.env` añadido a `.gitignore` (se conserva `.env.example`).
- **Web:** botón «Continuar con Google» en `#modal-login` con Google Identity Services
  (script cargado dinámicamente para no romper P-01); `inicializarGoogle`/`ingresarConGoogle`/
  `procesarCredencialGoogle` y textos i18n ES/EN (`btn_google`, `acceso_o`).
- **APK:** plugin nativo `@capgo/capacitor-social-login@8.5.17` (Credential Manager; solo Google
  en `capacitor.config.json`; no requiere tocar `MainActivity`). `API_BASE` ahora es
  `http://10.0.2.2:3000` en nativo y se añadió `android/.../res/xml/network_security_config.xml`
  (cleartext) referenciado en el manifest. APK regenerado: **8.33 MB** (`assembleDebug`,
  ~3m25s con JDK 21 portátil).
- **Pruebas/verificación:** `npm test` → **18/18** (P-11 amplió su allowlist con
  `google-auth-library` y `@capgo/capacitor-social-login`); E2E de `/auth/google` contra MySQL:
  400 sin token, 500 sin `GOOGLE_CLIENT_ID`, 401 con token inválido; login propio admin OK.
- **Documentación:** nuevo `docs/05_LOGIN_GOOGLE.md` (guía de credenciales Web/Android + SHA-1
  `EC:57:87:...:E5:BF`, diseño del flujo y pasos); `AGENTS.md` y `docs/03_MODULOS.md` (M-09, #11).
- **Entorno:** por la inspección TLS corporativa, `npm install` requiere
  `NODE_EXTRA_CA_CERTS` (bundle de CAs raíz de Windows) y el build Android requiere importar
  esas CAs al truststore del JDK 21. Quedó documentado en `AGENTS.md` §3/§5.
- **Pendiente (humano):** crear las credenciales de Google Cloud y aportar el **Web client ID**
  (ponerlo en `server/.env` y `www/js/script.js`, `npm run sync`, recompilar) para probar el
  login real de punta a punta en web y APK.

---

## 2026-10-14 (Fase 13 — MySQL local, API persistente y web servida por la API)

- **MySQL local funcionando** (portátil, sin permisos de administrador): MySQL 8.4.9 en
  `C:\Users\diego_ojeda\mysql`, puerto **3307**, `127.0.0.1`, usuario `root` sin contraseña
  local. Se inicializó el `datadir` (`--initialize-insecure`), se creó `my.ini` y se arranca
  con `npm run db:iniciar` (o se detiene con `db:detener`; estado con `db:estado`).
- **Scripts npm nuevos:** `db:iniciar`, `db:detener`, `db:estado` (`sql/servidor_mysql.js`) y
  `db:preparar` / `db:reset` (`sql/preparar_bd.js`, aplica `sql/schema.sql` y siembra; `--reset`
  trunca y resiembra para la UAT).
- **API con MySQL (`server/index.js`):** se añadió `mysql2` a `dependencies`. Si MySQL responde,
  `fuente=mysql` y todas las operaciones (usuarios, registro/login con hash, mascotas,
  solicitudes, historial, evidencias y alertas) usan la base; si no, cae al store en memoria con
  aviso en consola. `GET /health` informa la fuente. Los usuarios dejan de ser solo memoria
  (se cierra el gap de `solicitudes.adoptante_id`).
- **Web servida por la API:** `GET /` y los estáticos de `www/` (html, css, js, imágenes) se
  sirven desde `http://localhost:3000` con sus `Content-Type`; `npm start` levanta web + API juntas.
- **Esquema/datos:** `evidencias.url` y `evidencias.descripcion` quedan `NULL` (M-14); `seed.sql`
  idempotente sin admin placeholder; nombre de BD unificado a **`adoptaya`** en
  `.vscode/settings.json` y `adopta-ya.code-workspace`.
- **Verificación:** `npm run db:preparar` → 3 mascotas · 1 usuario; E2E por HTTP OK
  (`/health` = mysql, estáticos 200, registro 201, login, mascota, solicitud, aprobación con nota,
  evidencia día 0, alertas); `npm test` → **18/18 PASA**; `npm run db:reset` +
  `node uat/ejecutar_uat.js` → **16/16 Aceptado** contra MySQL (`docs/uat/resultados_simulacion_2026-10-14.csv`).
  El script de UAT y `uat:medir` ahora nombran el CSV/leen el más reciente por fecha.
- **Pendiente (humano):** UAT presencial con el refugio (backlog #9); publicar la demo web (M-18);
  login con Google (roadmap #11, admin `diegojedap@gmail.com`).

---

## 2026-10-13 (Fase 12 — Cerrar sesión)

- **Botón «Cerrar sesión»** (`#btn-salir`) en la barra de navegación, visible **solo** cuando hay
  sesión activa; el botón «Iniciar sesión» (`#btn-entrar`) se oculta en ese caso y vuelve a
  mostrarse al salir. Nueva función `cerrarSesion()` en `www/js/script.js`: borra
  `localStorage.token`, reinicia la sesión (`mostrarSesion(null)`) y cierra el modal de login.
  `mostrarSesion()` ahora también alterna la visibilidad de ambos botones.
- **Bilingüe:** clave `nav_salir` («Cerrar sesión» / «Sign out») en el diccionario; se traduce
  automáticamente porque `aplicarIdioma()` recorre `[data-i18n]` y recalcula la sesión.
- **Verificación:** `npm test` → **18/18 PASA**; `node uat/ejecutar_uat.js` → **16/16 Aceptado**.
  APK regenerado (**4.138.845 bytes**) e instalado en `adopta_ya`; verificado por DevTools del
  WebView que con sesión `#btn-salir` se muestra (y `#btn-entrar` se oculta) y que `cerrarSesion()`
  borra `localStorage.token` y restaura «Sin sesión iniciada». Capturas:
  `C:\Users\diego_ojeda\Downloads\adopta_ya_cerrar_sesion_visible.png` y
  `adopta_ya_cerrar_sesion_hecho.png`.
- **Docs:** `docs/03_MODULOS.md` (M-09), `AGENTS.md`.

---

## 2026-10-13 (Fase 11 — Bilingüe español/inglés, web y APK)

- **Soporte bilingüe (ES/EN)** con botón `#btn-idioma` en la barra (`🌐 EN` / `🌐 ES`).
  El idioma por defecto es **español** (no se autodetecta el sistema, para no romper las
  pruebas ni la UAT, que esperan textos en español) y la elección se **recuerda** en
  `localStorage.idioma`.
- **Implementación sin dependencias:** textos estáticos marcados con `data-i18n` (contenido) y
  `data-i18n-ph` (placeholders); un `DICCIONARIO` `{es, en}` en `www/js/script.js` y la función
  `t(clave, ...args)` para los textos dinámicos. `aplicarIdioma()` recorre el DOM, `alternarIdioma()`
  cambia de idioma y `inicializarIdioma()` restaura la preferencia; se actualiza
  `document.documentElement.lang`. Todos los mensajes dinámicos (sesión, postulación, panel,
  gestion, seguimiento) pasan por `t()`; las cadenas en español que verifican las pruebas/UAT se
  mantuvieron idénticas. Los errores del servidor (API) permanecen en español.
- **Verificación:** `npm test` → **18/18 PASA**; `node uat/ejecutar_uat.js` → **16/16 Aceptado**
  (UAT-11 confirma `lang="es"` por defecto). APK regenerado (**4.138.702 bytes**) e instalado en
  el emulador `adopta_ya`; verificado por DevTools del WebView que el idioma alterna
  (`lang` `es`↔`en`, hero, catálogo, botones, placeholders y pie; 3 tarjetas, 5 modales, 7 botones
  de nav). Capturas: `C:\Users\diego_ojeda\Downloads\adopta_ya_idioma_es.png` y
  `adopta_ya_idioma_en.png`.
- **Docs:** `AGENTS.md` §3, `docs/02_ARQUITECTURA.md`, `docs/03_MODULOS.md` (M-02).
- **Pendiente (humano):** UAT presencial con el refugio (backlog #9); demo web (M-18).

---

## 2026-10-13 (Fase 10 — Tema claro/oscuro y formularios en modales)

- **Modo claro/oscuro** con botón `#btn-tema` en la barra: sigue la preferencia del sistema
  por defecto y **recuerda** la elección del usuario en `localStorage.tema`. Script anti-parpadeo
  en el `<head>` que fija `data-theme` antes de pintar; el tema se define con variables CSS
  (`[data-theme="dark"]` redefine superficies, texto, líneas, inputs y semánticos) sin añadir
  `@media` nuevos (el sistema se detecta en JS, para no romper P-03).
- **Formularios detrás de botones/modales:** la portada queda limpia (hero + catálogo +
  responsabilidad) y cada formulario (login, postulación, seguimiento, panel y gestión) vive en
  un modal (`#modal-login`, `#modal-postulacion`, `#modal-seguimiento`, `#modal-panel`,
  `#modal-gestion`). Se abren/cierran con `abrirModal()`/`cerrarModal()`, clic en el fondo, botón ✕
  o tecla Esc. **Se conservaron todos los IDs** (incl. `#seguimiento`, `#gestion-mascotas`,
  `#lista-mascotas-admin`) y las funciones `ingresar()`/`registrarse()`/`mostrarSesion()`.
- **Sesión en la barra:** `#sesion` pasa a la barra de navegación (siempre visible) como píldora.
- **Verificación:** `npm test` → **18/18 PASA**; `node uat/ejecutar_uat.js` → **16/16 Aceptado**.
  APK regenerado e instalado en el emulador `adopta_ya`; se verificó por DevTools del WebView que
  el tema alterna (fondo `#f1f6f5` ↔ `#0c1615`, 3 tarjetas, 5 modales, 6 botones de nav, icono
  🌙/☀️). Capturas: `C:\Users\diego_ojeda\Downloads\adopta_ya_tema_claro.png` y
  `adopta_ya_tema_oscuro.png`.
- **Docs:** `AGENTS.md` §3, `docs/02_ARQUITECTURA.md`, `docs/03_MODULOS.md` (M-06).
- **Pendiente (humano):** UAT presencial con el refugio (backlog #9); demo web (M-18).

---

## 2026-10-13 (Fase 9 — Rediseño visual: teal + coral, web y APK)

- **Interfaz rediseñada** para un aspecto más atractivo y profesional, con una paleta
  nueva en **variables CSS**: primario **teal `#0f766e`**, acento **coral `#f97316`**,
  fondos menta claros y textos verde-oscuro. Los colores viven en `:root`, así que se
  cambian en un solo lugar.
- **`www/css/style.css` reescrito** (barra de navegación pegajosa, hero con degradado y
  marca de agua, tarjetas del catálogo con cabecera degradada y hover, formularios con
  anillo de foco, insignias de estado recoloreadas, pie oscuro, animación de entrada con
  `prefers-reduced-motion`).
- **`www/index.html` actualizado**: barra de navegación con la marca y enlaces de anclaje,
  hero con etiqueta («Adopción responsable») y encabezados de sección tipo *eyebrow*.
  Se conservaron **todos los IDs, las 3 tarjetas `.tarjeta`, el `viewport`, `lang="es"` y
  la media query**, de modo que P-01…P-18 y el arnés UAT siguen válidos.
- **Verificación:** `npm test` → **18/18 PASA**; `node uat/ejecutar_uat.js` →
  **16/16 Aceptado** (línea base regenerada: 100 %, promedio 0,1 s); hashes de
  `www/` ↔ `android/.../assets/public/` idénticos.
- **APK regenerado** (13/10/2026, ~4,14 MB) e **instalado y probado en el emulador**
  `adopta_ya` (Android 16, x86_64). Capturas guardadas en
  `C:\Users\diego_ojeda\Downloads\adopta_ya_final_hero.png` y
  `adopta_ya_final_mascotas.png`.
- **Docs actualizadas:** `docs/02_ARQUITECTURA.md` (paleta), `docs/03_MODULOS.md` y
  `docs/01_INFORME_DE_AUDITORIA.md` (referencias simbólicas en vez de líneas frágiles).
- **Pendiente (humano):** UAT presencial con el refugio (backlog #9); demo web (M-18).

---

## 2026-10-13 (Fase 8 — Kit de la sesión UAT real con el refugio)

- **Material de la sesión presencial creado en `docs/uat/`:**
  - `facilitacion.md` — guía del facilitador: cronometraje, orden de bloques, registro CSV con
    una columna de sesión por participante (`REFUGIO-<ROL>-<N>`), severidades y decisión.
  - `hoja_participante_adoptante.md` y `hoja_participante_admin.md` — pasos por rol para los
    16 escenarios con su resultado esperado.
  - `acta_uat_plantilla.md` — plantilla del acta real (participantes, resultados, defectos,
    decisión, evidencias y firmas); **sustituye** al acta de simulación.
  - `checklist_sesion.md` — verificación del entorno antes/durante/después de la sesión.
  - `docs/04_UAT.md` §4 enlaza el material nuevo.
- **Pendiente (humano):** agendar y ejecutar la UAT con el refugio (backlog #9); tras la
  UAT presencial, demo web (M-18, persistencia en memoria).

---

## 2026-10-13 (Fase 7 — UAT simulada EJECUTADA: 16/16 en el frontend real)

- **La simulación pasó de tabla manual a ejecución real:** nuevo `uat/ejecutar_uat.js`
  (jsdom + fetch enrutado a la API local) que **ejecuta y cronometra los 16 escenarios**
  sobre `www/index.html` + `www/js/script.js` reales y verifica además los códigos HTTP.
  Resultado: **16/16 Aceptado** (2026-10-13, sesión `REFUGIO-SIM`), CSV reescrito
  `docs/uat/resultados_simulacion_2026-10-13.csv`, línea base regenerada (`npm run
  uat:medir` → 100 %, promedio 0,2 s) y acta `docs/uat/acta_uat_2026-10-13.md`.
  Comando reproducible: `node uat/ejecutar_uat.js` (requiere API limpia).
- **Defecto detectado y corregido en la misma jornada (D-003, menor):** la evidencia del
  **día 0** se mostraba como «?» (`dia || "?"` con 0 falsy) en `registrarEvidencia()` y
  `tarjetaEvidencia()` de `www/js/script.js`; corregido con `dia ?? "?"`. **APK regenerado**
  sobre la fuente corregida (13/10/2026, 4.132.765 bytes) y `npm run sync` aplicado;
  `npm test` → **18/18 PASA**.
- **Pendiente (humano):** la UAT presencial con el refugio sigue pendiente (backlog #9).

**Siguiente paso:** publicar la demo web (M-18) y/o ejecutar la UAT real con el refugio.

---

## 2026-10-13 (Fase 6 — UAT: kit ampliado al CRUD de mascotas, 16 escenarios)

- **Kit UAT ampliado a 16 escenarios:** se añadieron **UAT-13…UAT-16** para cubrir el CRUD de
  mascotas con ficha clínica (M-10), que la simulación anterior no probaba:
  - UAT-13 registro (valida nombre/edad/especie/estado) · UAT-14 edición (precarga ficha y
    persiste el cambio) · UAT-15 eliminación (confirma y da de baja del catálogo) ·
    UAT-16 control de acceso (escritura solo admin: 401 sin sesión, 403 adoptante).
  - **Validación end-to-end contra la API local:** POST 201, PUT 200, DELETE 200, GET posterior
    404, especie inválida 400, sin token 401 y adoptante 403; registro+login adoptante OK.
- **Artefactos:** `docs/uat/guion_escenarios.md` (+4 bloques), `docs/uat/plantilla_registro.csv`
  (+4 filas), `docs/04_UAT.md` (roles admin, tabla, alcance, salida e indicador a 16), nueva
  simulación consolidada `docs/uat/resultados_simulacion_2026-10-13.csv` (sustituye a la de
  2026-10-12), `uat/medir_linea_base.js` (default → CSV nuevo) y prueba **P-17** ampliada a
  UAT-16. `README.md`, `AGENTS.md` y `03_MODULOS.md` sincronizados.
- **Verificación:** `npm run uat:medir` → línea base con **16 escenarios** (éxito global 100 %,
  promedio 31,1 s); `npm test` → **18/18 PASA**.
- **Pendiente (humano):** ejecutar la UAT real con el refugio (backlog #9).

**Siguiente paso:** publicar la demo web (M-18) y/o ejecutar la UAT real con el refugio.

---

## 2026-10-13 (Fase 5 — APK regenerado: F-08 y F-11 resueltos)

- **Hallazgo F-08 cerrado:** el APK debug se **regeneró** por fin sobre la fuente corregida.
  - **Entorno real (corrige la memoria):** el Android SDK **sí estaba** en `C:\Android`
    (platform 36, build-tools 36.0.0, licencias aceptadas) y hay **JDK 17** en
    `C:\Java\jdk-17.0.20.1+1`; `local.properties` ya apuntaba al SDK local (**F-11 resuelto**).
  - **JDK 21:** Capacitor 8 compila con `sourceCompatibility 21`, así que se descargó un
    **JDK 21 portátil** (Temurin 21.0.12.1) al temp y se usó como `JAVA_HOME`.
  - **TLS corporativo:** la descarga de `dl.google.com` fallaba por inspección TLS; se
    importaron las **CAs raíz de Windows** al truststore del JDK 21 (`keytool
    -importkeystore -srcstoretype Windows-ROOT`) y el build pasó.
  - **Comandos:** `npm run sync` + `gradlew.bat assembleDebug --no-daemon --no-watch-fs` →
    **BUILD SUCCESSFUL** (2m 5s).
- **Verificación:** APK `app-debug.apk` = **4,13 MB** (13/10/2026 09:45); contiene
  `assets/public/css/style.css`, `index.html` y `js/script.js` (rutas minúsculas); hashes de
  `www/` idénticos a la copia empaquetada.
- **Docs:** `01_INFORME_DE_AUDITORIA.md` (F-08 y F-11 → RESUELTO, P-14 y tablas),
  `02_ARQUITECTURA.md` (empaquetado, tooling Java, riesgo JDK/SDK mitigado),
  `03_MODULOS.md` (M-07 ✅, REQ-04, backlog #6), `04_UAT.md`, `README.md` y `AGENTS.md`.
- **Estado:** `npm test` → **18/18**. Backlog #6 en su parte de APK ✅; queda publicar la
  demo web (M-18) y la UAT real con el refugio.

**Siguiente paso:** publicar la demo web (M-18) y/o ejecutar la UAT real con el refugio.

---

- **M-10 implementado (REQ-01 ✅):** el refugio (admin) ahora **registra, edita y elimina**
  mascotas con **ficha clínica**.
  - **API (`server/index.js`):** `POST /mascotas` (201), `PUT /mascotas/:id` (200),
    `DELETE /mascotas/:id` (200); escritura solo con rol `administrador` (401 sin token,
    403 si es adoptante); validación de `especie` (`perro`/`gato`/`otro`) y `estado`
    (`disponible`/`en_revision`/`adoptado`); CORS con `PUT`/`DELETE`.
  - **Ficha clínica:** columnas `salud`, `vacunas`, `esterilizado` en `sql/schema.sql`
    (+ `ALTER TABLE` comentado para bases existentes) y `sql/seed.sql` actualizado.
  - **Frontend:** sección `#gestion-mascotas` en `www/index.html`; funciones `guardarMascota`,
    `editarMascota`, `eliminarMascota`, `cargarMascotasAdmin`, `tarjetaMascotaAdmin` en
    `www/js/script.js`; estilos en `www/css/style.css`.
- **Verificación:** `npm run sync` OK; `npm test` → **18/18 PASA** (nueva prueba **P-18**);
  prueba end-to-end del CRUD contra la API → **12/12 OK** (crear/listar/editar/eliminar +
  401/403/400/404).
- **Docs:** `docs/03_MODULOS.md` (M-10 ✅, trazabilidad REQ-01 ✅, backlog #10),
  `AGENTS.md` (estado 18/18 y rutas).
- **Backlog #10 (`docs/03_MODULOS.md`)** queda ✅. Siguiente: APK (M-18) → UAT real con el refugio.

**Siguiente paso:** APK (M-18, bloqueado sin Android SDK/JDK 17) y/o UAT real con el refugio.

---

## 2026-10-12 (Fase 3 — Defectos de la simulación UAT)

- **D-001 (Medio) corregido:** el formulario de postulación ahora muestra el **número de
  solicitud** creado (`enviarPostulacion` → `#post-estado`).
- **D-002 (Bajo) corregido:** el panel de evaluación captura el **motivo del rechazo**
  (`cambiarEstado` pide la nota) y la **tarjeta de la solicitud** la muestra con
  `ultimaNota()` + estilos `.nota-estado` (nueva regla en `www/css/style.css`).
- **Verificación:** `npm run sync` OK; `npm test` → **17/17 PASA**. End-to-end con la API:
  postulación (201 con `id`) y rechazo con nota (el historial y el listado devuelven la
  nota) → 5/5 OK.
- Backlog #9 (`docs/03_MODULOS.md`) sigue **◐** (kit + simulación hechos; falta la sesión
  real con el refugio), pero los dos defectos hallados en la simulación quedan resueltos.

**Siguiente paso:** ejecutar la UAT real con el refugio y/o APK (M-18, bloqueado sin Android
SDK/JDK 17).

---

## 2026-10-12 (Fase 2 — UAT y línea base de tiempos)

- **Kit de UAT creado:** `docs/04_UAT.md` (plan de aceptación con el refugio: objetivo,
  alcance y límites, actores, entorno, criterios de salida, clasificación de defectos y
  protocolo de **línea base de tiempos**); `docs/uat/guion_escenarios.md` con **12
  escenarios (UAT-01…UAT-12)** trazados a REQ-01…REQ-05/RNF-01/M-13;
  `docs/uat/plantilla_registro.csv` para capturar resultados, defectos y tiempos.
- **Medición reproducible:** `uat/medir_linea_base.js` (Node sin dependencias) + script
  `npm run uat:medir`; lee el CSV y genera `docs/uat/linea_base_tiempos.json`
  (mín/prom/máx por tarea y % de éxito).
- **Simulación opencode (no sustituye al refugio):** `docs/uat/resultados_simulacion_2026-10-12.csv`
  con los 12 escenarios; la API se probó end-to-end (mascotas, registro/login admin y
  adoptante, solicitud, aprobar/rechazar, contrato PDF `%PDF-` de 2669 bytes, evidencia
  `día 0`, alertas y los rechazos 401/403/409). Tiempos de la simulación = **referencia**;
  la sesión real con usuarios debe reemplazarlos.
- **Suite:** nueva prueba **P-17** (existe el kit UAT y el script `uat:medir`) → **17/17**
  tras `npm run sync` (P-13 requiere la copia Android, que está en `.gitignore`).
- **Defectos de simulación (mejoras sugeridas):** D-001 Medio (la UI no muestra el n.º de
  solicitud creado tras postular) y D-002 Bajo (la nota de rechazo no se ve en la tarjeta).

**Siguiente paso:** ejecutar la UAT real con el refugio usando el kit → cargar resultados y
correr `npm run uat:medir`; en paralelo, APK (M-18, requiere Android Studio/JDK 17).

---

## 2026-10-12 (Fase 1 — APK)

- **APK:** intento de regeneración fallido por entorno (sin Android SDK, sin JDK 17; JDK 11 presente,
  Gradle 8.14.3 descargado localmente, pero AGP 8.13.0 necesita dependencias de Google/Maven
  que no son accesibles desde esta máquina / sin certificados válidos para dl.google.com).
  `npm run sync` copió correctamente los assets web nuevos (www/ → `android/app/src/main/assets/public/`)
  y sus hashes coinciden. El APK debug existente (`4119956 bytes`, SHA256
  3EECEE0E052346B848C74F80F5197FEC83ADB794BA20BAFDE156A1913737B3E9) **es anterior a M-14/M-15**
  (no incluye la sección `#seguimiento`, botón «Cargar alertas» ni lógica JS/CSS asociada).
- **Estado:** M-07 sigue como ◐ (APK viejo). Hallazgo **F-08** se mantiene pendiente.
- **Acción recomendada:** regenerar APK en un entorno con Android Studio + SDK instalado (conexión
  a internet) usando `npm run sync` + build, o bien generar en otra máquina y sustituirlo.

**Siguiente paso:** UAT con el refugio (entregables: README, pruebas 16/16, API funcionando,
prototipo web + APK con assets actualizados cuando sea posible).

---

## 2026-10-12 (Fase 1 — M-14/M-15)

- **M-14 seguimiento post-adopción:** `server/index.js` con store `evidencias` y rutas
  `POST/GET /solicitudes/:id/evidencias` (admin o adoptante dueño con JWT, sólo solicitudes
  «aprobada»; 409 si no está aprobada, 403 sin permiso, 401 sin token). La evidencia guarda
  `descripcion` opcional o `url` (foto data-URL generada con FileReader en el frontend,
  límite 300 KB) y su `dia` desde la aprobación (`revisado_en`). Sección nueva `#seguimiento`
  en `www/index.html` + `registrarEvidencia()`, `cargarEvidencias()`. Tabla `evidencias`
  de `sql/schema.sql` sincronizada si hay pool MySQL.
- **M-15 alertas automáticas:** `GET /seguimiento/alertas` (solo admin) calcula por cada
  adopción aprobada `dias_acumulados`, próximo hito 30/60/90 y `estado_alerta`
  (`al_dia`/`vencida`/`vencida_final`/`completada`) según las evidencias registradas en cada
  ventana. Botón «Cargar alertas de seguimiento» en el panel + tarjetas con insignias.
  Sin scheduler ni correo (límite del prototipo: en producción sería cron + notificación).
- **Verificación:** suite ampliada a **P-01…P-16 → 16/16** (P-15 evidencias, P-16 alertas,
  ambos REQ-03); `npm run sync` OK; API probada end-to-end (login, registro, solicitud,
  aprobación, evidencias 401/409/201, alertas admin/401/403).

**Siguiente paso:** APK (M-18, requiere Android Studio/JDK 17, bloqueado en esta máquina)
→ luego UAT con el refugio (Entregas 2 y 3).

---

## 2026-10-09 (Fase 1 — M-13)

- **M-13 contrato PDF:** `server/contrato.js` escribe un PDF 1.4 válido sin dependencias
  (Helvetica base, WinAnsi); ruta `GET /solicitudes/:id/contrato` (sólo solicitudes
  «aprobada»; administrador o el adoptante dueño, JWT). Botón «Descargar contrato» en el
  panel (`descargarContrato()` descarga el blob con token).
- **Verificación:** `npm test` → **14/14**; `npm run sync` OK; endpoint probado: PDF
  `%PDF-` de ~2,6 KB con cláusulas Ley 1581; 401 sin token, 409 si la solicitud no está
  aprobada.

**Siguiente paso:** APK (M-18, requiere Android Studio/JDK 17) → luego seguimiento con
evidencias (M-14/M-15) antes de UAT.

---

## 2026-10-09 (Fase 1 — M-11/M-12)

- **M-11 formulario de postulación:** captura datos del adoptante (nombre, email, teléfono,
  motivación) + consentimiento Ley 1581; `POST /solicitudes` ampliado; sección nueva en
  `www/index.html` + `enviarPostulacion()`.
- **M-12 panel de evaluación:** `GET /solicitudes` y `POST /solicitudes/:id/estado`
  (solo administrador, JWT) con historial de estados; panel en la web (`cargarSolicitudes`,
  `cambiarEstado`). Esquema ampliado: columnas de solicitante/consentimiento +
  tabla `historial_estados`.
- **Verificación:** `npm test` → **14/14**; API probada end-to-end (postulación OK,
  401 sin token, lista admin OK, aprobación con historial OK); `npm run sync` OK; hashes
  idénticos; sin credenciales.

**Siguiente paso:** APK (M-18, requiere Android Studio/JDK 17) o desplegar demo web; luego
contrato PDF (M-13) y seguimiento con evidencias/alertas (M-14/M-15).

---

## 2026-10-09 (Fase 1)

- **M-09 auth/roles completado (prototipo):** `bcryptjs` + `jsonwebtoken` instalados desde
  la caché offline; endpoints `POST /auth/registro`, `POST /auth/login` (JWT Bearer) y
  `GET /auth/perfil`; roles administrador/adoptante/veterinario; admin de demo
  `admin@adoptaya.local` / `admin123` (usuarios en memoria).
- **UI de acceso** en `www/index.html` + `www/js/script.js` + estilos (ingresar/registrarse).
- **Verificación:** `npm test` → **14/14** (P-09 cierra); auth probada end-to-end
  (login OK, registro OK, perfil con token OK, credenciales malas → 401); `npm run sync` OK;
  hashes idénticos; sin credenciales.
- **Docs actualizadas:** AGENTS.md, README.md, docs/01, docs/02, docs/03.

**Siguiente paso (Fase 1):** formulario de postulación del adoptante (M-11, con
consentimiento Ley 1581) + panel de evaluación (M-12).

---

## 2026-10-09

- **Fase 0 completada (backlog P0):** esquema MySQL versionado (`sql/schema.sql`,
  `sql/seed.sql`); API REST local sin dependencias (`server/index.js` + `npm start`);
  frontend consume la API (`www/js/script.js`: `fetch` en catálogo, `POST /solicitudes`
  en `adoptar`) con reserva estática si no hay servidor.
- **Defecto del test corregido:** P-11 ahora usa allowlist de dependencias directas, así
  deja de contradecir a P-09 (permitirá 14/14 al añadir auth en Fase 1).
- **Verificación:** `npm test` → **13/14** (P-05 y P-07 pasan; sólo falla P-09); API probada
  (`/health`, `/mascotas`, `POST /solicitudes`); `npm run sync` OK (hashes idénticos);
  sin credenciales.
- **Docs actualizadas:** AGENTS.md, README.md, docs/02_ARQUITECTURA.md, docs/03_MODULOS.md.

**Siguiente paso (Fase 1, P1):** auth con `bcryptjs` + `jsonwebtoken` y roles (M-09) para
cerrar P-09 → formulario de postulación + panel de evaluación (M-11/M-12).

---

## 2026-10-08

- **Reorganización completada:** proyecto aplanado a un solo nivel (fin del anidamiento
  `ADOPTA-YA 1.0/ADOPTA-YA 1.0/`); PDFs → `docs/entregas/`; SQL → `sql/`;
  workspace renombrado a `adopta-ya.code-workspace`; documentación con rutas
  actualizadas; verificación OK (npm test 11/14, hashes `www/` ↔ `assets/public`
  idénticos, cero credenciales). Commits `934cd1f` + `deee43d` en origin/master.
- **Memoria de opencode creada:** `AGENTS.md` (contexto completo + reglas de verificación
  y progreso), `opencode.json` (autoupdate, snapshot, share off, instructions),
  comando `/verificar-memoria`, este `PROGRESO.md`.

**Estado del proyecto:** 11/14 pruebas PASS · M-01…M-08 implementados (3 ◐) ·
M-09…M-18 pendientes · APK pendiente de regenerar (F-08, sin SDK/JDK17 en esta máquina).

**Siguiente paso sugerido (Entrega 3, backlog P0):** modelar esquema MySQL y versionarlo
en `sql/` → API REST mínima (`GET /mascotas`, `POST /solicitudes`) → consumirla en
`script.js`. Detalle en `docs/03_MODULOS.md` §4.
