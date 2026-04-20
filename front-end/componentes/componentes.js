/* ------------------- CARGA DE COMPONENTES ---------------- */

function cargarHojaEstilos(rutaArchivo) {
    const enlaceExistente = document.querySelector('link[href="' + rutaArchivo + '"]');

    if (enlaceExistente) {
        return;
    }

    const enlaceCss = document.createElement("link");
    enlaceCss.rel = "stylesheet";
    enlaceCss.href = rutaArchivo;
    document.head.appendChild(enlaceCss);
}

async function cargarComponente(rutaArchivo, idContenedor) {
    const contenedor = document.getElementById(idContenedor);

    if (!contenedor) {
        return;
    }

    try {
        const respuesta = await fetch(rutaArchivo);
        const contenidoHtml = await respuesta.text();
        contenedor.innerHTML = contenidoHtml;
    } catch (error) {
        console.error("Error al cargar el componente:", rutaArchivo, error);
    }
}

async function iniciarComponentes() {
    cargarHojaEstilos("../../componentes/temas.css");
    cargarHojaEstilos("../../componentes/header/header.css");
    cargarHojaEstilos("../../componentes/footer/footer.css");

    await cargarComponente("../../componentes/header/header.html", "contenedor-header");
    await cargarComponente("../../componentes/footer/footer.html", "contenedor-footer");

    if (document.getElementById("botonMenu")) {
        const scriptCabecera = document.createElement("script");
        scriptCabecera.src = "../../componentes/header/header.js";
        document.body.appendChild(scriptCabecera);
    }
}

document.addEventListener("DOMContentLoaded", iniciarComponentes);