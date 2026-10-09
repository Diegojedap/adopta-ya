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
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cargarMascotas);
} else {
    cargarMascotas();
}
