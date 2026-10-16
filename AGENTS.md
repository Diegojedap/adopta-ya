# ADOPTA YA 1.0 — Memoria del proyecto

> Esta es la memoria de contexto de opencode. Se carga automáticamente en cada sesión
> desde la raíz del repositorio (`instructions: ["AGENTS.md"]` en `opencode.json`).
> Si algo de este documento difiere de la realidad del repositorio, manda la realidad
> y corrige este archivo (ver «Regla 1»).

---

## 1. ¿Qué es el proyecto? (resumen general)

**¡ADOPTA YA!** es una plataforma web + app Android para **conectar refugios y fundaciones
independientes de animales con adoptantes responsables**, enfocada en el seguimiento
post-adopción y la reducción de abandonos.

- **Contexto académico:** proyecto de la **CUN (Corporación Unificada Nacional)** —
  cliente objetivo: fundaciones/refugios independientes de mascotas.
- **Actores:** Administrador (refugio), Adoptante, Veterinario (diseño previsto).
- **Repositorio en la nube:** https://github.com/Diegojedap/adopta-ya (público, rama `master`).
- **Máquina actual:** Windows, carpeta de trabajo `C:\Users\diego_ojeda\Downloads\ADOPTA-YA 1.0`.
- **Idioma de trabajo:** español (documentación, commits y respuestas).

**Alcance REAL hoy:** es un **prototipo full-stack local**: web + API REST propia y base de
datos **MySQL local** (persistencia real de usuarios, mascotas, solicitudes, evidencias y
alertas; contrato PDF). **NO está desplegado en la nube** ni es un sistema productivo: sin
hosting, sin cuentas de producción y sin notificaciones reales por correo. El **login con
Google (#11)** está **funcionando en web a nivel local** (Google Identity Services + Web client
ID ya configurado; usuario creado en MySQL); en **APK** está **verificado hasta el paso de la
cuenta** (credencial Android `com.adoptaya.app` + SHA-1 confirmada por Google; el APK ya consume
la API tras corregir el *mixed content*) pero **no cierra en la red corporativa** porque el proxy
sirve un cert no confiable para `play.google.com` — ver `docs/05_LOGIN_GOOGLE.md` §9-§10.
El **Panel CEO (M-19)** está implementado (vista de control solo para el administrador).

## 2. Estructura del repositorio

```
ADOPTA-YA 1.0/                     ← raíz (proyecto aplanado, sin carpetas anidadas)
├── AGENTS.md                      ← este archivo (memoria automática de opencode)
├── PROGRESO.md                    ← bitácora viva de avance (se actualiza en cada paso)
├── opencode.json                  ← config de opencode (autoupdate, instructions, share off)
├── README.md                      ← documento principal del entregable
├── package.json                   ← deps: @capacitor/*, @capgo/capacitor-social-login, bcryptjs, google-auth-library, jsonwebtoken, mysql2; dev: jsdom@23.0.1
├── capacitor.config.json          ← appId com.adoptaya.app · webDir www · android.allowMixedContent · plugin SocialLogin (solo Google)
├── test_estatico_adopta_ya.js     ← suite de pruebas P-01…P-18 (única copia)
├── resultados_pruebas.json        ← resultados de la última ejecución de npm test
├── adopta-ya.code-workspace       ← espacio VS Code (conexión SQLTools MySQL local)
├── uat/
│   ├── medir_linea_base.js      ← calcula la línea base de tiempos de la UAT (npm run uat:medir)
│   └── ejecutar_uat.js          ← ejecuta y cronometra los 16 escenarios en el frontend real (jsdom + API)
├── docs/
│   ├── 01_INFORME_DE_AUDITORIA.md ← hallazgos F-01…F-08, severidad y estado
│   ├── 02_ARQUITECTURA.md         ← arquitectura actual vs. objetivo
│   ├── 03_MODULOS.md              ← módulos M-01…M-18, trazabilidad REQ, backlog
│   ├── 04_UAT.md                  ← plan de UAT con el refugio y línea base de tiempos
│   ├── 05_LOGIN_GOOGLE.md         ← login con Google (#11): guía de credenciales y diseño
│   ├── uat/                       ← guion, plantilla, actas, hojas por rol y checklist de sesión
│   └── entregas/                  ← PDFs de Entrega 1 y Entrega 2
├── sql/
│   ├── schema.sql                 ← esquema MySQL (usuarios, mascotas, solicitudes, evidencias)
│   ├── seed.sql                   ← datos de ejemplo (Max, Luna, Rocky)
│   ├── preparar_bd.js             ← aplica el esquema y siembra (npm run db:preparar / db:reset)
│   ├── servidor_mysql.js          ← arranca/detiene/consulta el MySQL portátil (npm run db:*)
│   └── adopta_ya.session.sql      ← evidencia de intención MySQL (SELECT de prueba)
├── server/
│   ├── index.js                   ← API REST + MySQL (GET /mascotas, POST /solicitudes…) y sirve www/
│   └── .env.example               ← config de la API (copiar a .env y completar en local; incluye GOOGLE_CLIENT_ID)
├── www/                           ← fuente web: index.html, css/, js/, img/
├── android/                       ← proyecto Capacitor/Android (incluye APK debug)
└── node_modules/                  ← no versionada
```

## 3. Estado verificado (14-15/10/2026)

- **Pruebas:** `npm test` → **PASA 18 / FALLA 0** de 18 (tras `npm run sync`).
  - P-05 (catálogo vía API) y P-07 (solicitud persistida vía API) pasan; la suite corre con
    la API en MySQL o en memoria.
  - **Persistencia real:** `npm run db:iniciar` + `npm run db:preparar` dejan MySQL 8.4.9
    (puerto 3307, `127.0.0.1`, BD `adoptaya`) con usuarios/mascotas/solicitudes/evidencias;
    `npm test` 18/18 y `npm run db:reset` + `node uat/ejecutar_uat.js` 16/16 verificados
    el 14/10/2026 contra MySQL.
  - P-09 ya pasa: auth con `bcryptjs` + `jsonwebtoken` en `dependencies` (M-09).
  - P-15/P-16 (REQ-03) cierran el módulo de seguimiento (evidencias + alertas 30/60/90).
  - P-17 (RNF-03) verifica el kit de UAT (plan, guion, plantilla y script de medición).
  - P-18 (REQ-01) verifica el CRUD de mascotas del refugio (M-10: panel + API + ficha clínica).
  - P-05 (catálogo vía API) y P-07 (solicitud persistida vía API) pasan.
  - **Nota:** el check P-11 del test fue corregido (allowlist de dependencias directas) para
    no contradecir a P-09. Ojo con el orden: si editas `www/`, ejecuta `npm run sync` antes
    de `npm test` o P-13 fallará por la copia Android desfasada (**la copia
    `android/.../assets/public/` está en `.gitignore`**, así que en un clon nuevo hay que
    correr `npm run sync` para que P-13 no se omita).
- **Módulos implementados:** M-01 portada · M-02 navegación (✅ barra con botones→modales,
  tema claro/oscuro y bilingüe ES/EN 13/10/2026) · M-03 catálogo (◐ con API) ·
  M-04 adopción (◐ crea solicitud «en_revision») · M-05 responsabilidad · M-06 responsivo
  (✅ rediseño teal + coral y tema claro/oscuro 13/10/2026) ·
  M-07 empaquetado Android (✅ APK regenerado 13/10/2026) · M-08 suite de pruebas ·
  M-09 auth/roles (◐ login/registro/JWT/cerrar sesión/**Google**; usuarios en MySQL) · 
  M-10 CRUD mascotas (✅ panel + API + ficha clínica, solo admin) · 
  M-11 formulario postulación (◐ datos + consentimiento Ley 1581) · 
  M-12 panel de evaluación (◐ aprobar/rechazar con historial) ·
  M-13 contrato PDF (◐ generado sin dependencias para aprobadas) ·
  M-14 seguimiento (◐ evidencias de adopción aprobada, dueño o admin) ·
  M-15 alertas (◐ hitos 30/60/90 calculados, sin scheduler/correo) ·
  M-16 API REST (◐ prototipo) · M-17 persistencia MySQL (✅ en uso: esquema + scripts `db:*` + API) ·
  M-19 Panel CEO (✅ dashboard admin: KPIs, distribuciones, flujo y base de datos; 14/10/2026).
- **UAT (kit):** `docs/04_UAT.md` + `docs/uat/` (16 escenarios UAT-01…UAT-16 y plantilla);
  línea base de tiempos reproducible con `npm run uat:medir`; **simulación EJECUTADA el
  13/10/2026** (en memoria, `docs/uat/resultados_simulacion_2026-10-13.csv`, acta
  `docs/uat/acta_uat_2026-10-13.md`) y **re-ejecutada el 14/10/2026 contra MySQL** (`npm run
  db:reset` + `node uat/ejecutar_uat.js` → `docs/uat/resultados_simulacion_2026-10-14.csv`,
  16/16 Aceptado). No sustituye la sesión con el refugio, aún pendiente.
- **Diseño (13/10/2026):** rediseño visual con paleta **teal (`#0f766e`) + coral (`#f97316`)** en
  variables CSS (`:root` de `www/css/style.css`); barra de navegación pegajosa, hero con
  degradado, tarjetas del catálogo con hover, formularios con foco e insignias recoloreadas.
  Se pidió que la web y el APK quedaran «más atractivos y profesionales». APK regenerado e
  instalado/probado en el emulador `adopta_ya`.
- **Tema y modales (13/10/2026):** botón `#btn-tema` que alterna **claro/oscuro** (sigue el
  sistema y recuerda con `localStorage.tema`; variables en `[data-theme="dark"]`, sin `@media`
  nuevos para no romper P-03). Los formularios (login, postulación, seguimiento, panel y
  gestión) se movieron a **modales** (`#modal-*`, con `abrirModal()`/`cerrarModal()`, fondo, ✕
  y Esc); `#sesion` vive en la barra de navegación. Se conservaron todos los IDs (incl.
  `#seguimiento`, `#gestion-mascotas`, `#lista-mascotas-admin`) y `ingresar()`/`registrarse()`.
- **Bilingüe ES/EN (13/10/2026):** botón `#btn-idioma` (`🌐 EN`/`🌐 ES`) que alterna español
  (por defecto) e inglés; recuerda la elección en `localStorage.idioma` y actualiza
  `document.documentElement.lang`. Textos estáticos con `data-i18n`/`data-i18n-ph`; diccionario
  `{es,en}` y `t(clave, ...args)` para los dinámicos; `aplicarIdioma()`/`alternarIdioma()`/
  `inicializarIdioma()`. **No se autodetecta el idioma del sistema** para no romper las pruebas
  ni la UAT (esperan español); los errores del servidor siguen en español. Verificado en el
  WebView del APK por CDP.
- **Cerrar sesión (13/10/2026):** botón `#btn-salir` (visible solo con sesión activa; `#btn-entrar`
  se oculta entonces) que ejecuta `cerrarSesion()` → borra `localStorage.token`, `mostrarSesion(null)`
  y cierra `#modal-login`. `mostrarSesion()` alterna la visibilidad de ambos botones.
- **Login con Google (14/10/2026, #11):** **funcionando en web** (E2E con una cuenta Google real:
  usuario creado en MySQL con `proveedor=google`). En **APK nativo** (14-15/10/2026) queda ◐
  **verificado hasta el paso de la cuenta**: la **credencial Android está confirmada** (log de GMS
  `GOOGLE_SIGN_IN_VERIFY_CALLER; successful=true` → paquete `com.adoptaya.app` + SHA-1 OK, sin
  `ApiException:10`), el plugin `SocialLogin.login` se ejecuta y el **TLS del emulador se resolvió**
  (se instaló la CA raíz de **Kaspersky** en `/system/etc/security/cacerts/` del emulador; ver
  `docs/05_LOGIN_GOOGLE.md` §9). **Falta iniciar sesión con una cuenta Google en el emulador**;
  sin cuentas el plugin devuelve `NoCredentialException: No credentials available`.
  **Bug corregido (15/10/2026):** el WebView del APK corre sobre `https://localhost`, así que los
  `fetch` a `http://10.0.2.2:3000` eran bloqueados por **Mixed Content** (el APK no podía consumir
  la API); se corrigió con `"android": { "allowMixedContent": true }` en `capacitor.config.json`
  (verificado por CDP: `fetch(API_BASE+'/health')` → `OK {"ok":true,"fuente":"mysql"}`). Además
  `ingresarConGoogleNativo()` ya no traga el error: muestra `google_sin_cuenta`/`google_error`
  (claves i18n ES/EN). **El nativo no puede cerrarse en la red corporativa:** el proxy sirve un
  cert **autofirmado `CN=*.google.com`** para `play.google.com` (no emitido por la CA de Kaspersky;
  instalar ese cert como CA del sistema **no ayudó**), y el asistente de Google falla con
  *"There was a problem connecting to play.google.com"*. Ruta: probar en una **red sin inspección
  TLS** (`docs/05_LOGIN_GOOGLE.md` §10). Web client ID
  configurado en `server/.env` y `www/js/script.js`. **Fix TLS duradero:** por la inspección
  corporativa, la verificación de
  certificados de `googleapis.com` fallaba (`self-signed certificate in certificate chain`); ahora
  `server/index.js` usa un `https.Agent` con `[...tls.rootCertificates, CAs extra]`, con las CAs
  extra en `certs/windows-ca-bundle.pem` (gitignored; override con `CA_BUNDLE_PATH` /
  `NODE_EXTRA_CA_CERTS`).
  Backend: `POST /auth/google` verifica el ID token con `google-auth-library@11.3.0`
  (audiencia = `GOOGLE_CLIENT_ID`), crea/vincula el usuario en MySQL y emite el JWT propio;
  el esquema `usuarios` ahora tiene `clave_hash NULL`, `proveedor` (`local`/`google`) y
  `google_sub` (migración idempotente en `sql/preparar_bd.js`). `.env` se carga con
  `process.loadEnvFile` (sin `dotenv`). Web: Google Identity Services (script dinámico, no
  `<script src>` para no romper P-01) con botón «Continuar con Google» en `#modal-login`
  (`inicializarGoogle`/`ingresarConGoogle`/`procesarCredencialGoogle`, i18n ES/EN). APK: plugin
  `@capgo/capacitor-social-login@8.5.17` (Credential Manager; `webClientId` = Web client ID;
  no requiere tocar `MainActivity`) y solo Google habilitado en `capacitor.config.json`.
  `API_BASE` ahora es `http://10.0.2.2:3000` en nativo (resto: `localhost`) y se añadió
  `android/app/src/main/res/xml/network_security_config.xml` (cleartext) referenciado en el
  manifest. Guía de credenciales en `docs/05_LOGIN_GOOGLE.md`. **P-11** amplió su allowlist con
  `google-auth-library` y `@capgo/capacitor-social-login`.
- **Panel CEO (14/10/2026, M-19):** vista de control **solo para el administrador** distinta de
  los paneles normales. Botón `#btn-ceo` («Panel CEO», gradiente teal→coral) que abre
  `#modal-ceo` con 7 pestañas (Resumen, Flujo, Mascotas, Solicitudes, Usuarios, Seguimiento,
  Base de datos). Backend: `GET /admin/resumen` (solo admin) → `resumenAdmin()` con KPIs,
  distribuciones (rol/proveedor/estado/especie), `flujo`, `actividad` y `tablas` (usuarios
  sanitizados, sin `clave_hash`). Frontend: `esAdmin()`, `abrirPanelCeo()`, `cargarResumenCeo()`,
  `mostrarPestanaCeo()`, `renderCeo()`, helpers (`kpiCeo`/`barrasCeo`/`tablaObjetosCeo`/`cajaFlujo`/
  `cajaBd`/`escaparCeo`) e i18n `ceo_*` ES/EN; `mostrarSesion()` muestra/oculta
  `#btn-panel`/`#btn-gestion`/`#btn-ceo` según rol. Estilos `.ceo-*` en `www/css/style.css`.
- **Módulos NO implementados (diseñados):** M-18 cloud (publicación web; el APK ya no).
- **Requisitos:** REQ-01 ✅ (CRUD mascotas) · REQ-04 ✅ (APK regenerado) ·
  REQ-05 ✅ (auth) · REQ-02 ◐ (con API) · REQ-03 ◐ (evidencias + alertas, sin notificación real) ·
  RNF-01 ◐ (prototipo) · RNF-02/RNF-03 ✅.
- **API local:** `npm start` levanta `server/index.js` en `http://localhost:3000` y sirve la
  web (`www/`) y la API REST juntas. Usa **MySQL** si está disponible (`GET /health` →
  `fuente: "mysql"`); si no, cae a un store en memoria con aviso. MySQL portátil en
  `C:\Users\diego_ojeda\mysql` (puerto 3307, `root` sin contraseña local); se administra con
  los scripts `db:*`.
  Rutas: `GET /health`, `GET /mascotas[:id]`, `POST/PUT/DELETE /mascotas` (escritura solo admin), `POST /solicitudes`,
  `GET /solicitudes` y `POST /solicitudes/:id/estado` (solo admin),
  `GET /solicitudes/:id/contrato` (aprobada, admin o dueño, devuelve PDF),
  `POST/GET /solicitudes/:id/evidencias` (aprobada, admin o dueño) y
  `GET /seguimiento/alertas` (solo admin) y `GET /admin/resumen` (solo admin),
  `POST /auth/registro`, `POST /auth/login`, `POST /auth/google`, `GET /auth/perfil` (JWT Bearer).
  Admin de demo: `admin@adoptaya.local` / `admin123` (cambiar en producción).
- **Hallazgos corregidos en la auditoría:** F-01 rutas case-sensitive unificadas a
  minúsculas (`css/`, `js/`) · F-02 credenciales MySQL vaciadas · F-03 `package.json`
  higienizado · F-04 pruebas ejecutables · F-05 workspace fuera de `www/` ·
  **F-08 APK regenerado** (13/10/2026) · **F-11 `local.properties` ya apunta al SDK local**.
  Ningún hallazgo de auditoría queda pendiente.
- **Entorno de build Android (reverificado 14/10/2026):** el SDK está en `C:\Android`
  (platform 36, build-tools 36.0.0, licencias aceptadas) y hay JDK 17 en
  `C:\Java\jdk-17.0.20.1+1`. Capacitor 8 exige **JDK 21** (compila con
  `sourceCompatibility 21`), por lo que se usa un **JDK 21 portátil** en
  `%TEMP%\opencode\jdk21\jdk-21.0.12.1+1`. Para regenerar: `npm run sync` y luego, en `android/`,
  `set JAVA_HOME=<JDK21>` + `gradlew.bat assembleDebug` (**~3m25s** con código y caché de
  Gradle 8.14.3; el APK quedó en 8.33 MB). Por la **inspección TLS corporativa** hay que
  **importar las CAs raíz de Windows al truststore del JDK 21** (`lib\security\cacerts`,
  `keytool -importcert`) antes de compilar, o el build falla con `SELF_SIGNED_CERT_IN_CHAIN`.
- **Backlog (Entrega 3):** ver `docs/03_MODULOS.md` §4. Hechos #1-5, #7, #8, #9 y #10 (esquema,
  API, consumir API, auth, formularios/evaluación, contrato PDF, seguimiento + alertas, kit de
  UAT, CRUD de mascotas). La **persistencia MySQL (M-17)** quedó implementada y en uso
  (scripts `db:*`, API con `mysql2`, web servida por la API). El **Panel CEO (M-19)** y el
  **login con Google en web (#11)** quedaron implementados.
  Siguiente: **cerrar el login nativo del APK (#11) en una red sin inspección TLS** —el mix content
  ya está corregido y el APK consume la API; la credencial Android ya está confirmada; falta el
  asistente de Google (bloqueado en la red corporativa por el MITM de `play.google.com`)— y hacer
  la **demo del Panel CEO (M-19) + CRUD** viendo cambiar la base de datos. Después: publicar la demo
  web (M-18) → ejecutar la UAT real con el refugio.

## 4. Comandos clave

```powershell
npm test           # suite P-01…P-18; actualiza resultados_pruebas.json (esperado 18/18)
npm start          # web + API en http://localhost:3000 (MySQL si responde; si no, memoria)
npm run db:iniciar # arranca MySQL portátil (127.0.0.1:3307); db:detener / db:estado
npm run db:preparar # aplica sql/schema.sql y siembra; db:reset reinicia (UAT/pruebas)
npm run uat:medir  # calcula la línea base de tiempos de la UAT → docs/uat/linea_base_tiempos.json
node uat/ejecutar_uat.js  # re-ejecuta y cronometra los 16 escenarios (frontend jsdom + API limpia) → CSV
npm run sync       # cap sync android (coopia www/ → android/.../assets/public/)
npm run open:android  # abrir proyecto en Android Studio (no disponible en esta máquina)
npx serve www      # servir el front-end localmente (alternativa sin la API)
```

Antes de correr la UAT contra MySQL: `npm run db:iniciar`, `npm run db:reset` y `npm start`,
luego `node uat/ejecutar_uat.js`.

Verificación rápida de integridad: comparar hashes de `www/index.html`,
`www/css/style.css`, `www/js/script.js` con su par en
`android/app/src/main/assets/public/` (deben coincidir).

## 5. Convenciones y advertencias (no romper)

1. **Rutas siempre en minúsculas** (`css/`, `js/`): Android y Linux son sensibles a
   mayúsculas; `CSS/` o `JS/` dejan la app sin estilos ni JS.
2. **Nunca versionar credenciales**: ni en `.vscode/settings.json`, ni workspace, ni
   `.env`. La contraseña de MySQL (puerto 3307, usuario root) se configura localmente.
3. **npm**: en la **máquina Windows original** el registro está detrás de **inspección TLS
   corporativa**: `npm install` (y `gradle`) fallan con `SELF_SIGNED_CERT_IN_CHAIN` salvo que
   se confíe en las CAs raíz de Windows. Para instalar, exportar las raíces de Windows a un
   `.pem` y ejecutar con `$env:NODE_EXTRA_CA_CERTS="<bundle>.pem"` (así se instalaron
   `google-auth-library` y `@capgo/capacitor-social-login`). `package.json` sigue fijando
   `psl@1.9.0`, `ws@8.20.1` y `tough-cookie@4.1.3` vía `overrides` (versiones en caché local)
   para no romper builds sin red. Los `overrides` no estorban con conexión.
   Dependencias directas actuales (`dependencies`): `@capacitor/{core,cli,android}`,
   `@capgo/capacitor-social-login`, `bcryptjs@2.4.3`, `google-auth-library@11.3.0`,
   `jsonwebtoken@9.0.3`, `mysql2@^3.23.1` (el allowlist de **P-11** debe listarlas todas).
4. **APK**: el único binario versionado es `android/app/build/outputs/apk/debug/app-debug.apk`
   (excepción deliberada en `.gitignore`, como evidencia). No borrar.
5. **Datos legales**: al capturar datos reales de adoptantes aplica la **Ley 1581 de 2012**
   (consentimiento expreso y minimización).
6. **Commits**: mensajes en español, descriptivos; nunca `git push --force`.

## 6. Documentación detallada (profundizar cuando haga falta)

| Tema | Archivo |
|---|---|
| Hallazgos de auditoría, severidad, evidencias | `docs/01_INFORME_DE_AUDITORIA.md` |
| Arquitectura actual vs. objetivo, cliente, alojamiento | `docs/02_ARQUITECTURA.md` |
| Módulos, trazabilidad de requisitos, backlog | `docs/03_MODULOS.md` |
| Plan de UAT, escenarios y línea base de tiempos | `docs/04_UAT.md`, `docs/uat/` |
| Login con Google (#11): credenciales y diseño | `docs/05_LOGIN_GOOGLE.md` |
| Entregas 1 y 2 (PDF oficiales) | `docs/entregas/` |
| Instrucciones de uso y estructura | `README.md` |

---

## Regla 1 — Verificación de memoria al iniciar sesión

Al **iniciar una sesión** en este proyecto, hacer antes de responder sobre el estado del proyecto:

1. `git fetch origin` → comparar `git status -sb` (local vs `origin/master`; si están
   desfasados, avisar y hacer pull/push según convenga).
2. `git log --oneline -5` y `git status` → confirmar si hay cambios sin commit.
3. Contrastar este AGENTS.md con la realidad: estructura de carpetas, contenido de
   `PROGRESO.md`, resultados en `resultados_pruebas.json`, `package.json`.
4. Si hay deriva (la memoria dice algo que ya no es cierto), **corregir AGENTS.md y/o
   PROGRESO.md en ese momento** y reflejarlo en el commit. Nunca dar por bueno un dato
   desactualizado sin avisar.
5. Si el usuario lo pide o hay duda de integridad, ejecutar `npm test` (18/18 esperado).

## Regla 2 — Actualización automática de progreso (anti-apagón)

El PC del usuario puede apagarse en cualquier momento. Por eso, **al terminar cada paso
o tarea significativa**:

1. Actualizar `PROGRESO.md`: fecha/hora, qué se terminó, qué quedó pendiente, resultados
   relevantes (p. ej. conteo de pruebas). Formato: entradas nuevas arriba, breves.
2. Hacer **commit inmediato** (`git add -A` + mensaje en español que resuma el paso) y
   **push a origin/master**. No dejar progreso solo en memoria de la sesión.
3. Si una tarea queda a medias por interrupción, dejarlo escrito en `PROGRESO.md`
   como «EN CURSO» con el detalle necesario para retomarla en una sesión nueva.
4. Opcional pero recomendado: mencionar al usuario que el avance ya quedó en GitHub.

La continuidad entre sesiones se garantiza con: **AGENTS.md** (contexto) +
**PROGRESO.md** (avance) + **`opencode --continue`** (historial local de la sesión).
