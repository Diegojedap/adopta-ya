# Hoja del participante — Adoptante

Sesión de aceptación (UAT) de **¡ADOPTA YA! 1.0** · Tu rol: **adoptante**.
Realiza los pasos en orden. El facilitador te cronometra y anota los resultados; **no tienes
que hacerlo tú**. Si algo no se ve, no funciona o se ve raro, dilo en voz alta y el
facilitador lo registra. No hay respuestas incorrectas.

**Entorno:** navegador sobre `www/` (o APK). Credenciales de prueba si hace falta:
`admin@adoptaya.local` / `admin123`.

---

## UAT-01 · Portada y navegación al catálogo
1. Abre la aplicación y lee el encabezado y la propuesta.
2. Pulsa el botón **«Ver mascotas»**.
- **Resultado esperado:** la vista se desplaza suavemente hasta «Mascotas en adopción».

## UAT-02 · Catálogo cargado desde la API
1. Mira el catálogo de mascotas.
2. Revisa que aparezcan nombres, edad, descripción y el botón de adopción.
- **Resultado esperado:** se listan Max, Luna y Rocky (u otras mascotas del refugio) con sus
  datos. **Defecto si:** el catálogo sale vacío o sin datos.

## UAT-03 · Iniciar adopción desde el catálogo
1. Pulsa **«Quiero adoptarlo»** en una mascota.
2. Lee el mensaje de confirmación.
- **Resultado esperado:** aparece un mensaje con el nombre de la mascota y la solicitud queda
  «en revisión» (el refugio la verá en el panel).

## UAT-04 · Postulación con consentimiento (Ley 1581)
1. Ve a la sección **«Formulario de postulación»**.
2. Intenta enviar **sin** marcar la casilla de autorización de datos.
3. Completa nombre, correo, teléfono, mascota de interés y motivación.
4. Marca la autorización de datos y envía.
- **Resultado esperado:** sin consentimiento muestra un aviso; con consentimiento confirma
  «Postulación enviada» con el número de solicitud y estado «en revisión».

## UAT-05 · Registro de adoptante
1. En **«Acceso a tu cuenta»**, escribe tu nombre, un correo nuevo y una contraseña.
2. Pulsa **«Registrarse»**.
- **Resultado esperado:** se crea el usuario y aparece «Sesión iniciada: … (adoptante)».

## UAT-09 · Registrar evidencia post-adopción
*(Se hace con una adopción **aprobada** por el refugio; pregunta al facilitador el número.)*
1. En **«Mi seguimiento post-adopción»**, escribe el número de la solicitud **aprobada**.
2. Escribe una nota (y opcionalmente adjunta una foto menor a 300 KB).
3. Pulsa **«Registrar evidencia»**.
4. Repite el intento con una solicitud **no aprobada**.
- **Resultado esperado:** en la aprobada se registra la evidencia («día 0») y aparece en el
  historial; en la no aprobada muestra un error.

## UAT-11 · Diseño responsive
1. Reduce la ventana a menos de 700 px (o abre en el móvil).
2. Recorre catálogo, formularios y seguimiento.
- **Resultado esperado:** el contenido se acomoda en una columna, sin desbordes horizontales,
  botones y textos legibles.

## UAT-16 · Control de acceso a la gestión de mascotas
1. **Sin iniciar sesión**, intenta guardar una mascota en «Gestión de mascotas (refugio)».
2. Con tu sesión de **adoptante**, repite el intento.
- **Resultado esperado:** sin sesión firme que pide iniciar sesión como administrador; con
  usuario adoptante, la operación es rechazada por el sistema.

---

Gracias por participar. Firma aquí: ____________________  Fecha: ____________