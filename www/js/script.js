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
    const botones = s.estado === "en_revision"
        ? '<button onclick="cambiarEstado(' + s.id + ',\'aprobada\')">Aprobar</button>' +
          '<button onclick="cambiarEstado(' + s.id + ',\'rechazada\')">Rechazar</button>'
        : '';
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarMascotas);
} else {
    cargarMascotas();
}
