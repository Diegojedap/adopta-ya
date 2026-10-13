# PROGRESO — Bitácora viva de ¡ADOPTA YA!

> Se actualiza automáticamente en **cada paso completado** (Regla 2 de `AGENTS.md`) y se
> hace commit+push de inmediato: si la PC se apaga, el avance ya está en GitHub.
> Entradas más recientes arriba.

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
