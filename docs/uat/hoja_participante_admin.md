# Hoja del participante — Admin del refugio

Sesión de aceptación (UAT) de **¡ADOPTA YA! 1.0** · Tu rol: **administrador del refugio**.
Realiza los pasos en orden. El facilitador te cronometra y anota los resultados; **no tienes
que hacerlo tú**. Si algo no se ve, no funciona o se ve raro, dilo en voz alta y el
facilitador lo registra. No hay respuestas incorrectas.

**Entorno:** navegador sobre `www/` (o APK). Credenciales de prueba del refugio:
`admin@adoptaya.local` / `admin123`.

---

## UAT-06 · Ingreso como administrador
1. En **«Acceso a tu cuenta»**, escribe `admin@adoptaya.local`.
2. Escribe la contraseña `admin123`.
3. Pulsa **«Ingresar»**.
- **Resultado esperado:** aparece «Sesión iniciada: Administrador (administrador)».

## UAT-07 · Evaluación de solicitudes (panel)
1. Pulsa **«Cargar solicitudes»**.
2. Localiza una solicitud «en revisión».
3. **Aprueba** una y **rechaza** otra.
- **Resultado esperado:** la lista muestra las solicitudes; al aprobar pasa a «aprobada»
  (aparece botón «Descargar contrato») y al rechazar a «rechazada».

## UAT-08 · Descarga del contrato PDF
1. En una solicitud **aprobada**, pulsa **«Descargar contrato»**.
2. Abre el archivo descargado.
- **Resultado esperado:** descarga `contrato-adopta-ya-<id>.pdf` con los datos del adoptante
  y las cláusulas (Ley 1581). **Defecto si:** no descarga, descarga vacío o lo permite en una
  solicitud no aprobada.

## UAT-09 · Evidencia post-adopción (vista de refugio)
1. Con una solicitud **aprobada**, en «Mi seguimiento post-adopción», escribe el número.
2. Escribe una nota y (opcional) una foto menor a 300 KB.
3. Pulsa **«Registrar evidencia»**.
4. Repite con una solicitud **no aprobada**.
- **Resultado esperado:** en la aprobada se registra («día 0») y aparece en el historial; en
  la no aprobada muestra error.

## UAT-10 · Alertas de seguimiento 30/60/90
1. Pulsa **«Cargar alertas de seguimiento»**.
- **Resultado esperado:** tarjetas con mascota, adoptante, día acumulado, número de
  evidencias, próximo hito e insignia (Al día / Vencida / Completada).

## UAT-12 · Rechazo con nota e historial
1. En el panel, rechaza una solicitud «en revisión» escribiendo un **motivo**.
- **Resultado esperado:** queda visible el estado «rechazada» y la **nota** del motivo en la
  tarjeta; el cambio queda en el historial.

## UAT-13 · Registrar mascota con ficha clínica
1. En **«Gestión de mascotas (refugio)»**, completa nombre, especie, edad, emoji, estado,
   **salud, vacunas, esterilizado** y descripción.
2. Pulsa **«Guardar mascota»**.
3. Casos límite: intenta guardar **sin** nombre/edad y con una especie fuera del catálogo.
- **Resultado esperado:** la mascota se crea («Mascota registrada (N.º X)») y aparece en la
  lista y en el catálogo; sin nombre/edad avisa y con especie inválida responde error 400.

## UAT-14 · Editar una mascota existente
1. En la lista, pulsa **«Editar»** en una mascota.
2. Verifica que el formulario trae sus datos (incluida la ficha clínica).
3. Cambia el estado (p. ej. a «adoptado») y la descripción.
4. Pulsa **«Guardar mascota»**.
- **Resultado esperado:** «Mascota N.º X actualizada.» y el cambio se ve en la lista y en el
  catálogo.

## UAT-15 · Retirar (eliminar) una mascota
1. En la lista, pulsa **«Eliminar»** en una mascota.
2. Confirma el aviso de borrado.
- **Resultado esperado:** «Mascota eliminada.», desaparece de la lista y del catálogo (al
  consultarla responde 404).

## UAT-16 · Control de acceso
1. **Sin sesión**, intenta guardar o eliminar una mascota.
2. Con tu sesión de **administrador**, repite la operación.
- **Resultado esperado:** sin sesión pide iniciar sesión como administrador; como
  administrador la operación **procede**.

## UAT-11 · Diseño responsive (opcional, cualquier rol)
Reduce la ventana a menos de 700 px y recorre el panel y la gestión: debe verse en columna,
sin desbordes.

---

Gracias por participar. Firma aquí: ____________________  Fecha: ____________