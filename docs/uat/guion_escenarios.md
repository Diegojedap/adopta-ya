# Guion de escenarios UAT — ¡ADOPTA YA! 1.0

Guion operativo para la(s) sesión(es) de aceptación. Cada escenario se ejecuta, se
cronometra y se registra en `docs/uat/plantilla_registro.csv`.

**Entorno previo:** `npm start` (API en `http://localhost:3000`) y abrir `www/index.html`
(o `npx serve www`). Admin de demo: `admin@adoptaya.local` / `admin123`.
**Convención de tiempo:** segundos desde la primera acción hasta alcanzar el resultado.

---

## UAT-01 · Portada y navegación al catálogo
- **Requisito:** REQ-04 · **Rol:** Adoptante
- **Pasos:** 1) Abrir la aplicación. 2) Observar el encabezado y la propuesta. 3) Pulsar «Ver mascotas».
- **Resultado esperado:** la vista se desplaza suavemente hasta «Mascotas en adopción».
- **Defecto si:** no hay desplazamiento o la sección no es alcanzable.

## UAT-02 · Catálogo cargado desde la API
- **Requisito:** REQ-01 · **Rol:** Adoptante
- **Pasos:** 1) Con la API encendida, abrir la aplicación. 2) Revisar las tarjetas del catálogo. 3) (Facilitador) confirmar en la consola del navegador la petición a `GET /mascotas`.
- **Resultado esperado:** se listan Max, Luna y Rocky con nombre, edad, descripción y botón. Sin API, se conservan las 3 tarjetas de reserva.
- **Defecto si:** el catálogo aparece vacío o sin datos.

## UAT-03 · Iniciar adopción desde el catálogo
- **Requisito:** REQ-02 · **Rol:** Adoptante
- **Pasos:** 1) Pulsar «Quiero adoptarlo» en una mascota. 2) Leer el mensaje de confirmación.
- **Resultado esperado:** mensaje con el nombre de la mascota y la solicitud queda «en revisión» (verificable luego en el panel).
- **Defecto si:** no aparece confirmación o no se registra la solicitud.

## UAT-04 · Postulación con consentimiento (Ley 1581)
- **Requisito:** REQ-02 · **Rol:** Adoptante
- **Pasos:** 1) Ir a «Formulario de postulación». 2) Intentar enviar sin marcar el consentimiento. 3) Completar nombre, correo, teléfono, mascota y motivación. 4) Marcar la autorización de datos y enviar.
- **Resultado esperado:** sin consentimiento muestra aviso; con consentimiento confirma «Postulación enviada. Estado: en_revision».
- **Defecto si:** envía sin consentimiento o falla el envío válido.

## UAT-05 · Registro de adoptante
- **Requisito:** REQ-05 · **Rol:** Adoptante
- **Pasos:** 1) En «Acceso a tu cuenta», escribir nombre, un correo nuevo y una contraseña. 2) Pulsar «Registrarse».
- **Resultado esperado:** crea el usuario y muestra «Sesión iniciada: … (adoptante)».
- **Defecto si:** no crea la cuenta o no inicia sesión.

## UAT-06 · Ingreso como administrador
- **Requisito:** REQ-05 · **Rol:** Admin
- **Pasos:** 1) Escribir `admin@adoptaya.local`. 2) Contraseña `admin123`. 3) Pulsar «Ingresar».
- **Resultado esperado:** «Sesión iniciada: Administrador (administrador)».
- **Defecto si:** credenciales de demo fallan.

## UAT-07 · Evaluación de solicitudes (panel)
- **Requisito:** REQ-02 · **Rol:** Admin
- **Pasos:** 1) Autenticado como admin, pulsar «Cargar solicitudes». 2) Identificar una solicitud «en_revision». 3) Aprobar una y rechazar otra.
- **Resultado esperado:** la lista muestra las solicitudes; al aprobar pasa a «aprobada» (aparece «Descargar contrato») y al rechazar a «rechazada».
- **Defecto si:** no lista, no cambia de estado o lo hace sin sesión.

## UAT-08 · Descarga del contrato PDF
- **Requisito:** M-13 (formalización) · **Rol:** Admin
- **Pasos:** 1) En una solicitud aprobada, pulsar «Descargar contrato». 2) Abrir el archivo descargado.
- **Resultado esperado:** descarga `contrato-adopta-ya-<id>.pdf` con datos del adoptante y cláusulas (Ley 1581).
- **Defecto si:** no descarga, descarga vacío o permite descargarlo sin estar aprobada.

## UAT-09 · Registrar evidencia post-adopción
- **Requisito:** REQ-03 · **Rol:** Adoptante dueño / Admin
- **Pasos:** 1) Autenticado, ir a «Mi seguimiento post-adopción». 2) Escribir el n.º de una solicitud **aprobada**, una nota y (opcional) una foto ≤ 300 KB. 3) Registrar. 4) Intentar con una solicitud no aprobada.
- **Resultado esperado:** en la aprobada la evidencia se registra («día 0») y aparece en el timeline; en la no aprobada muestra error.
- **Defecto si:** permite evidencias en adopciones no aprobadas o pierde el registro.

## UAT-10 · Alertas de seguimiento 30/60/90
- **Requisito:** REQ-03 · **Rol:** Admin
- **Pasos:** 1) Autenticado como admin, pulsar «Cargar alertas de seguimiento».
- **Resultado esperado:** tarjetas con mascota, adoptante, día acumulado, número de evidencias, próximo hito e insignia (Al día/Vencida/Completada).
- **Defecto si:** no carga o no muestra el hito.

## UAT-11 · Diseño responsive
- **Requisito:** REQ-04 · **Rol:** Cualquiera
- **Pasos:** 1) Abrir en un móvil o reducir la ventana a menos de 700 px. 2) Recorrer catálogo, formularios y panel.
- **Resultado esperado:** el contenido se apila en una columna, sin scroll horizontal; botones y textos legibles.
- **Defecto si:** hay desbordamiento horizontal o elementos inaccesibles.

## UAT-12 · Rechazo con nota e historial
- **Requisito:** RNF-01 · **Rol:** Admin
- **Pasos:** 1) En el panel, rechazar una solicitud «en_revision».
- **Resultado esperado:** el estado «rechazada» queda visible y el cambio se registra en el historial de estados.
- **Defecto si:** el cambio no persiste en la sesión.

## UAT-13 · Registrar mascota con ficha clínica
- **Requisito:** REQ-01 · **Rol:** Admin
- **Pasos:** 1) Autenticado como administrador, ir a «Gestión de mascotas (refugio)». 2) Completar nombre, especie, edad, emoji, estado, salud, vacunas, esterilizado y descripción. 3) Pulsar «Guardar mascota». 4) Casos límite: intentar guardar sin nombre/edad y con una especie no permitida.
- **Resultado esperado:** la mascota se crea (mensaje «Mascota registrada (N.º X)») y aparece en la lista y en el catálogo; sin nombre/edad avisa «Completa nombre y edad.», y una especie/estado inválido responde 400.
- **Defecto si:** no guarda, no valida los obligatorios o acepta especies/estados fuera del catálogo.

## UAT-14 · Editar una mascota existente
- **Requisito:** REQ-01 · **Rol:** Admin
- **Pasos:** 1) En la lista, pulsar «Editar» en una mascota. 2) Verificar que el formulario se carga con sus datos (incluida la ficha clínica). 3) Cambiar el estado (p. ej. a «adoptado») y la descripción. 4) Pulsar «Guardar mascota».
- **Resultado esperado:** mensaje «Mascota N.º X actualizada.» y el cambio se refleja en la lista y en el catálogo.
- **Defecto si:** no precarga los datos o no persiste el cambio.

## UAT-15 · Retirar (eliminar) una mascota
- **Requisito:** REQ-01 · **Rol:** Admin
- **Pasos:** 1) En la lista, pulsar «Eliminar» en una mascota. 2) Confirmar el aviso «¿Eliminar la mascota N.º X?».
- **Resultado esperado:** mensaje «Mascota eliminada.»; desaparece de la lista y del catálogo (al consultarla responde 404).
- **Defecto si:** elimina sin confirmar, no elimina o deja la mascota visible en el catálogo.

## UAT-16 · Control de acceso a la gestión de mascotas
- **Requisito:** REQ-05 / RNF-01 · **Rol:** Adoptante / Admin
- **Pasos:** 1) Sin sesión, intentar «Guardar mascota» o «Eliminar». 2) Con sesión de **adoptante**, intentar guardar, editar y eliminar. 3) Con sesión de **administrador**, repetir la operación.
- **Resultado esperado:** sin sesión avisa «Inicia sesión como administrador.» (la API responde 401); con adoptante la API responde 403 «Solo administradores»; con administrador la operación procede.
- **Defecto si:** permite escrituras sin rol administrador.

---

## Registro

Usar `docs/uat/plantilla_registro.csv` (una fila por escenario y participante). Al terminar:

```powershell
npm run uat:medir   # genera docs/uat/linea_base_tiempos.json
```
