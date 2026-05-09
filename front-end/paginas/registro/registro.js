/* ------------------- CONSTANTES ------------------- */

const FORMULARIO         = document.getElementById("formularioRegistro");
const INPUT_PASS         = document.getElementById("registroPassword");
const INPUT_PASS2        = document.getElementById("registroPassword2");
const BOTON_OJO1         = document.getElementById("botonOjo1");
const BOTON_OJO2         = document.getElementById("botonOjo2");
const ERROR_GLOBAL       = document.getElementById("errorGlobal");
const ERROR_GLOBAL_TEXTO = document.getElementById("errorGlobalTexto");

const API_REGISTRO = "http://127.0.0.1:8000/api/usuarios/registro/";

/* ------------------- OJO CONTRASEÑA ------------------- */

function togglePassword(inputEl, botonEl) {
    const estaOculta = inputEl.type === "password";

    inputEl.type = estaOculta ? "text" : "password";
    botonEl.setAttribute("aria-pressed", estaOculta ? "true" : "false");
    botonEl.setAttribute("aria-label", estaOculta ? "Ocultar contraseña" : "Mostrar contraseña");

    botonEl.querySelector(".ojo-icono--cerrado").classList.toggle("oculto", estaOculta);
    botonEl.querySelector(".ojo-icono--abierto").classList.toggle("oculto", !estaOculta);
}

/* ------------------- MOSTRAR ERROR ------------------- */

function mostrarError(mensaje) {
    ERROR_GLOBAL_TEXTO.textContent = mensaje;
    ERROR_GLOBAL.classList.remove("oculto");
}

function ocultarError() {
    ERROR_GLOBAL.classList.add("oculto");
}

/* ------------------- VALIDACIÓN CLIENTE ------------------- */

function validarFormulario(datos) {
    if (!datos.username || !datos.email || !datos.password || !datos.password2) {
        return "Por favor, rellena todos los campos obligatorios.";
    }
    if (datos.password.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (datos.password !== datos.password2) {
        return "Las contraseñas no coinciden.";
    }
    return null;
}

/* ------------------- REGISTRO ------------------- */

async function registrarUsuario(datos) {
    const res = await fetch(API_REGISTRO, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(datos)
    });

    if (res.status === 201) {
        window.location.href = "../login/login.html?registro=ok";
        return;
    }

    const json = await res.json();

    // El servidor devuelve un objeto con campos como clave → extraemos el primer error
    const primerCampo = Object.keys(json)[0];
    const mensaje     = Array.isArray(json[primerCampo])
        ? json[primerCampo][0]
        : json[primerCampo];

    throw new Error(mensaje || "Error al crear la cuenta.");
}

/* ------------------- SUBMIT ------------------- */

async function manejarSubmit(evento) {
    evento.preventDefault();
    ocultarError();

    const datos = {
        first_name: document.getElementById("registroNombre").value.trim(),
        last_name:  document.getElementById("registroApellido").value.trim(),
        username:   document.getElementById("registroUsername").value.trim(),
        email:      document.getElementById("registroEmail").value.trim(),
        password:   INPUT_PASS.value,
        password2:  INPUT_PASS2.value,
    };

    const errorCliente = validarFormulario(datos);
    if (errorCliente) {
        mostrarError(errorCliente);
        return;
    }

    const boton = document.getElementById("botonRegistro");
    boton.disabled    = true;
    boton.textContent = "Creando cuenta...";

    try {
        await registrarUsuario(datos);
    } catch (error) {
        mostrarError(error.message || "Algo salió mal. Inténtalo de nuevo.");
    } finally {
        boton.disabled    = false;
        boton.textContent = "Crear cuenta";
    }
}

/* ------------------- EVENTOS ------------------- */

BOTON_OJO1.addEventListener("click", () => togglePassword(INPUT_PASS,  BOTON_OJO1));
BOTON_OJO2.addEventListener("click", () => togglePassword(INPUT_PASS2, BOTON_OJO2));
FORMULARIO.addEventListener("submit", manejarSubmit);


/* ------------------- BANNER REGISTRO EXITOSO ------------------- */

function mostrarBannerRegistro() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") !== "ok") return;

    document.getElementById("bannerExito").classList.remove("oculto");
}

mostrarBannerRegistro();

/* ------------------- REDIRECCIÓN SI YA ESTÁ LOGUEADO ------------------- */

function redirigirSiLogueado() {
    const token = localStorage.getItem("access_token")
                ?? sessionStorage.getItem("access_token");

    if (token) {
        window.location.href = "/front-end/paginas/novedades/novedades.html";
    }
}

redirigirSiLogueado();