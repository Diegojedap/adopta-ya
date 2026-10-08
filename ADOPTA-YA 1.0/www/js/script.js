function mostrarMascotas() {
    const mascotas = document.getElementById("mascotas");

    mascotas.scrollIntoView({
        behavior: "smooth"
    });
}

function adoptar(nombre) {
    alert(
        "¡Gracias por querer adoptar a " + nombre +
        "! 🐾\n\nMuy pronto podrás continuar con el proceso de adopción."
    );
}