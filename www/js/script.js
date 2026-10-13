const API_BASE = "http://localhost:3000";

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
                '<p><strong>Edad:</strong> ' + m.edad + '</p>' +
                '<p>' + (m.descripcion || "") + '</p>' +
                '<button onclick="adoptar(\'' + m.nombre + '\')">Quiero adoptarlo</button>' +
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
    alert(
        "¡Gracias por querer adoptar a " + nombre +
        "! 🐾\n\nTu solicitud quedó registrada y está en revisión."
    );

    fetch(API_BASE + "/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mascota: nombre, estado: "en_revision" })
    }).catch(function () {});

    const campo = document.getElementById("post-mascota");
    if (campo) campo.value = nombre;
}

function mostrarSesion(usuario) {
    const etiqueta = document.getElementById("sesion");
    if (!etiqueta) return;
    etiqueta.textContent = usuario
        ? "Sesión iniciada: " + usuario.nombre + " (" + usuario.rol + ")"
        : "Sin sesión iniciada.";
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
        if (etiqueta) etiqueta.textContent = "Completa nombre, correo y mascota de interés.";
        return;
    }
    if (!consentimiento) {
        if (etiqueta) etiqueta.textContent = "Debes autorizar el tratamiento de datos (Ley 1581).";
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
                ? "Postulación enviada. N.º de solicitud: " + datos.id + " (estado: " + datos.estado + ")"
                : "No se pudo enviar la postulación.";
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
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
        botones = '<button onclick="cambiarEstado(' + s.id + ',\'aprobada\')">Aprobar</button>' +
                  '<button onclick="cambiarEstado(' + s.id + ',\'rechazada\')">Rechazar</button>';
    } else if (s.estado === "aprobada") {
        botones = '<button onclick="descargarContrato(' + s.id + ')">Descargar contrato</button>';
    }
    const nota = ultimaNota(s);
    return '<div class="solicitud">' +
        '<strong>' + (s.mascota || ("#" + s.mascota_id)) + '</strong> · ' + s.estado +
        '<br>' + (s.solicitante_nombre || "Sin datos") +
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
        if (info) info.textContent = "Inicia sesión como administrador.";
        return;
    }
    fetch(API_BASE + "/solicitudes", { headers: { "Authorization": "Bearer " + token } })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (info) info.textContent = "No autorizado o sin solicitudes.";
                return;
            }
            if (info) info.textContent = datos.length + " solicitud(es).";
            if (lista) lista.innerHTML = datos.map(tarjetaSolicitud).join("");
        })
        .catch(function () {
            if (info) info.textContent = "No se pudo conectar con el servidor.";
        });
}

function cambiarEstado(id, estado) {
    let token = null;
    try { token = localStorage.getItem("token"); } catch (e) {}
    const cuerpo = { estado: estado };
    if (estado === "rechazada") {
        const motivo = window.prompt("Motivo del rechazo (se mostrará al solicitante):", "");
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
            if (info) info.textContent = "No se pudo descargar el contrato.";
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
        if (etiqueta) etiqueta.textContent = "Inicia sesión para registrar evidencias.";
        return;
    }
    if (!id) {
        if (etiqueta) etiqueta.textContent = "Indica el número de tu solicitud.";
        return;
    }
    if (!descripcion && !archivo) {
        if (etiqueta) etiqueta.textContent = "Describe un avance o adjunta una foto.";
        return;
    }

    leerArchivoComoDataUrl(archivo, 300 * 1024, function (url) {
        if (url === "excede") {
            if (etiqueta) etiqueta.textContent = "La foto supera 300 KB; prueba con una más pequeña.";
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
                    if (etiqueta) etiqueta.textContent = "Evidencia registrada (día " + (datos.dia || "?") + ").";
                    cargarEvidencias(id);
                } else if (datos && datos.error) {
                    if (etiqueta) etiqueta.textContent = datos.error;
                } else {
                    if (etiqueta) etiqueta.textContent = "No se pudo registrar la evidencia.";
                }
            })
            .catch(function () {
                if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
            });
    });
}

function tarjetaEvidencia(e) {
    const foto = e.url
        ? '<div class="evidencia-foto"><img src="' + e.url + '" alt="Evidencia del seguimiento"></div>'
        : "";
    return '<div class="evidencia">' +
        '<strong>Día ' + (e.dia || "?") + '</strong> · ' +
        new Date(e.creado_en || Date.now()).toLocaleDateString() +
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
                : "<p>Sin evidencias registradas todavía.</p>";
        })
        .catch(function () {});
}

function tarjetaAlerta(a) {
    const estado = a.estado_alerta || "al_dia";
    const etiquetas = {
        al_dia: "Al día",
        vencida: "Vencida",
        vencida_final: "Vencida final",
        completada: "Completada"
    };
    const textoHito = a.proximo_hito
        ? " · Próximo hito: día " + a.proximo_hito + " (en " + a.dias_para_hito + " día(s))"
        : "";
    return '<div class="alerta">' +
        '<strong>' + (a.mascota || ("#" + a.solicitud_id)) + '</strong> · ' + (a.adoptante || "sin datos") +
        '<br>Día ' + a.dias_acumulados + ' de seguimiento · ' + a.cantidad_evidencias + ' evidencia(s)' +
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
        if (info) info.textContent = "Inicia sesión como administrador.";
        return;
    }
    fetch(API_BASE + "/seguimiento/alertas", { headers: { "Authorization": "Bearer " + token } })
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (info) info.textContent = "No autorizado.";
                return;
            }
            if (info) info.textContent = datos.length + " adopción(es) en seguimiento.";
            if (lista) lista.innerHTML = datos.length
                ? datos.map(tarjetaAlerta).join("")
                : "<p>No hay adopciones aprobadas en seguimiento.</p>";
        })
        .catch(function () {
            if (info) info.textContent = "No se pudo conectar con el servidor.";
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
        if (etiqueta) etiqueta.textContent = "Inicia sesión como administrador.";
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
        if (etiqueta) etiqueta.textContent = "Completa nombre y edad.";
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
                ? "Mascota N.º " + id + " actualizada."
                : "Mascota registrada (N.º " + (datos && datos.id ? datos.id : "?") + ").";
            limpiarFormularioMascota();
            cargarMascotasAdmin();
            cargarMascotas();
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
        });
}

function editarMascota(id) {
    const etiqueta = document.getElementById("gestion-estado");
    fetch(API_BASE + "/mascotas/" + id)
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (m) {
            if (!m || m.error) {
                if (etiqueta) etiqueta.textContent = "No se encontró la mascota.";
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
            if (etiqueta) etiqueta.textContent = "Editando la mascota N.º " + m.id + ". Guarda para aplicar los cambios.";
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
        });
}

function eliminarMascota(id) {
    const token = tokenAdmin();
    const etiqueta = document.getElementById("gestion-estado");
    if (!token) {
        if (etiqueta) etiqueta.textContent = "Inicia sesión como administrador.";
        return;
    }
    if (!window.confirm("¿Eliminar la mascota N.º " + id + "? Esta acción no se puede deshacer.")) return;
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
            if (etiqueta) etiqueta.textContent = "Mascota eliminada.";
            cargarMascotasAdmin();
            cargarMascotas();
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
        });
}

function tarjetaMascotaAdmin(m) {
    const ficha = [
        m.salud ? "Salud: " + m.salud : "",
        m.vacunas ? "Vacunas: " + m.vacunas : "",
        "Esterilizado: " + (m.esterilizado ? "sí" : "no")
    ].filter(Boolean).join(" · ");
    return '<div class="solicitud mascota-admin">' +
        '<strong>' + (m.emoji || "🐾") + ' ' + m.nombre + '</strong> · ' + m.especie + ' · ' + m.edad +
        ' <span class="estado">' + m.estado + '</span>' +
        (m.descripcion ? '<br>' + m.descripcion : '') +
        (ficha ? '<br><small>' + ficha + '</small>' : '') +
        '<div class="acciones">' +
            '<button onclick="editarMascota(' + m.id + ')">Editar</button>' +
            '<button onclick="eliminarMascota(' + m.id + ')">Eliminar</button>' +
        '</div>' +
        '</div>';
}

function cargarMascotasAdmin() {
    const lista = document.getElementById("lista-mascotas-admin");
    const etiqueta = document.getElementById("gestion-estado");
    if (!tokenAdmin()) {
        if (etiqueta) etiqueta.textContent = "Inicia sesión como administrador.";
        return;
    }
    fetch(API_BASE + "/mascotas")
        .then(function (respuesta) { return respuesta.json(); })
        .then(function (datos) {
            if (!Array.isArray(datos)) {
                if (etiqueta) etiqueta.textContent = "No se pudo cargar el catálogo.";
                return;
            }
            if (etiqueta) etiqueta.textContent = datos.length + " mascota(s) registradas.";
            if (lista) lista.innerHTML = datos.map(tarjetaMascotaAdmin).join("");
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
        });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarMascotas);
} else {
    cargarMascotas();
}
