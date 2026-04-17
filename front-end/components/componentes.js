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
    cargarHojaEstilos("../../components/temas.css");
    cargarHojaEstilos("../../components/header/header.css");
    cargarHojaEstilos("../../components/footer/footer.css");

    await cargarComponente("../../components/header/header.html", "contenedor-header");
    await cargarComponente("../../components/footer/footer.html", "contenedor-footer");

    if (document.getElementById("botonMenu")) {
        const scriptCabecera = document.createElement("script");
        scriptCabecera.src = "../../components/header/header.js";
        document.body.appendChild(scriptCabecera);
    }
}

document.addEventListener("DOMContentLoaded", iniciarComponentes);