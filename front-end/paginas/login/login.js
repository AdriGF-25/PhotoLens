/* ------------------- CONSTANTES ------------------- */

const FORMULARIO         = document.getElementById("formularioLogin");
const INPUT_PASS         = document.getElementById("loginPassword");
const BOTON_OJO          = document.getElementById("botonOjo");
const ERROR_GLOBAL       = document.getElementById("errorGlobal");
const ERROR_GLOBAL_TEXTO = document.getElementById("errorGlobalTexto");

/* ------------------- REDIRECCIÓN SI YA ESTÁ LOGUEADO ------------------- */

function redirigirSiLogueado() {
    const token = localStorage.getItem("access_token")
                ?? sessionStorage.getItem("access_token");

    if (token) {
        window.location.href = "../novedades/novedades.html";
    }
}

// Se ejecuta PRIMERO — si hay token, no se monta nada más
redirigirSiLogueado();

/* ------------------- OJO CONTRASEÑA ------------------- */

function togglePassword() {
    const estaOculta = INPUT_PASS.type === "password";

    INPUT_PASS.type = estaOculta ? "text" : "password";
    BOTON_OJO.setAttribute("aria-pressed", estaOculta ? "true" : "false");
    BOTON_OJO.setAttribute("aria-label", estaOculta ? "Ocultar contraseña" : "Mostrar contraseña");

    document.querySelector(".ojo-icono--cerrado").classList.toggle("oculto", estaOculta);
    document.querySelector(".ojo-icono--abierto").classList.toggle("oculto", !estaOculta);
}

/* ------------------- SESIÓN ------------------- */

function guardarSesion(accessToken, refreshToken, recordar) {
    const storage = recordar ? localStorage : sessionStorage;
    storage.setItem("access_token",  accessToken);
    storage.setItem("refresh_token", refreshToken);
}

function cerrarSesion() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
}

/* ------------------- LOGIN ------------------- */

async function iniciarSesion(username, password, recordar) {
    const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username, password })
    });

    const datos = await res.json();

    if (!res.ok) {
        throw new Error(datos.detail || "Credenciales incorrectas.");
    }

    guardarSesion(datos.access, datos.refresh, recordar);
    window.location.href = "../novedades/novedades.html";
}

/* ------------------- SUBMIT ------------------- */

async function manejarSubmit(evento) {
    evento.preventDefault();

    const username = document.getElementById("loginEmail").value.trim();
    const pass     = INPUT_PASS.value;
    const recordar = document.getElementById("loginRecordar").checked;
    const boton    = document.getElementById("botonLogin");

    ERROR_GLOBAL.classList.add("oculto");

    if (!username || !pass) {
        ERROR_GLOBAL_TEXTO.textContent = "Por favor, rellena todos los campos.";
        ERROR_GLOBAL.classList.remove("oculto");
        return;
    }

    boton.disabled    = true;
    boton.textContent = "Entrando...";

    try {
        await iniciarSesion(username, pass, recordar);
    } catch (error) {
        ERROR_GLOBAL_TEXTO.textContent = error.message || "Algo salió mal. Inténtalo de nuevo.";
        ERROR_GLOBAL.classList.remove("oculto");
    } finally {
        boton.disabled    = false;
        boton.textContent = "Iniciar sesión";
    }
}

/* ------------------- EVENTOS ------------------- */

BOTON_OJO.addEventListener("click", togglePassword);
FORMULARIO.addEventListener("submit", manejarSubmit);

/* ------------------- BANNER REGISTRO EXITOSO ------------------- */

function mostrarBannerRegistro() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registro") !== "ok") return;

    const banner = document.getElementById("bannerExito");
    if (banner) banner.classList.remove("oculto");
}

mostrarBannerRegistro();