/* ------------------- CONSTANTES ------------------- */

const FORMULARIO         = document.getElementById("formularioLogin");
const INPUT_PASS         = document.getElementById("loginPassword");
const BOTON_OJO          = document.getElementById("botonOjo");
const BOTON_GOOGLE       = document.getElementById("botonGoogle");
const ERROR_GLOBAL       = document.getElementById("errorGlobal");
const ERROR_GLOBAL_TEXTO = document.getElementById("errorGlobalTexto");

/* ------------------- OJO CONTRASEÑA ------------------- */

function togglePassword() {
    const estaOculta = INPUT_PASS.type === "password";

    INPUT_PASS.type = estaOculta ? "text" : "password";
    BOTON_OJO.setAttribute("aria-pressed", estaOculta ? "true" : "false");
    BOTON_OJO.setAttribute("aria-label", estaOculta ? "Ocultar contraseña" : "Mostrar contraseña");

    document.querySelector(".ojo-icono--cerrado").classList.toggle("oculto", estaOculta);
    document.querySelector(".ojo-icono--abierto").classList.toggle("oculto", !estaOculta);
}

/* ------------------- SESIÓN (STUBS) ------------------- */

/**
 * STUB FASE 4 — localStorage / sessionStorage según "Recuérdame"
 * recordar=true  → localStorage  (persiste al cerrar navegador)
 * recordar=false → sessionStorage (se borra al cerrar pestaña)
 */
function guardarSesion(accessToken, refreshToken, recordar) {
    // TODO Fase 4:
    // const storage = recordar ? localStorage : sessionStorage;
    // storage.setItem("access_token", accessToken);
    // storage.setItem("refresh_token", refreshToken);
}

/**
 * STUB FASE 5 — Llamada a POST /api/token/ con JWT
 */
async function iniciarSesion(email, password, recordar) {
    // TODO Fase 5:
    // const res = await fetch("/api/token/", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ username: email, password })
    // });
    // const datos = await res.json();
    // if (!res.ok) throw new Error(datos.detail || "Credenciales incorrectas.");
    // guardarSesion(datos.access, datos.refresh, recordar);
    // window.location.href = "/front-end/paginas/novedades/novedades.html";
}

/**
 * Disponible globalmente para cerrar sesión desde cualquier página
 */
function cerrarSesion() {
    // TODO Fase 5:
    // localStorage.removeItem("access_token");
    // localStorage.removeItem("refresh_token");
    // sessionStorage.removeItem("access_token");
    // sessionStorage.removeItem("refresh_token");
    // window.location.href = "/front-end/paginas/novedades/novedades.html";
}

/* ------------------- SUBMIT ------------------- */

async function manejarSubmit(evento) {
    evento.preventDefault();

    const email    = document.getElementById("loginEmail").value.trim();
    const pass     = INPUT_PASS.value;
    const recordar = document.getElementById("loginRecordar").checked;
    const boton    = document.getElementById("botonLogin");

    ERROR_GLOBAL.classList.add("oculto");

    // Validación mínima — errores detallados por campo: TODO al finalizar el proyecto
    if (!email || !pass) {
        ERROR_GLOBAL_TEXTO.textContent = "Por favor, rellena todos los campos.";
        ERROR_GLOBAL.classList.remove("oculto");
        return;
    }

    boton.disabled    = true;
    boton.textContent = "Entrando...";

    try {
        await iniciarSesion(email, pass, recordar);
    } catch (error) {
        ERROR_GLOBAL_TEXTO.textContent = error.message || "Algo salió mal. Inténtalo de nuevo.";
        ERROR_GLOBAL.classList.remove("oculto");
    } finally {
        boton.disabled    = false;
        boton.textContent = "Iniciar sesión";
    }
}

/* ------------------- GOOGLE OAUTH (STUB FASE 3) ------------------- */

/**
 * STUB FASE 3 — Client ID ya configurado en Google Cloud Console
 * Pasos pendientes:
 * 1. Añadir <script src="https://accounts.google.com/gsi/client"> al head
 * 2. Llamar a google.accounts.id.initialize({ client_id: "TU_ID", callback: onGoogleLogin })
 * 3. Llamar a google.accounts.id.prompt()
 */
function manejarGoogle() {
    // TODO Fase 3
    alert("Inicio con Google disponible muy pronto.");
}

function onGoogleLogin(response) {
    // TODO Fase 3: enviar response.credential al backend para verificar
}

/* ------------------- EVENTOS ------------------- */

BOTON_OJO.addEventListener("click", togglePassword);
FORMULARIO.addEventListener("submit", manejarSubmit);
BOTON_GOOGLE.addEventListener("click", manejarGoogle);