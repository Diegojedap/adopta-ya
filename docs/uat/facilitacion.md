# Guía del facilitador — UAT real con el refugio

Guía operativa para la **sesión presencial** de aceptación de ¡ADOPTA YA! 1.0 con personal
del refugio/fundación y adoptantes. Complementa el plan `docs/04_UAT.md` y el guion
`docs/uat/guion_escenarios.md` (16 escenarios UAT-01…UAT-16).

---

## 1. Antes de la sesión (preparación)

1. Coordinar con el refugio: fecha, hora, salón e **invitados** (mínimo 1 administrador y
   1 adoptante; ideal 2 y 2 para poder promediar tiempos).
2. Confirmar el **entorno** a usar: navegador sobre `www/` (recomendado para la demo) o el
   **APK** `android/app/build/outputs/apk/debug/app-debug.apk` en un equipo Android.
3. Verificar el **checklist del entorno** (`docs/uat/checklist_sesion.md`).
4. Imprimir o tener a la vista para cada participante:
   - `docs/uat/hoja_participante_adoptante.md` (UAT-01…05, 09, 11, 16).
   - `docs/uat/hoja_participante_admin.md` (UAT-06…10, 12…16).
5. Preparar `docs/uat/plantilla_registro.csv` limpio (quitar las filas de ejemplo) y la
   plantilla de acta `docs/uat/acta_uat_plantilla.md`.
6. Avisar a los participantes: la sesión se **cronometra** y se **graba** (fotos/video) como
   evidencia.

## 2. Durante la sesión

### Cronometraje
- **Inicio (start):** la primera acción del participante sobre el escenario (clic, tecleo).
- **Fin (stop):** se alcanza el resultado esperado, o el participante abandona.
- Se registra en `tiempo_seg` (segundos). Sin tiempos negativos: si es imposible medir,
  dejar en blanco.
- Uso: 1 cronómetro por escenario o cronometrar en bloque y anotar.

### Orden sugerido de la sesión
1. Bienvenida (5 min): qué es el prototipo, qué se va a probar, y cuáles son los límites
   (datos en memoria, sin notificaciones reales).
2. Bloque **Adoptante** (UAT-01…05) con el/los participante(s) rol adoptante.
3. Bloque **Admin** (UAT-06…10) con el/los participante(s) rol refugio.
4. UAT-11 (responsive) — cualquiera, sobre la ventana estrechada a < 700 px.
5. UAT-12 (rechazo con nota) y bloque **Admin/M-10** (UAT-13…16).
6. Cierre: lectura de resultados, decisión de aceptación y firma del acta.

### Registro (plantilla CSV)
- Una **columna `sesion` por participante**, con formato `REFUGIO-<ROL>-<N>`
  (ej. `REFUGIO-ADMIN-1`, `REFUGIO-ADOPT-2`). Así `nod uat/medir_linea_base.js` agrupa por
  escenario y saca min/prom/max con varias personas.
- `resultado`: `Aceptado` | `Condicional` | `Rechazado`.
- Si hay defecto: llenar `defecto` (ID, ej. `D-004`), `severidad` (tabla abajo) y
  `observacion` con la evidencia del fallo.
- Un escenario **repetido tras corregir** se anota como otra fila (mismo `sesion` y
  escenario) con su propio tiempo.

### Clasificación de defectos (igual que `docs/04_UAT.md` §7)
| Severidad | Criterio | Efecto en la aceptación |
|---|---|---|
| **Bloqueante** | Impide completar un escenario de requisito Alta | Se **rechaza** la entrega hasta corregir |
| **Alto** | Escenario se completa con mucha dificultad o error visible | Aceptación **condicional** con plan |
| **Medio** | Fricción o inconsistencia menor | Aceptación **condicional** |
| **Bajo** | Detalle cosmético o de redacción | No bloquea; se registra |

**Decisión global:** la UAT se considera **Aceptada** si ningún escenario de requisito Alta
(REQ-01/02/03/04/05) produce defecto Bloqueante; de lo contrario se corrige y se repite el
escenario afectado.

## 3. Después de la sesión

1. Consolidar el CSV final en `docs/uat/resultados_uat_<fecha>.csv` (una fila por escenario
   y participante).
2. Regenerar la línea base con los datos humanos reales:

   ```powershell
   npm run uat:medir docs/uat/resultados_uat_<fecha>.csv
   ```

3. Llenar y firmar `docs/uat/acta_uat_<fecha>.md` (participantes reales, resultados,
   defectos y decisiones).
4. Actualizar `PROGRESO.md`, `docs/04_UAT.md` (§10) y commit+push en español.
5. Dejar el kit guardado; el refugio se lleva una copia de las hojas de participante y el
   acta.

> Nota: la **simulación** del 13/10/2026 (`docs/uat/resultados_simulacion_2026-10-13.csv` +
> `docs/uat/acta_uat_2026-10-13.md`) sirvió de ensayo y referencia de tiempos automáticos;
> **no sustituye** esta sesión presencial.