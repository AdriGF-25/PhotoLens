/* ------------------- CONSTANTES ------------------- */

const API_CAMBIAR_PASSWORD = 'http://127.0.0.1:8000/api/usuarios/cambiar-password/';

const MODOS = {
    LOGUEADO:     'logueado',
    NO_LOGUEADO:  'no-logueado',
};


/* ------------------- UTILIDADES ------------------- */

function obtenerToken() {
    return localStorage.getItem('access_token')
        ?? sessionStorage.getItem('access_token');
}

function limpiarErrores() {
    document.querySelectorAll('.campo__error').forEach(function(span) {
        span.textContent = '';
    });
    document.querySelectorAll('.campo__input').forEach(function(input) {
        input.classList.remove('campo__input--error');
    });
    ocultarFeedback();
}

function mostrarErrorCampo(idError, idInput, mensaje) {
    const span = document.getElementById(idError);
    const input = document.getElementById(idInput);
    if (span)  span.textContent = mensaje;
    if (input) input.classList.add('campo__input--error');
}

function mostrarFeedback(mensaje, tipo) {
    const feedback = document.getElementById('rcFeedback');
    const texto    = document.getElementById('rcFeedbackTexto');
    if (!feedback || !texto) return;
    texto.textContent = mensaje;
    feedback.className = `rc-feedback rc-feedback--${tipo}`;
    feedback.classList.remove('oculto');
}

function ocultarFeedback() {
    const feedback = document.getElementById('rcFeedback');
    if (!feedback) return;
    feedback.classList.add('oculto');
    feedback.className = 'rc-feedback oculto';
}

function togglePassword(inputId, botonId) {
    const input    = document.getElementById(inputId);
    const boton    = document.getElementById(botonId);
    if (!input || !boton) return;

    const estaOculta = input.type === 'password';
    input.type = estaOculta ? 'text' : 'password';
    boton.setAttribute('aria-pressed', estaOculta ? 'true' : 'false');

    const iconoCerrado = boton.querySelector('.ojo-icono--cerrado');
    const iconoAbierto = boton.querySelector('.ojo-icono--abierto');
    if (iconoCerrado) iconoCerrado.classList.toggle('oculto', estaOculta);
    if (iconoAbierto) iconoAbierto.classList.toggle('oculto', !estaOculta);
}


/* ------------------- MODO DE LA PÁGINA ------------------- */

function detectarModo() {
    const params = new URLSearchParams(window.location.search);
    const modo   = params.get('modo');
    return modo === MODOS.LOGUEADO ? MODOS.LOGUEADO : MODOS.NO_LOGUEADO;
}

function configurarModo(modo) {
    const campoEmail = document.getElementById('campoEmail');
    const subtitulo  = document.getElementById('rcSubtitulo');
    const volver     = document.getElementById('enlaceVolver');

    if (modo === MODOS.LOGUEADO) {
        // Logueado: ocultamos email, el token identifica al usuario
        if (campoEmail) campoEmail.classList.add('oculto');
        if (subtitulo)  subtitulo.textContent = 'Introduce tu contraseña actual y elige una nueva.';
        if (volver)     volver.href = '/front-end/paginas/perfil/perfil.html';
    } else {
        // No logueado: mostramos email
        if (campoEmail) campoEmail.classList.remove('oculto');
        if (subtitulo)  subtitulo.textContent = 'Introduce tu email, la contraseña actual y la nueva.';
        if (volver)     volver.href = '/front-end/paginas/login/login.html';
    }
}


/* ------------------- RELLENAR EMAIL DESDE PARAMS ------------------- */

function rellenarEmailDesdeParams() {
    // El perfil puede pasar el email por URL para no pedírselo de nuevo
    const params = new URLSearchParams(window.location.search);
    const email  = params.get('email');
    const input  = document.getElementById('rcEmail');
    if (email && input) {
        input.value = decodeURIComponent(email);
    }
}


/* ------------------- VALIDACIÓN ------------------- */

function validarFormulario(modo) {
    limpiarErrores();
    let esValido = true;

    const email            = document.getElementById('rcEmail')?.value.trim();
    const passwordActual   = document.getElementById('rcPasswordActual')?.value;
    const nuevaPassword    = document.getElementById('rcNuevaPassword')?.value;
    const confirmarPassword = document.getElementById('rcConfirmarPassword')?.value;

    if (modo === MODOS.NO_LOGUEADO) {
        if (!email || !email.includes('@')) {
            mostrarErrorCampo('errorEmail', 'rcEmail', 'Introduce un email válido.');
            esValido = false;
        }
    }

    if (!passwordActual) {
        mostrarErrorCampo('errorPasswordActual', 'rcPasswordActual', 'Introduce tu contraseña actual.');
        esValido = false;
    }

    if (!nuevaPassword || nuevaPassword.length < 6) {
        mostrarErrorCampo('errorNuevaPassword', 'rcNuevaPassword', 'La nueva contraseña debe tener al menos 6 caracteres.');
        esValido = false;
    }

    if (!confirmarPassword) {
        mostrarErrorCampo('errorConfirmarPassword', 'rcConfirmarPassword', 'Confirma la nueva contraseña.');
        esValido = false;
    } else if (nuevaPassword !== confirmarPassword) {
        mostrarErrorCampo('errorConfirmarPassword', 'rcConfirmarPassword', 'Las contraseñas no coinciden.');
        esValido = false;
    }

    return esValido;
}


/* ------------------- SUBMIT ------------------- */

async function manejarSubmit(evento) {
    evento.preventDefault();

    const modo = detectarModo();
    if (!validarFormulario(modo)) return;

    const boton = document.getElementById('botonCambiar');
    if (boton) {
        boton.disabled    = true;
        boton.textContent = 'Guardando...';
    }

    const cuerpo = {
        password_actual: document.getElementById('rcPasswordActual').value,
        nueva_password:  document.getElementById('rcNuevaPassword').value,
        nueva_password2: document.getElementById('rcConfirmarPassword').value,
    };

    // Solo añadimos email en modo no logueado
    if (modo === MODOS.NO_LOGUEADO) {
        cuerpo.email = document.getElementById('rcEmail').value.trim();
    }

    const cabeceras = { 'Content-Type': 'application/json' };

    // En modo logueado mandamos el token para que el backend identifique al usuario
    const token = obtenerToken();
    if (modo === MODOS.LOGUEADO && token) {
        cabeceras['Authorization'] = `Bearer ${token}`;
    }

    try {
        const respuesta = await fetch(API_CAMBIAR_PASSWORD, {
            method:  'POST',
            headers: cabeceras,
            body:    JSON.stringify(cuerpo),
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            // Mostrar errores inline por campo si los devuelve el backend
            let mensajeGlobal = '';

            if (datos.email)            mostrarErrorCampo('errorEmail',            'rcEmail',            Array.isArray(datos.email)            ? datos.email[0]            : datos.email);
            if (datos.password_actual)  mostrarErrorCampo('errorPasswordActual',   'rcPasswordActual',   Array.isArray(datos.password_actual)   ? datos.password_actual[0]   : datos.password_actual);
            if (datos.nueva_password)   mostrarErrorCampo('errorNuevaPassword',    'rcNuevaPassword',    Array.isArray(datos.nueva_password)    ? datos.nueva_password[0]    : datos.nueva_password);
            if (datos.nueva_password2)  mostrarErrorCampo('errorConfirmarPassword','rcConfirmarPassword', Array.isArray(datos.nueva_password2)   ? datos.nueva_password2[0]   : datos.nueva_password2);
            if (datos.non_field_errors) mensajeGlobal = Array.isArray(datos.non_field_errors) ? datos.non_field_errors[0] : datos.non_field_errors;
            if (datos.detail)           mensajeGlobal = datos.detail;

            if (mensajeGlobal) mostrarFeedback(mensajeGlobal, 'error');
            return;
        }

        // Éxito
        mostrarFeedback('✓ Contraseña actualizada correctamente.', 'exito');

        // TODO: enviar correo de confirmación de cambio de contraseña

        setTimeout(function() {
            if (modo === MODOS.LOGUEADO) {
                window.location.href = '/front-end/paginas/perfil/perfil.html';
            } else {
                window.location.href = '/front-end/paginas/login/login.html';
            }
        }, 2000);

    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        mostrarFeedback('No se pudo conectar con el servidor.', 'error');

    } finally {
        if (boton) {
            boton.disabled    = false;
            boton.textContent = 'Cambiar contraseña';
        }
    }
}


/* ------------------- EVENTOS ------------------- */

document.getElementById('ojoPasActual')
    ?.addEventListener('click', function() { togglePassword('rcPasswordActual', 'ojoPasActual'); });

document.getElementById('ojoNueva')
    ?.addEventListener('click', function() { togglePassword('rcNuevaPassword', 'ojoNueva'); });

document.getElementById('ojoConfirmar')
    ?.addEventListener('click', function() { togglePassword('rcConfirmarPassword', 'ojoConfirmar'); });

document.getElementById('formularioRecuperar')
    ?.addEventListener('submit', manejarSubmit);


/* ------------------- INICIO ------------------- */

document.addEventListener('DOMContentLoaded', function() {
    const modo = detectarModo();
    configurarModo(modo);
    rellenarEmailDesdeParams();
});