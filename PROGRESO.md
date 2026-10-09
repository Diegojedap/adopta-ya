# PROGRESO — Bitácora viva de ¡ADOPTA YA!

> Se actualiza automáticamente en **cada paso completado** (Regla 2 de `AGENTS.md`) y se
> hace commit+push de inmediato: si la PC se apaga, el avance ya está en GitHub.
> Entradas más recientes arriba.

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
