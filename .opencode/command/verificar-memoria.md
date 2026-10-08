---
description: Verifica que la memoria (AGENTS.md/PROGRESO.md) coincida con el estado real del repositorio, las pruebas y el remoto, y propone correcciones.
agent: build
---

Verifica la memoria del proyecto de ¡ADOPTA YA! contra la realidad. Ejecuta en orden y reporta cada punto:

1. **Git local vs remoto:** `git fetch origin`, luego `git status -sb` y `git log --oneline -5`. Indica si local y `origin/master` están sincronizados y si hay cambios sin commit. Si están desfasados, sincroniza (pull/push sin force).
2. **Estructura real:** confirma que existan `AGENTS.md`, `PROGRESO.md`, `opencode.json`, `docs/01-03`, `docs/entregas/` (2 PDFs), `sql/adopta_ya.session.sql`, `www/` (index.html, css/, js/), `test_estatico_adopta_ya.js` y el APK en `android/app/build/outputs/apk/debug/`.
3. **Pruebas:** ejecuta `npm test`. Esperado actual: 11 PASA / 3 FALLA (P-05, P-07, P-09). Si el conteo cambió, repórtalo como cambio de estado.
4. **Integridad de rutas:** compara hashes de `www/index.html`, `www/css/style.css`, `www/js/script.js` contra `android/app/src/main/assets/public/` (deben coincidir).
5. **Sin credenciales:** busca `"password": "..."` con contenido no vacío en json/xml/js/workspace (excluyendo node_modules, .git y build). Debe dar cero.
6. **Deriva de memoria:** compara lo dicho en `AGENTS.md` (secciones 1-3) y `PROGRESO.md` con lo observado en los pasos 1-5. Lista cada discrepancia.

Cierra con: (a) resumen VERIFICACIÓN OK o lista de deriva, (b) si hay deriva, aplica las correcciones a `AGENTS.md`/`PROGRESO.md`, haz commit con mensaje en español y push, y (c) si no la hay, solo avísalo (sin commit).
