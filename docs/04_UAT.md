# Plan de pruebas de aceptación de usuario (UAT) — ¡ADOPTA YA! 1.0

**Documento:** plan de UAT con el cliente (refugio/fundación) y **línea base de tiempos**.
**Fecha de creación:** 12 de octubre de 2026.
**Estado:** kit listo para ejecutar; sesión con el refugio **pendiente** (paso humano).
**Trazabilidad:** backlog Entrega 3, tarea #9 (`docs/03_MODULOS.md` §4); conclusión de la
auditoría (`docs/01_INFORME_DE_AUDITORIA.md` §6).

---

## 1. Objetivo

Validar con usuarios del contexto real (personal del refugio y adoptantes) que el
**prototipo** de ¡ADOPTA YA! permite completar los flujos principales del proceso de
adopción y, al mismo tiempo, **establecer una línea base de tiempos** por tarea
(tiempo mínimo, promedio y máximo) y una tasa de éxito, como indicador medible de la
Entrega 2. Se documentan defectos y decisiones de aceptación.

## 2. Alcance

**Se prueba:** la capa de presentación (`www/`) y la API de prototipo (`server/index.js`)
en ejecución local: catálogo desde la API, postulación con consentimiento, registro/login
con roles, panel de evaluación, contrato PDF, gestión de mascotas (CRUD + ficha clínica) y
seguimiento con evidencias y alertas.

**NO se prueba / límites declarados (para no dar falsas expectativas al refugio):**

- No hay persistencia real: usuarios y solicitudes viven en **memoria** (se pierden al
  reiniciar la API) salvo MySQL local configurado.
- No existen **notificaciones reales** (correo/push): las alertas 30/60/90 solo se calculan.
- El **APK** fue regenerado el 13/10/2026 sobre la fuente corregida (F-08 resuelto); la UAT
  puede ejecutarse sobre `www/` o sobre el APK ya actualizado.
- El **CRUD de mascotas con ficha clínica ya está implementado** (M-10 ✅, 12/10/2026) y
  **se cubre** en esta UAT con los escenarios **UAT-13…UAT-16**; queda fuera el **despliegue
  cloud** (M-18, no implementado).

## 3. Participantes y roles

| Rol | Descripción | Escenarios |
|---|---|---|
| **Facilitador** | Prepara el entorno, cronometra y llena el registro | todos |
| **Admin del refugio** | Personal de la fundación que aprueba/rechaza, gestiona mascotas y hace seguimiento | UAT-06…UAT-10, UAT-12…UAT-16 |
| **Adoptante** | Persona que explora el catálogo y postula | UAT-01…UAT-05, UAT-09, UAT-11, UAT-16 |

> Mínimo recomendado: **2 participantes por rol**. Con eso se pueden promediar tiempos.

## 4. Entorno de ejecución

```powershell
npm start          # API en http://localhost:3000 (store en memoria)
npx serve www      # o abrir www/index.html directamente
```

- Admin de demo: `admin@adoptaya.local` / `admin123` (cambiar en producción).
- Antes de cada sesión, reiniciar la API para partir de un estado limpio (store en memoria).
- Registrar la evidencia: capturas de pantalla o video de la sesión, más el CSV de
  resultados (plantilla `docs/uat/plantilla_registro.csv`).

## 5. Escenarios de aceptación

Guion detallado en `docs/uat/guion_escenarios.md`. Resumen:

| ID | Escenario | Requisito | Rol | Criterio de aceptación (resumen) |
|---|---|---|---|---|
| UAT-01 | Portada y navegación al catálogo | REQ-04 | Adoptante | El botón «Ver mascotas» desplaza a la sección del catálogo |
| UAT-02 | Catálogo cargado desde la API | REQ-01 | Adoptante | Se listan las mascotas con nombre, edad y botón |
| UAT-03 | Iniciar adopción desde el catálogo | REQ-02 | Adoptante | Se confirma y queda una solicitud «en revisión» |
| UAT-04 | Postulación con consentimiento Ley 1581 | REQ-02 | Adoptante | Exige consentimiento y crea la solicitud |
| UAT-05 | Registro de adoptante | REQ-05 | Adoptante | Crea el usuario e inicia sesión |
| UAT-06 | Ingreso como administrador | REQ-05 | Admin | Muestra «Sesión iniciada: … (administrador)» |
| UAT-07 | Evaluación de solicitudes | REQ-02 | Admin | Lista y cambia el estado a aprobada/rechazada |
| UAT-08 | Descarga del contrato PDF | M-13 | Admin | Descarga un PDF de una solicitud aprobada |
| UAT-09 | Evidencia post-adopción | REQ-03 | Adoptante/Admin | Registra nota/foto en una adopción aprobada |
| UAT-10 | Alertas de seguimiento 30/60/90 | REQ-03 | Admin | Muestra día acumulado, próximo hito e insignia |
| UAT-11 | Diseño responsive | REQ-04 | Cualquiera | En pantalla ≤700 px se adapta sin scroll horizontal |
| UAT-12 | Rechazo con nota e historial | RNF-01 | Admin | El estado y el historial quedan registrados |
| UAT-13 | Registrar mascota con ficha clínica | REQ-01 | Admin | Crea la mascota y valida nombre/edad y especie/estado |
| UAT-14 | Editar una mascota existente | REQ-01 | Admin | Precarga la ficha y persiste el cambio de estado/datos |
| UAT-15 | Retirar (eliminar) una mascota | REQ-01 | Admin | Confirma y la elimina de la lista y del catálogo |
| UAT-16 | Control de acceso a la gestión de mascotas | REQ-05/RNF-01 | Adoptante/Admin | Escritura solo con rol administrador (401 sin sesión, 403 adoptante) |

## 6. Línea base de tiempos (procedimiento)

1. El facilitador **cronometra** cada escenario desde la primera acción hasta alcanzar el
   objetivo (o abandonar). Se registra en segundos (`tiempo_seg`).
2. Cada fila del registro incluye: fecha, sesión, escenario, requisito, rol, resultado
   (`Aceptado` / `Condicional` / `Rechazado`), defecto, severidad, tiempo y observación.
3. Con varias sesiones, se calculan por tarea: **mínimo, promedio y máximo** de tiempo y
   **% de éxito** = (Aceptado + Condicional) / total.
4. El cálculo es reproducible con `npm run uat:medir`, que lee el CSV y genera
   `docs/uat/linea_base_tiempos.json`.

**Indicador de salida:** línea base registrada para los 16 escenarios y **≥ 90 % de éxito**
en escenarios de requisito Alta (REQ-01/02/03/04/05).

## 7. Clasificación de defectos y decisión de aceptación

| Severidad | Criterio | Efecto en la aceptación |
|---|---|---|
| **Bloqueante** | Impide completar un escenario de requisito Alta | Se **rechaza** la entrega hasta corregir |
| **Alto** | El escenario se completa con mucha dificultad o error visible | Aceptación **condicional** con plan |
| **Medio** | Fricción o inconsistencia menor | Aceptación **condicional** |
| **Bajo** | Detalle cosmético o de redacción | No bloquea; se registra |

**Decisión global:** la UAT se considera **Aceptada** si ningún escenario de requisito Alta
produce defecto Bloqueante; de lo contrario, se corrige y se repite el escenario afectado.

## 8. Criterios de salida (exit criteria)

- Los 16 escenarios ejecutados y registrados en el CSV.
- `docs/uat/linea_base_tiempos.json` generado con `npm run uat:medir`.
- Defectos clasificados con decisión (corregir / aceptar / diferir a backlog).
- Acta de sesión con fecha, participantes y evidencias adjuntas.

## 9. Cronograma sugerido

| Semana | Actividad |
|---|---|
| S1 | Preparar entorno y kit (este documento); reclutar 2+2 participantes |
| S2 | Ejecutar la sesión con el refugio; llenar el CSV y capturar evidencias |
| S3 | Analizar resultados, calcular la línea base y emitir el acta de aceptación |

## 10. Trazabilidad con el estado del proyecto

- La **sesión simulada** (`docs/uat/resultados_simulacion_2026-10-13.csv`, marcada como
  simulación de opencode) valida el flujo y el pipeline de medición; **no sustituye** la
  prueba con usuarios reales.
- La existencia de los artefactos UAT se verifica con la prueba **P-17** de la suite
  (`test_estatico_adopta_ya.js`).
- De la simulación de 12/10/2026 se levantaron dos defectos que **ya fueron corregidos** en
  el prototipo (12/10/2026): **D-001** (mostrar el n.º de solicitud creado tras postular) y
  **D-002** (mostrar la nota de rechazo en la tarjeta del panel, con captura del motivo al
  rechazar).
- El **13/10/2026** se amplió el kit con los escenarios **UAT-13…UAT-16** para cubrir el
  **CRUD de mascotas con ficha clínica (M-10)**; se validaron de punta a punta contra la API
  local (201 al crear, 200 al editar, 200 al eliminar, 404 posterior, 400 de validación, 401
  sin sesión y 403 con rol adoptante) y la línea base se regeneró con los 16 escenarios.
- El **13/10/2026** la simulación pasó de tableau manual a **ejecución real del frontend**
  con `node uat/ejecutar_uat.js` (jsdom + fetch enrutado a la API local): los **16 escenarios
  se ejecutan de verdad y cronometrados**, reescribiendo
  `docs/uat/resultados_simulacion_2026-10-13.csv` (16/16 «Aceptado»). El script es
  reproducible y verifica también los códigos HTTP (201/200/404/400/401/403). La **sesión con
  el refugio sigue siendo el paso humano pendiente** (`docs/uat/acta_uat_2026-10-13.md` es el
  acta de la simulación, no del refugio).
- Durante esa simulación se detectó y corrigió un **defecto menor** en `www/js/script.js`:
  la evidencia del **día 0** se mostraba como «?» (por `dia || "?"` con 0 como falsy); con
  `dia ?? "?"` se muestra «Día 0». El APK se regeneró sobre la fuente corregida.
