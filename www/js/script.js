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
                ? "Postulación enviada. Estado: " + datos.estado
                : "No se pudo enviar la postulación.";
        })
        .catch(function () {
            if (etiqueta) etiqueta.textContent = "No se pudo conectar con el servidor.";
        });
}

function tarjetaSolicitud(s) {
    let botones = "";
    if (s.estado === "en_revision") {
        botones = '<button onclick="cambiarEstado(' + s.id + ',\'aprobada\')">Aprobar</button>' +
                  '<button onclick="cambiarEstado(' + s.id + ',\'rechazada\')">Rechazar</button>';
    } else if (s.estado === "aprobada") {
        botones = '<button onclick="descargarContrato(' + s.id + ')">Descargar contrato</button>';
    }
    return '<div class="solicitud">' +
        '<strong>' + (s.mascota || ("#" + s.mascota_id)) + '</strong> · ' + s.estado +
        '<br>' + (s.solicitante_nombre || "Sin datos") +
        (s.solicitante_email ? ' (' + s.solicitante_email + ')' : '') +
        (s.motivacion ? '<br>' + s.motivacion : '') +
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
    fetch(API_BASE + "/solicitudes/" + id + "/estado", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ estado: estado })
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarMascotas);
} else {
    cargarMascotas();
}
