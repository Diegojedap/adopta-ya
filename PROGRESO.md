# PROGRESO — Bitácora viva de ¡ADOPTA YA!

> Se actualiza automáticamente en **cada paso completado** (Regla 2 de `AGENTS.md`) y se
> hace commit+push de inmediato: si la PC se apaga, el avance ya está en GitHub.
> Entradas más recientes arriba.

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
