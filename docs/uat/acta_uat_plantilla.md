# Acta de sesión UAT (REAL con el refugio) — ¡ADOPTA YA! 1.0

> Plantilla para la **sesión presencial** con el refugio. Llenar antes de firmar. Esta acta
> **sustituye** a la simulación de opencode del 13/10/2026 (que fue solo ensayo). Criterios de
> salida: `docs/04_UAT.md` §8.

## 1. Datos de la sesión

- **Fecha:** __________________  ·  **Hora inicio:** __________  ·  **Hora fin:** __________
- **Lugar:** __________________ (refugio/fundación: ____________________)
- **Entorno usado:** ☐ Navegador sobre `www/` (`npx serve www`)  ☐ APK Android
  (`android/app/build/outputs/apk/debug/app-debug.apk`)
- **API:** ☐ local (`npm start`, store en memoria)  ·  Estado inicial: ☐ limpio (reiniciada)

## 2. Participantes

| Nombre | Rol en la sesión | Rol en el refugio | Sesión (columna CSV) | Firma |
|---|---|---|---|---|
| | Admin / Adoptante / Facilitador | | REFUGIO-… | |
| | | | | |
| | | | | |

## 3. Resultados por escenario

| Escenario | Requisito | Rol | Resultado | Tiempo (s) | Defecto / Observación |
|---|---|---|---|---|---|
| UAT-01 | REQ-04 | Adoptante | | | |
| UAT-02 | REQ-01 | Adoptante | | | |
| UAT-03 | REQ-02 | Adoptante | | | |
| UAT-04 | REQ-02 | Adoptante | | | |
| UAT-05 | REQ-05 | Adoptante | | | |
| UAT-06 | REQ-05 | Admin | | | |
| UAT-07 | REQ-02 | Admin | | | |
| UAT-08 | M-13 | Admin | | | |
| UAT-09 | REQ-03 | Adoptante/Admin | | | |
| UAT-10 | REQ-03 | Admin | | | |
| UAT-11 | REQ-04 | Cualquiera | | | |
| UAT-12 | RNF-01 | Admin | | | |
| UAT-13 | REQ-01 | Admin | | | |
| UAT-14 | REQ-01 | Admin | | | |
| UAT-15 | REQ-01 | Admin | | | |
| UAT-16 | REQ-05/RNF-01 | Adoptante/Admin | | | |

- CSV definitivo: `docs/uat/resultados_uat_<fecha>.csv` (una fila por escenario y participante).
- Línea base: `npm run uat:medir docs/uat/resultados_uat_<fecha>.csv` → `linea_base_tiempos.json`.

## 4. Defectos detectados

| ID | Escenario | Severidad | Descripción | Decisión (corregir/aceptar/diferir) |
|---|---|---|---|---|
| | | | | |
| | | | | |

## 5. Decisión de aceptación

☐ **Aceptada** (sin defectos Bloqueantes en requisitos Alta) — ver `docs/04_UAT.md` §7.
☐ **Condicional** (defectos Alto/Medio con plan de corrección).
☐ **Rechazada** (defecto Bloqueante): replanificar la sesión.

**Plan de corrección (si aplica):** ______________________________________________

## 6. Evidencias adjuntas

- ☐ Fotos / capturas de pantalla (ruta: ______________________)
- ☐ Video de la sesión (ruta: ______________________)
- ☐ CSV de resultados (`resultados_uat_<fecha>.csv`)
- ☐ Línea base regenerada (`linea_base_tiempos.json`)

## 7. Firmas

Facilitador: ______________________  ·  Responsable del refugio: ______________________

Fecha de firma: ______________________

---

*Almacenar en `docs/uat/` y referenciar en `docs/04_UAT.md` §10 y en `PROGRESO.md`.*