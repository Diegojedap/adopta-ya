const API_BASE = "http://localhost:3000";

let idiomaActual = "es";
let usuarioActual = null;

const DICCIONARIO = {
    es: {
        // Navegación y encabezado
        nav_mascotas: "Mascotas",
        nav_postular: "Postular",
        nav_seguimiento: "Seguimiento",
        nav_panel: "Panel",
        nav_gestion: "Gestión",
        nav_sesion: "Iniciar sesión",
        sesion_ninguna: "Sin sesión iniciada.",
        sesion_iniciada: function (nombre, rol) { return "Sesión iniciada: " + nombre + " (" + rol + ")"; },

        // Portada
        hero_etiqueta: "Adopción responsable",
        hero_titulo: "Encuentra a tu nuevo compañero",
        hero_texto: "Conoce mascotas que están esperando una familia que les brinde amor, cuidado y un hogar.",
        hero_boton: "Ver mascotas",

        // Catálogo
        catalogo_etiqueta: "Catálogo",
        catalogo_titulo: "Mascotas en adopción",
        edad_label: "Edad:",
        edad_max: "2 años",
        edad_luna: "1 año",
        edad_rocky: "3 años",
        max_desc: "Amigable, cariñoso y lleno de energía.",
        luna_desc: "Tranquila, tierna y busca una familia amorosa.",
        rocky_desc: "Juguetón, obediente y muy cariñoso.",
        quiero_adoptarlo: "Quiero adoptarlo",
        quiero_adoptarla: "Quiero adoptarla",

        // Responsabilidad
        responsabilidad_etiqueta: "Compromiso",
        responsabilidad_titulo: "❤️ Adopta con responsabilidad",
        responsabilidad_texto: "Adoptar significa brindar amor, protección, alimentación, atención veterinaria y un hogar seguro durante toda la vida.",
        cuidado_hogar_titulo: "Hogar",
        cuidado_hogar_texto: "Un espacio seguro y lleno de cariño.",
        cuidado_salud_titulo: "Salud",
        cuidado_salud_texto: "Visitas veterinarias, vacunas y desparasitación.",
        cuidado_amor_titulo: "Amor",
        cuidado_amor_texto: "Tiempo, paciencia y cuidado todos los días.",

        // Acceso
        acceso_etiqueta: "Tu cuenta",
        acceso_titulo: "Acceso a tu cuenta",
        ph_acceso_nombre: "Nombre (solo registro)",
        ph_acceso_email: "Correo electrónico",
        ph_acceso_clave: "Contraseña",
        btn_ingresar: "Ingresar",
        btn_registrarse: "Registrarse",

        // Postulación
        postulacion_etiqueta: "Quiero adoptar",
        postulacion_titulo: "Formulario de postulación",
        postulacion_texto: "Cuéntanos sobre ti para evaluar la adopción. Al enviar, autorizas el tratamiento de tus datos conforme a la Ley 1581 de 2012.",
        ph_post_nombre: "Nombre completo",
        ph_post_email: "Correo electrónico",
        ph_post_telefono: "Teléfono",
        ph_post_mascota: "Mascota de interés",
        ph_post_motivacion: "¿Por qué quieres adoptar?",
        post_consentimiento: "Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012)",
        btn_enviar_postulacion: "Enviar postulación",
        post_incompleto: "Completa nombre, correo y mascota de interés.",
        post_consentimiento_falta: "Debes autorizar el tratamiento de datos (Ley 1581).",
        post_enviada: function (id, estado) { return "Postulación enviada. N.º de solicitud: " + id + " (estado: " + estado + ")"; },
        post_error: "No se pudo enviar la postulación.",

        // Seguimiento
        seguimiento_etiqueta: "Post-adopción",
        seguimiento_titulo: "Mi seguimiento post-adopción",
        seguimiento_texto: "Si tu adopción fue aprobada, registra evidencias (fotos y notas) durante los primeros meses. El refugio recibe recordatorios a los 30, 60 y 90 días.",
        ph_seg_solicitud: "N.º de tu solicitud",
        ph_seg_descripcion: "¿Cómo va tu mascota? (nota)",
        seg_foto_label: "Foto (opcional):",
        btn_registrar_evidencia: "Registrar evidencia",
        evidencia_sin_sesion: "Inicia sesión para registrar evidencias.",
        evidencia_sin_id: "Indica el número de tu solicitud.",
        evidencia_sin_datos: "Describe un avance o adjunta una foto.",
        evidencia_foto_grande: "La foto supera 300 KB; prueba con una más pequeña.",
        evidencia_ok: function (dia) { return "Evidencia registrada (día " + dia + ")."; },
        evidencia_error: "No se pudo registrar la evidencia.",
        evidencia_alt: "Evidencia del seguimiento",
        dia_label: "Día",
        sin_evidencias: "Sin evidencias registradas todavía.",

        // Panel
        panel_etiqueta: "Refugio",
        panel_titulo: "Panel de evaluación (refugio)",
        panel_estado_inicial: "Inicia sesión como administrador y pulsa «Cargar solicitudes».",
        btn_cargar_solicitudes: "Cargar solicitudes",
        btn_cargar_alertas: "Cargar alertas de seguimiento",
        panel_sin_sesion: "Inicia sesión como administrador.",
        panel_no_autorizado: "No autorizado o sin solicitudes.",
        panel_conteo: function (n) { return n + " solicitud(es)."; },
        aprobar: "Aprobar",
        rechazar: "Rechazar",
        descargar_contrato: "Descargar contrato",
        sin_datos: "Sin datos",
        rechazo_prompt: "Motivo del rechazo (se mostrará al solicitante):",
        contrato_error: "No se pudo descargar el contrato.",
        alertas_no_autorizado: "No autorizado.",
        alertas_conteo: function (n) { return n + " adopción(es) en seguimiento."; },
        alertas_vacio: "No hay adopciones aprobadas en seguimiento.",
        alerta_al_dia: "Al día",
        alerta_vencida: "Vencida",
        alerta_vencida_final: "Vencida final",
        alerta_completada: "Completada",
        alerta_dia_seguimiento: function (n) { return "Día " + n + " de seguimiento"; },
        alerta_evidencias: function (n) { return n + " evidencia(s)"; },
        alerta_hito: function (hito, dias) { return " · Próximo hito: día " + hito + " (en " + dias + " día(s))"; },

        // Gestión de mascotas
        gestion_etiqueta: "Refugio",
        gestion_titulo: "Gestión de mascotas (refugio)",
        gestion_texto: "Registra, edita o retira mascotas del catálogo, incluyendo su ficha clínica. Requiere sesión de administrador.",
        ph_mascota_nombre: "Nombre",
        opt_perro: "Perro",
        opt_gato: "Gato",
        opt_otro: "Otro",
        ph_mascota_edad: "Edad (ej. 2 años)",
        ph_mascota_emoji: "Emoji (ej. 🐶)",
        opt_disponible: "Disponible",
        opt_en_revision: "En revisión",
        opt_adoptado: "Adoptado",
        ph_mascota_salud: "Salud (ficha clínica)",
        ph_mascota_vacunas: "Vacunas",
        label_esterilizado: "Esterilizado",
        ph_mascota_descripcion: "Descripción",
        btn_guardar_mascota: "Guardar mascota",
        btn_limpiar: "Limpiar",
        btn_cargar_mascotas: "Cargar mascotas",
        gestion_sin_sesion: "Inicia sesión como administrador.",
        gestion_completa: "Completa nombre y edad.",
        mascota_actualizada: function (id) { return "Mascota N.º " + id + " actualizada."; },
        mascota_registrada: function (id) { return "Mascota registrada (N.º " + id + ")."; },
        mascota_no_encontrada: "No se encontró la mascota.",
        mascota_editando: function (id) { return "Editando la mascota N.º " + id + ". Guarda para aplicar los cambios."; },
        mascota_confirmar_eliminar: function (id) { return "¿Eliminar la mascota N.º " + id + "? Esta acción no se puede deshacer."; },
        mascota_eliminada: "Mascota eliminada.",
        catalogo_error: "No se pudo cargar el catálogo.",
        mascotas_conteo: function (n) { return n + " mascota(s) registradas."; },
        ficha_salud: "Salud:",
        ficha_vacunas: "Vacunas:",
        ficha_esterilizado: "Esterilizado:",
        si: "sí",
        no: "no",
        editar: "Editar",
        eliminar: "Eliminar",

        // Comunes
        servidor_error: "No se pudo conectar con el servidor.",
        footer: "🐾 ADOPTA YA — Una segunda oportunidad comienza contigo."
    },

    en: {
        // Navigation and header
        nav_mascotas: "Pets",
        nav_postular: "Apply",
        nav_seguimiento: "Follow-up",
        nav_panel: "Panel",
        nav_gestion: "Manage",
        nav_sesion: "Sign in",
        sesion_ninguna: "Not signed in.",
        sesion_iniciada: function (nombre, rol) { return "Signed in: " + nombre + " (" + rol + ")"; },

        // Hero
        hero_etiqueta: "Responsible adoption",
        hero_titulo: "Find your new companion",
        hero_texto: "Meet pets waiting for a family to give them love, care and a home.",
        hero_boton: "See pets",

        // Catalog
        catalogo_etiqueta: "Catalog",
        catalogo_titulo: "Pets for adoption",
        edad_label: "Age:",
        edad_max: "2 years",
        edad_luna: "1 year",
        edad_rocky: "3 years",
        max_desc: "Friendly, affectionate and full of energy.",
        luna_desc: "Calm, sweet and looking for a loving family.",
        rocky_desc: "Playful, obedient and very affectionate.",
        quiero_adoptarlo: "I want to adopt",
        quiero_adoptarla: "I want to adopt",

        // Responsibility
        responsabilidad_etiqueta: "Commitment",
        responsabilidad_titulo: "❤️ Adopt responsibly",
        responsabilidad_texto: "Adopting means giving love, protection, food, veterinary care and a safe home for life.",
        cuidado_hogar_titulo: "Home",
        cuidado_hogar_texto: "A safe space full of affection.",
        cuidado_salud_titulo: "Health",
        cuidado_salud_texto: "Vet visits, vaccines and deworming.",
        cuidado_amor_titulo: "Love",
        cuidado_amor_texto: "Time, patience and care every day.",

        // Login
        acceso_etiqueta: "Your account",
        acceso_titulo: "Account access",
        ph_acceso_nombre: "Name (registration only)",
        ph_acceso_email: "Email",
        ph_acceso_clave: "Password",
        btn_ingresar: "Sign in",
        btn_registrarse: "Sign up",

        // Application
        postulacion_etiqueta: "I want to adopt",
        postulacion_titulo: "Application form",
        postulacion_texto: "Tell us about yourself so we can assess the adoption. By submitting, you authorize the processing of your data under Law 1581 of 2012.",
        ph_post_nombre: "Full name",
        ph_post_email: "Email",
        ph_post_telefono: "Phone",
        ph_post_mascota: "Pet of interest",
        ph_post_motivacion: "Why do you want to adopt?",
        post_consentimiento: "I authorize the processing of my personal data (Law 1581 of 2012)",
        btn_enviar_postulacion: "Submit application",
        post_incompleto: "Complete name, email and pet of interest.",
        post_consentimiento_falta: "You must authorize data processing (Law 1581).",
        post_enviada: function (id, estado) { return "Application sent. Request No.: " + id + " (status: " + estado + ")"; },
        post_error: "The application could not be sent.",

        // Follow-up
        seguimiento_etiqueta: "Post-adoption",
        seguimiento_titulo: "My post-adoption follow-up",
        seguimiento_texto: "If your adoption was approved, record evidence (photos and notes) during the first months. The shelter gets reminders at 30, 60 and 90 days.",
        ph_seg_solicitud: "Your request No.",
        ph_seg_descripcion: "How is your pet doing? (note)",
        seg_foto_label: "Photo (optional):",
        btn_registrar_evidencia: "Add evidence",
        evidencia_sin_sesion: "Sign in to add evidence.",
        evidencia_sin_id: "Enter your request number.",
        evidencia_sin_datos: "Describe an update or attach a photo.",
        evidencia_foto_grande: "The photo exceeds 300 KB; try a smaller one.",
        evidencia_ok: function (dia) { return "Evidence recorded (day " + dia + ")."; },
        evidencia_error: "The evidence could not be recorded.",
        evidencia_alt: "Follow-up evidence",
        dia_label: "Day",
        sin_evidencias: "No evidence recorded yet.",

        // Panel
        panel_etiqueta: "Shelter",
        panel_titulo: "Evaluation panel (shelter)",
        panel_estado_inicial: "Sign in as administrator and press «Load requests».",
        btn_cargar_solicitudes: "Load requests",
        btn_cargar_alertas: "Load follow-up alerts",
        panel_sin_sesion: "Sign in as administrator.",
        panel_no_autorizado: "Unauthorized or no requests.",
        panel_conteo: function (n) { return n + " request(s)."; },
        aprobar: "Approve",
        rechazar: "Reject",
        descargar_contrato: "Download contract",
        sin_datos: "No data",
        rechazo_prompt: "Rejection reason (shown to the applicant):",
        contrato_error: "The contract could not be downloaded.",
        alertas_no_autorizado: "Unauthorized.",
        alertas_conteo: function (n) { return n + " adoption(s) under follow-up."; },
        alertas_vacio: "There are no approved adoptions under follow-up.",
        alerta_al_dia: "Up to date",
        alerta_vencida: "Overdue",
        alerta_vencida_final: "Overdue (final)",
        alerta_completada: "Completed",
        alerta_dia_seguimiento: function (n) { return "Day " + n + " of follow-up"; },
        alerta_evidencias: function (n) { return n + " evidence item(s)"; },
        alerta_hito: function (hito, dias) { return " · Next milestone: day " + hito + " (in " + dias + " day(s))"; },

        // Pet management
        gestion_etiqueta: "Shelter",
        gestion_titulo: "Pet management (shelter)",
        gestion_texto: "Register, edit or remove pets from the catalog, including their clinical record. Requires an administrator session.",
        ph_mascota_nombre: "Name",
        opt_perro: "Dog",
        opt_gato: "Cat",
        opt_otro: "Other",
        ph_mascota_edad: "Age (e.g. 2 years)",
        ph_mascota_emoji: "Emoji (e.g. 🐶)",
        opt_disponible: "Available",
        opt_en_revision: "Under review",
        opt_adoptado: "Adopted",
        ph_mascota_salud: "Health (clinical record)",
        ph_mascota_vacunas: "Vaccines",
        label_esterilizado: "Neutered",
        ph_mascota_descripcion: "Description",
        btn_guardar_mascota: "Save pet",
        btn_limpiar: "Clear",
        btn_cargar_mascotas: "Load pets",
        gestion_sin_sesion: "Sign in as administrator.",
        gestion_completa: "Complete name and age.",
        mascota_actualizada: function (id) { return "Pet No. " + id + " updated."; },
        mascota_registrada: function (id) { return "Pet registered (No. " + id + ")."; },
        mascota_no_encontrada: "The pet was not found.",
        mascota_editando: function (id) { return "Editing pet No. " + id + ". Save to apply the changes."; },
        mascota_confirmar_eliminar: function (id) { return "Delete pet No. " + id + "? This action cannot be undone."; },
        mascota_eliminada: "Pet deleted.",
        catalogo_error: "The catalog could not be loaded.",
        mascotas_conteo: function (n) { return n + " pet(s) registered."; },
        ficha_salud: "Health:",
        ficha_vacunas: "Vaccines:",
        ficha_esterilizado: "Neutered:",
        si: "yes",
        no: "no",
        editar: "Edit",
        eliminar: "Delete",

        // Common
        servidor_error: "Could not connect to the server.",
        footer: "🐾 ADOPTA YA — A second chance starts with you."
    }
};

function t(clave) {
    const args = Array.prototype.slice.call(arguments, 1);
    const idioma = DICCIONARIO[idiomaActual] || DICCIONARIO.es;
    let valor = idioma[clave];
    if (valor === undefined) valor = DICCIONARIO.es[clave];
    if (valor === undefined) return clave;
    return typeof valor === "function" ? valor.apply(null, args) : valor;
}

function mostrarMascotas() {
    const mascotas = document.getElementById("mascotas");

    mascotas.scrollIntoView({
        behavior: "smooth"
    });
}

function pintarMascotas(lista) {
    const contenedor = document.querySelector(".contenedor-mascotas");
    if (!contenedor || !Array.isArray(lista) || lista.length === 0) return;

    contenedor.innerHTML = lista.map(function (m) {
        return (
            '<div class="tarjeta">' +
                '<div class="emoji">' + (m.emoji || "🐾") + '</div>' +
                '<h3>' + m.nombre + '</h3>' +
                '<p><strong>' + t("edad_label") + '</strong> ' + m.edad + '</p>' +
                '<p>' + (m.descripcion || "") + '</p>' +
                '<button onclick="adoptar(\'' + m.nombre + '\')">' + t("quiero_adoptarlo") + '</button>' +
            '</div>'
        );
    }).join("");
}

function cargarMascotas() {
    return fetch(API_BASE + "/mascotas")
        .then(function (respuesta) { return respuesta.json(); })
        .then(pintarMascotas)
        .catch(function () {});
}

function adoptar(nombre) {
    const mensaje = idiomaActual === "en"
        ? "Thank you for wanting to adopt " + nombre + "! 🐾\n\nYour request has been recorded and is under review."
        : "¡Gracias por querer adoptar a " + nombre + "! 🐾\n\nTu solicitud quedó registrada y está en revisión.";
    alert(mensaje);

    fetch(API_BASE + "/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascota: nombre, estado: "en_revision" })
    }).catch(function () {});

    const campo = document.getElementById("post-mascota");
    if (campo) campo.value = nombre;
}

function mostrarSesion(usuario) {
    usuarioActual = usuario || null;
    const etiqueta = document.getElementById("sesion");
    if (!etiqueta) return;
    etiqueta.textContent = usuario
        ? t("sesion_iniciada", usuario.nombre, usuario.rol)
        : t("sesion_ninguna");
}

function ingresar() {
    const email = document.getElementById("acceso-email").value;
    const clave = document.getElementById("acceso-clave").value;

    fetch(API_BASE + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, clave: clave })
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (datos.token) {
                try { localStorage.setItem("token", datos.token); } catch (e) {}
                mostrarSesion(datos.usuario);
            } else {
                mostrarSesion(null);
            }
        })
        .catch(function () { mostrarSesion(null); });
}

function registrarse() {
    const nombre = document.getElementById("acceso-nombre").value;
    const email = document.getElementById("acceso-email").value;
    const clave = document.getElementById("acceso-clave").value;

    fetch(API_BASE + "/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombre, email: email, clave: clave })
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (datos.id) ingresar();
            else mostrarSesion(null);
        })
        .catch(function () { mostrarSesion(null); });
}

function enviarPostulacion() {
    const nombre = document.getElementById("post-nombre").value;
    const email = document.getElementById("post-email").value;
    const telefono = document.getElementById("post-telefono").value;
    const mascota = document.getElementById("post-mascota").value;
    const motivacion = document.getElementById("post-motivacion").value;
    const consentimiento = document.getElementById("post-consentimiento").checked;
    const etiqueta = document.getElementById("post-estado");

    if (!nombre || !email || !mascota) {
        if (etiqueta) etiqueta.textContent = t("post_incompleto");
        return;
    }
    if (!consentimiento) {
        if (etiqueta) etiqueta.textContent = t("post_consentimiento_falta");
        return;
    }

    const cabeceras = { "Content-Type": "application/json" };
    try {
        const token = localStorage.getItem("token");
        if (token) cabeceras["Authorization"] = "Bearer " + token;
    } catch (e) {}

    fetch(API_BASE + "/solicitudes", {
        method: "POST",
        headers: cabeceras,
        body: JSON.stringify({
            nombre: nombre, email: email, telefono: telefono,
            mascota: mascota, motivacion: motivacion, consentimiento: consentimiento
        })
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (etiqueta) etiqueta.textContent = (datos && datos.id)
                ? t("post_enviada", datos.id, datos.estado)
                : t("post_error");
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = t("servidor_error");
        });
}

function ultimaNota(s) {
    if (!s) return "";
    if (s.nota) return s.nota;
    if (Array.isArray(s.historial)) {
        for (let i = s.historial.length - 1; i >= 0; i--) {
            if (s.historial[i] && s.historial[i].nota) return s.historial[i].nota;
        }
    }
    return "";
}

function tarjetaSolicitud(s) {
    let botones = "";
    if (s.estado === "en_revision") {
        botones = '<button onclick="cambiarEstado(' + s.id + ',\'aprobada\')">' + t("aprobar") + '</button>' +
                  '<button onclick="cambiarEstado(' + s.id + ',\'rechazada\')">' + t("rechazar") + '</button>';
    } else if (s.estado === "aprobada") {
        botones = '<button onclick="descargarContrato(' + s.id + ')">' + t("descargar_contrato") + '</button>';
    }
    const nota = ultimaNota(s);
    return '<div class="solicitud">' +
        '<strong>' + (s.mascota || ("#" + s.mascota_id)) + '</strong> · ' + s.estado +
        '<br>' + (s.solicitante_nombre || t("sin_datos")) +
        (s.solicitante_email ? ' (' + s.solicitante_email + ')' : '') +
        (s.motivacion ? '<br>' + s.motivacion : '') +
        (nota ? '<div class="nota-estado">📝 ' + nota + '</div>' : '') +
        '<div class="acciones">' + botones + '</div>' +
        '</div>';
}

function cargarSolicitudes() {
    const lista = document.getElementById("lista-solicitudes");
    const info = document.getElementById("panel-estado");
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    if (!token) {
        if (info) info.textContent = t("panel_sin_sesion");
        return;
    }
    fetch(API_BASE + "/solicitudes", { headers: { "Authorization": "Bearer " + token } })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (info) info.textContent = t("panel_no_autorizado");
                return;
            }
            if (info) info.textContent = t("panel_conteo", datos.length);
            if (lista) lista.innerHTML = datos.map(tarjetaSolicitud).join("");
        })
        .catch(function () {
            if (info) info.textContent = t("servidor_error");
        });
}

function cambiarEstado(id, estado) {
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    const cuerpo = { estado: estado };
    if (estado === "rechazada") {
        const motivo = window.prompt(t("rechazo_prompt"), "");
        if (motivo === null) return;
        if (motivo.trim()) cuerpo.nota = motivo.trim();
    }
    fetch(API_BASE + "/solicitudes/" + id + "/estado", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(cuerpo)
    }).then(cargarSolicitudes).catch(function () {});
}

function descargarContrato(id) {
    const info = document.getElementById("panel-estado");
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    fetch(API_BASE + "/solicitudes/" + id + "/contrato", {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(function (respuesta) {
            if (!respuesta.ok) throw new Error("sin contrato");
            return respuesta.blob();
        })
        .then(function (blob) {
            const enlace = document.createElement("a");
            const url = URL.createObjectURL(blob);
            enlace.href = url;
            enlace.download = "contrato-adopta-ya-" + id + ".pdf";
            document.body.appendChild(enlace);
            enlace.click();
            document.body.removeChild(enlace);
            URL.revokeObjectURL(url);
        })
        .catch(function () {
            if (info) info.textContent = t("contrato_error");
        });
}

function leerArchivoComoDataUrl(archivo, maxBytes, completado) {
    if (!archivo) { completado(null); return; }
    if (archivo.size > maxBytes) { completado("excede"); return; }
    const lector = new FileReader();
    lector.onload = function () { completado(lector.result); };
    lector.onerror = function () { completado(null); };
    lector.readAsDataURL(archivo);
}

function registrarEvidencia() {
    const id = document.getElementById("seg-solicitud").value;
    const descripcion = document.getElementById("seg-descripcion").value.trim();
    const archivo = document.getElementById("seg-foto").files[0];
    const etiqueta = document.getElementById("seg-estado");
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    if (!token) {
        if (etiqueta) etiqueta.textContent = t("evidencia_sin_sesion");
        return;
    }
    if (!id) {
        if (etiqueta) etiqueta.textContent = t("evidencia_sin_id");
        return;
    }
    if (!descripcion && !archivo) {
        if (etiqueta) etiqueta.textContent = t("evidencia_sin_datos");
        return;
    }

    leerArchivoComoDataUrl(archivo, 300 * 1024, function (url) {
        if (url === "excede") {
            if (etiqueta) etiqueta.textContent = t("evidencia_foto_grande");
            return;
        }
        const cuerpo = { descripcion: descripcion };
        if (url) cuerpo.url = url;

        fetch(API_BASE + "/solicitudes/" + id + "/evidencias", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(cuerpo)
        })
            .then(function (respuesta) { return respuesta.json(); })
            .then(function (datos) {
                if (datos && datos.id) {
                    if (etiqueta) etiqueta.textContent = t("evidencia_ok", (datos.dia ?? "?"));
                    cargarEvidencias(id);
                } else if (datos && datos.error) {
                    if (etiqueta) etiqueta.textContent = datos.error;
                } else {
                    if (etiqueta) etiqueta.textContent = t("evidencia_error");
                }
            })
            .catch(function () {
                if (etiqueta) etiqueta.textContent = t("servidor_error");
            });
    });
}

function tarjetaEvidencia(e) {
    const foto = e.url
        ? '<div class="evidencia-foto"><img src="' + e.url + '" alt="' + t("evidencia_alt") + '"></div>'
        : "";
    const fecha = new Date(e.creado_en || Date.now()).toLocaleDateString(idiomaActual === "en" ? "en-US" : "es-CO");
    return '<div class="evidencia">' +
        '<strong>' + t("dia_label") + ' ' + (e.dia ?? "?") + '</strong> · ' +
        fecha +
        (e.descripcion ? '<br>' + e.descripcion : '') +
        foto +
        '</div>';
}

function cargarEvidencias(id) {
    const lista = document.getElementById("lista-evidencias");
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    if (!token || !id) return;
    fetch(API_BASE + "/solicitudes/" + id + "/evidencias", {
        headers: { "Authorization": "Bearer " + token }
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!lista) return;
            lista.innerHTML = Array.isArray(datos) && datos.length
                ? datos.map(tarjetaEvidencia).join("")
                : "<p>" + t("sin_evidencias") + "</p>";
        })
        .catch(function () {});
}

function tarjetaAlerta(a) {
    const estado = a.estado_alerta || "al_dia";
    const etiquetas = {
        al_dia: t("alerta_al_dia"),
        vencida: t("alerta_vencida"),
        vencida_final: t("alerta_vencida_final"),
        completada: t("alerta_completada")
    };
    const textoHito = a.proximo_hito
        ? t("alerta_hito", a.proximo_hito, a.dias_para_hito)
        : "";
    return '<div class="alerta">' +
        '<strong>' + (a.mascota || ("#" + a.solicitud_id)) + '</strong> · ' + (a.adoptante || t("sin_datos")) +
        '<br>' + t("alerta_dia_seguimiento", a.dias_acumulados) + ' · ' + t("alerta_evidencias", a.cantidad_evidencias) +
        textoHito +
        ' <span class="estado estado-' + estado + '">' + (etiquetas[estado] || estado) + '</span>' +
        '</div>';
}

function cargarAlertas() {
    const lista = document.getElementById("lista-alertas");
    const info = document.getElementById("panel-estado");
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    if (!token) {
        if (info) info.textContent = t("panel_sin_sesion");
        return;
    }
    fetch(API_BASE + "/seguimiento/alertas", { headers: { "Authorization": "Bearer " + token } })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (info) info.textContent = t("alertas_no_autorizado");
                return;
            }
            if (info) info.textContent = t("alertas_conteo", datos.length);
            if (lista) lista.innerHTML = datos.length
                ? datos.map(tarjetaAlerta).join("")
                : "<p>" + t("alertas_vacio") + "</p>";
        })
        .catch(function () {
            if (info) info.textContent = t("servidor_error");
        });
}

function tokenAdmin() {
    try { return localStorage.getItem("token"); } catch (e) { return null; }
}

function limpiarFormularioMascota() {
    ["mascota-id", "mascota-nombre", "mascota-edad", "mascota-emoji",
     "mascota-salud", "mascota-vacunas", "mascota-descripcion"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    const especie = document.getElementById("mascota-especie");
    if (especie) especie.value = "perro";
    const estado = document.getElementById("mascota-estado");
    if (estado) estado.value = "disponible";
    const esterilizado = document.getElementById("mascota-esterilizado");
    if (esterilizado) esterilizado.checked = false;
}

function guardarMascota() {
    const token = tokenAdmin();
    const etiqueta = document.getElementById("gestion-estado");
    if (!token) {
        if (etiqueta) etiqueta.textContent = t("gestion_sin_sesion");
        return;
    }
    const id = document.getElementById("mascota-id").value;
    const cuerpo = {
        nombre: document.getElementById("mascota-nombre").value.trim(),
        especie: document.getElementById("mascota-especie").value,
        edad: document.getElementById("mascota-edad").value.trim(),
        emoji: document.getElementById("mascota-emoji").value.trim(),
        estado: document.getElementById("mascota-estado").value,
        salud: document.getElementById("mascota-salud").value.trim(),
        vacunas: document.getElementById("mascota-vacunas").value.trim(),
        esterilizado: document.getElementById("mascota-esterilizado").checked,
        descripcion: document.getElementById("mascota-descripcion").value.trim()
    };
    if (!cuerpo.nombre || !cuerpo.edad) {
        if (etiqueta) etiqueta.textContent = t("gestion_completa");
        return;
    }
    fetch(API_BASE + (id ? "/mascotas/" + id : "/mascotas"), {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(cuerpo)
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (datos && datos.error) {
                if (etiqueta) etiqueta.textContent = datos.error;
                return;
            }
            if (etiqueta) etiqueta.textContent = id
                ? t("mascota_actualizada", id)
                : t("mascota_registrada", (datos && datos.id ? datos.id : "?"));
            limpiarFormularioMascota();
            cargarMascotasAdmin();
            cargarMascotas();
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = t("servidor_error");
        });
}

function editarMascota(id) {
    const etiqueta = document.getElementById("gestion-estado");
    fetch(API_BASE + "/mascotas/" + id)
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (m) {
            if (!m || m.error) {
                if (etiqueta) etiqueta.textContent = t("mascota_no_encontrada");
                return;
            }
            document.getElementById("mascota-id").value = m.id;
            document.getElementById("mascota-nombre").value = m.nombre || "";
            document.getElementById("mascota-especie").value = m.especie || "perro";
            document.getElementById("mascota-edad").value = m.edad || "";
            document.getElementById("mascota-emoji").value = m.emoji || "";
            document.getElementById("mascota-estado").value = m.estado || "disponible";
            document.getElementById("mascota-salud").value = m.salud || "";
            document.getElementById("mascota-vacunas").value = m.vacunas || "";
            document.getElementById("mascota-esterilizado").checked = !!m.esterilizado;
            document.getElementById("mascota-descripcion").value = m.descripcion || "";
            if (etiqueta) etiqueta.textContent = t("mascota_editando", m.id);
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = t("servidor_error");
        });
}

function eliminarMascota(id) {
    const token = tokenAdmin();
    const etiqueta = document.getElementById("gestion-estado");
    if (!token) {
        if (etiqueta) etiqueta.textContent = t("gestion_sin_sesion");
        return;
    }
    if (!window.confirm(t("mascota_confirmar_eliminar", id))) return;
    fetch(API_BASE + "/mascotas/" + id, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (datos && datos.error) {
                if (etiqueta) etiqueta.textContent = datos.error;
                return;
            }
            if (etiqueta) etiqueta.textContent = t("mascota_eliminada");
            cargarMascotasAdmin();
            cargarMascotas();
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = t("servidor_error");
        });
}

function tarjetaMascotaAdmin(m) {
    const ficha = [
        m.salud ? t("ficha_salud") + " " + m.salud : "",
        m.vacunas ? t("ficha_vacunas") + " " + m.vacunas : "",
        t("ficha_esterilizado") + " " + (m.esterilizado ? t("si") : t("no"))
    ].filter(Boolean).join(" · ");
    return '<div class="solicitud mascota-admin">' +
        '<strong>' + (m.emoji || "🐾") + ' ' + m.nombre + '</strong> · ' + m.especie + ' · ' + m.edad +
        ' <span class="estado">' + m.estado + '</span>' +
        (m.descripcion ? '<br>' + m.descripcion : '') +
        (ficha ? '<br><small>' + ficha + '</small>' : '') +
        '<div class="acciones">' +
            '<button onclick="editarMascota(' + m.id + ')">' + t("editar") + '</button>' +
            '<button onclick="eliminarMascota(' + m.id + ')">' + t("eliminar") + '</button>' +
        '</div>' +
        '</div>';
}

function cargarMascotasAdmin() {
    const lista = document.getElementById("lista-mascotas-admin");
    const etiqueta = document.getElementById("gestion-estado");
    if (!tokenAdmin()) {
        if (etiqueta) etiqueta.textContent = t("gestion_sin_sesion");
        return;
    }
    fetch(API_BASE + "/mascotas")
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (etiqueta) etiqueta.textContent = t("catalogo_error");
                return;
            }
            if (etiqueta) etiqueta.textContent = t("mascotas_conteo", datos.length);
            if (lista) lista.innerHTML = datos.map(tarjetaMascotaAdmin).join("");
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = t("servidor_error");
        });
}

function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("abierto");
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("abierto");
}

function cerrarModalFondo(evento, id) {
    if (evento && evento.target && evento.target.id === id) cerrarModal(id);
}

function aplicarTema(tema) {
    const raiz = document.documentElement;
    if (tema === "dark" || tema === "light") {
        raiz.setAttribute("data-theme", tema);
    }
    const boton = document.getElementById("btn-tema");
    if (boton) boton.textContent = tema === "dark" ? "☀️" : "🌙";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", tema === "dark" ? "#0c1615" : "#0f766e");
}

function alternarTema() {
    const actual = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nuevo = actual === "dark" ? "light" : "dark";
    try { localStorage.setItem("tema", nuevo); } catch (e) {}
    aplicarTema(nuevo);
}

function inicializarTema() {
    let guardado = null;
    try { guardado = localStorage.getItem("tema"); } catch (e) {}
    if (guardado === "dark" || guardado === "light") {
        aplicarTema(guardado);
        return;
    }
    let prefiereOscuro = false;
    try {
        if (typeof window.matchMedia === "function") {
            prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
    } catch (e) {}
    aplicarTema(prefiereOscuro ? "dark" : "light");
}

function actualizarBotonIdioma() {
    const boton = document.getElementById("btn-idioma");
    if (boton) boton.textContent = idiomaActual === "en" ? "🌐 ES" : "🌐 EN";
}

function aplicarIdioma(idioma) {
    idiomaActual = (idioma === "en") ? "en" : "es";
    document.documentElement.setAttribute("lang", idiomaActual);

    const nodos = document.querySelectorAll("[data-i18n]");
    for (let i = 0; i < nodos.length; i++) {
        const clave = nodos[i].getAttribute("data-i18n");
        if (clave === "sesion_ninguna") continue;
        nodos[i].textContent = t(clave);
    }
    const marcadores = document.querySelectorAll("[data-i18n-ph]");
    for (let j = 0; j < marcadores.length; j++) {
        marcadores[j].setAttribute("placeholder", t(marcadores[j].getAttribute("data-i18n-ph")));
    }
    actualizarBotonIdioma();
    mostrarSesion(usuarioActual);
}

function alternarIdioma() {
    const nuevo = idiomaActual === "en" ? "es" : "en";
    try { localStorage.setItem("idioma", nuevo); } catch (e) {}
    aplicarIdioma(nuevo);
}

function inicializarIdioma() {
    let guardado = null;
    try { guardado = localStorage.getItem("idioma"); } catch (e) {}
    aplicarIdioma(guardado === "en" ? "en" : "es");
}

function prepararInterfaz() {
    cargarMascotas();
    inicializarTema();
    inicializarIdioma();
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            const abiertos = document.querySelectorAll(".modal.abierto");
            for (let i = 0; i < abiertos.length; i++) abiertos[i].classList.remove("abierto");
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", prepararInterfaz);
} else {
    prepararInterfaz();
}
