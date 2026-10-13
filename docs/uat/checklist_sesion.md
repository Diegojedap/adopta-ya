# Checklist del entorno — sesión UAT presencial

Ejecutar el día de la sesión y marcar cada punto. Si algo falla aquí, **no empezar** hasta
resolverlo.

## Previo (facilitador, 20 min antes)

- [ ] La **API está corriendo** con store en memoria limpio (reiniciar antes de cada bloque
      que requiera estado inicial):

  ```powershell
  npm start
  ```

- [ ] `GET http://localhost:3000/health` responde `{ "ok": true }`.
- [ ] `GET http://localhost:3000/mascotas` devuelve las mascotas del refugio (p. ej.
      Max, Luna, Rocky).
- [ ] El **frontend está servido** y accesible:

  ```powershell
  npx serve www
  ```

- [ ] Se abrió `http://localhost:3000`/puerto de serve y el catálogo se ve con datos
      (no solo reserva).
- [ ] **Credenciales de demo** a mano: `admin@adoptaya.local` / `admin123`.
- [ ] `docs/uat/plantilla_registro.csv` **limpio** (sin las filas de ejemplo SIM-01/SIM-02).
- [ ] Planteadas las **columnas de sesión por participante**: `REFUGIO-ADMIN-1`,
      `REFUGIO-ADOPT-1`, etc.
- [ ] Impresas/visibles: `hoja_participante_adoptante.md`, `hoja_participante_admin.md`,
      `guion_escenarios.md` (para el facilitador).
- [ ] Cronómetro disponible (reloj, móvil o software del facilitador).
- [ ] Evidencia lista: capturas de pantalla / cámara-video, carpeta
      `docs/uat/evidencias_<fecha>/` para guardarlas.
- [ ] Si se usa APK: dispositivo Android con la app instalada y la API alcanzable
      (mismo Wi-Fi + IP local, o demo publicada).

## Durante la sesión

- [ ] Bienvenida: presentar el prototipo y **sus límites** (datos en memoria, sin
      notificaciones reales, sin despliegue cloud).
- [ ] Consentimiento de los participantes para capturar evidencias.
- [ ] Un escenario a la vez; el facilitador anota hora de comienzo/fin.
- [ ] Cada hallazgo raro se dice en voz alta y se anota (aunque siga avanzando).

## Posterior (para cerrar la UAT)

- [ ] CSV consolidado en `docs/uat/resultados_uat_<fecha>.csv`.
- [ ] Línea base regenerada:

  ```powershell
  npm run uat:medir docs/uat/resultados_uat_<fecha>.csv
  ```

- [ ] Acta `docs/uat/acta_uat_<fecha>.md` llenada y firmada.
- [ ] Evidencias copiadas en `docs/uat/evidencias_<fecha>/`.
- [ ] Actualizados `PROGRESO.md`, `docs/04_UAT.md` (§10) y AGENTS si aplica.
- [ ] `npm test` → 18/18 (verificación final).

---

**Referencias:** plan `docs/04_UAT.md` · guion `docs/uat/guion_escenarios.md` ·
facilitación `docs/uat/facilitacion.md` · plantilla de acta `docs/uat/acta_uat_plantilla.md`.