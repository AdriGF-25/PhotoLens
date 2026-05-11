// ------------------- CONSTANTES ------------------- //

const API_BASE         = 'http://127.0.0.1:8000/api/usuarios/';
const API_PERFIL       = `${API_BASE}perfil/`;
const API_EDITAR       = `${API_BASE}perfil/editar/`;
const API_MANGA        = 'http://127.0.0.1:8000/api/anime/mangas/';

const IMAGEN_PLACEHOLDER = 'https://picsum.photos/seed/manga-cover/300/450';
const AVATAR_PLACEHOLDER = 'https://picsum.photos/seed/perfil-user/120/120';

const MAX_RECOMENDADOS = 5;


// ------------------- UTILIDADES ------------------- //

function obtenerToken() {
    return localStorage.getItem('access_token');
}

function redirigirLogin() {
    window.location.href = '/front-end/paginas/login/login.html';
}

function calcularDiasActivo(fechaISO) {
    if (!fechaISO) return 0;
    const inicio = new Date(fechaISO);
    const ahora  = new Date();
    const diff   = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
}

function limpiarErrores() {
    document.querySelectorAll('.campo__error').forEach(function(span) {
        span.textContent = '';
    });
    document.querySelectorAll('.campo__input').forEach(function(input) {
        input.classList.remove('campo__input--error');
    });
}

function mostrarErrorCampo(idError, idInput, mensaje) {
    const spanError = document.getElementById(idError);
    const input     = document.getElementById(idInput);
    if (spanError) spanError.textContent = mensaje;
    if (input)     input.classList.add('campo__input--error');
}

function mostrarFeedbackModal(mensaje, tipo) {
    const feedback = document.getElementById('modalFeedback');
    if (!feedback) return;
    feedback.textContent = mensaje;
    feedback.className   = `modal__feedback modal__feedback--${tipo}`;
    feedback.classList.remove('oculto');
}

function ocultarFeedbackModal() {
    const feedback = document.getElementById('modalFeedback');
    if (!feedback) return;
    feedback.classList.add('oculto');
    feedback.className = 'modal__feedback oculto';
}


// ------------------- RENDER PERFIL ------------------- //

function renderizarPerfil(datos) {
    const nombre = document.getElementById('perfilNombre');
    const email  = document.getElementById('perfilEmail');
    const avatar = document.getElementById('avatarImagen');

    if (nombre) nombre.textContent = datos.username || 'Usuario';
    if (email)  email.textContent  = datos.email    || '';
    if (avatar) {
        avatar.src = datos.avatar || AVATAR_PLACEHOLDER;
        avatar.onerror = function() {
            this.onerror = null;
            this.src = AVATAR_PLACEHOLDER;
        };
    }

    const statCapitulos = document.getElementById('statCapitulos');
    const statMangas    = document.getElementById('statMangas');
    const statDias      = document.getElementById('statDias');

    if (statCapitulos) statCapitulos.textContent = datos.capitulos_leidos ?? 0;
    if (statMangas)    statMangas.textContent    = datos.mangas_leidos    ?? 0;
    if (statDias)      statDias.textContent      = calcularDiasActivo(datos.date_joined);

    // Precargamos el formulario
    const inputNombre  = document.getElementById('inputNombre');
    const inputEmail   = document.getElementById('inputEmail');
    const avatarPreview = document.getElementById('avatarPreview');

    if (inputNombre)   inputNombre.value = datos.username || '';
    if (inputEmail)    inputEmail.value  = datos.email    || '';
    if (avatarPreview) {
        avatarPreview.src = datos.avatar || AVATAR_PLACEHOLDER;
        avatarPreview.onerror = function() {
            this.onerror = null;
            this.src = AVATAR_PLACEHOLDER;
        };
    }
}


// ------------------- CARGAR PERFIL ------------------- //

async function cargarPerfil() {
    const token = obtenerToken();

    if (!token) {
        redirigirLogin();
        return;
    }

    try {
        const respuesta = await fetch(API_PERFIL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        if (respuesta.status === 401) {
            redirigirLogin();
            return;
        }

        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos = await respuesta.json();
        renderizarPerfil(datos);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
    }
}


// ------------------- RECIENTES (localStorage) ------------------- //

function obtenerRecientes() {
    try {
        const guardados = localStorage.getItem('anc_recientes');
        return guardados ? JSON.parse(guardados) : [];
    } catch {
        return [];
    }
}

function renderizarRecientes() {
    const recientes       = obtenerRecientes();
    const cuadricula      = document.getElementById('cuadriculaRecientes');
    const estadoVacio     = document.getElementById('estadoVacioRecientes');
    const conteo          = document.getElementById('conteoRecientes');

    if (!cuadricula) return;

    if (recientes.length === 0) {
        cuadricula.classList.add('oculto');
        if (estadoVacio) estadoVacio.classList.remove('oculto');
        if (conteo)      conteo.textContent = '0';
        return;
    }

    cuadricula.classList.remove('oculto');
    if (estadoVacio) estadoVacio.classList.add('oculto');
    if (conteo)      conteo.textContent = recientes.length;

    cuadricula.innerHTML = '';
    recientes.forEach(function(manga) {
        cuadricula.appendChild(crearTarjetaManga(manga, false));
    });
}


// ------------------- RECOMENDADOS ------------------- //

async function cargarRecomendados() {
    const cuadricula  = document.getElementById('cuadriculaRecomendados');
    const estadoVacio = document.getElementById('estadoVacioRecomendados');

    if (!cuadricula) return;

    // Obtenemos los títulos que ya ha leído para no repetirlos
    const recientes      = obtenerRecientes();
    const titulosLeidos  = recientes.map(function(m) {
        return m.titulo?.toLowerCase().trim();
    });

    try {
        const respuesta = await fetch(`${API_MANGA}?page=1`);

        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos   = await respuesta.json();
        const mangas  = datos.results || datos;

        // Filtramos los ya leídos y limitamos a MAX_RECOMENDADOS
        const candidatos = mangas.filter(function(m) {
            return !titulosLeidos.includes(m.titulo?.toLowerCase().trim());
        }).slice(0, MAX_RECOMENDADOS);

        if (candidatos.length === 0) {
            cuadricula.classList.add('oculto');
            if (estadoVacio) estadoVacio.classList.remove('oculto');
            return;
        }

        cuadricula.classList.remove('oculto');
        if (estadoVacio) estadoVacio.classList.add('oculto');

        cuadricula.innerHTML = '';
        candidatos.forEach(function(manga) {
            cuadricula.appendChild(crearTarjetaManga(manga, true));
        });

    } catch (error) {
        console.error('Error al cargar recomendados:', error);
        cuadricula.classList.add('oculto');
        if (estadoVacio) estadoVacio.classList.remove('oculto');
    }
}


// ------------------- TARJETA MANGA ------------------- //

function crearTarjetaManga(manga, esRecomendado) {
    const article = document.createElement('article');
    article.className = 'tarjeta-manga';

    const enlace  = manga.enlace || '#';
    const portada = manga.portada || manga.imagen || IMAGEN_PLACEHOLDER;
    const titulo  = manga.titulo  || manga.nombre || 'Sin título';
    const sub     = esRecomendado
        ? (manga.genero || manga.tipo || 'Manga')
        : (manga.ultimo_capitulo || 'Sin progreso');

    const badgeHtml = esRecomendado
        ? `<span class="tarjeta-manga__etiqueta-nueva">Nuevo</span>`
        : `<span class="tarjeta-manga__progreso-badge">${sub}</span>`;

    article.innerHTML = `
        <a href="${enlace}" class="tarjeta-manga__imagen-contenedor">
            <img
                class="tarjeta-manga__imagen"
                src="${portada}"
                alt="${titulo}"
                loading="lazy"
                onerror="this.onerror=null;this.src='${IMAGEN_PLACEHOLDER}'"
            >
            ${badgeHtml}
        </a>
        <div class="tarjeta-manga__cuerpo">
            <p class="tarjeta-manga__titulo">${titulo}</p>
            <p class="tarjeta-manga__ultimo">${sub}</p>
        </div>
    `;

    return article;
}


// ------------------- MODAL ------------------- //

function abrirModal() {
    const modal = document.getElementById('modalFondo');
    if (!modal) return;
    modal.classList.add('modal-fondo--visible');
    modal.setAttribute('aria-hidden', 'false');
    ocultarFeedbackModal();
    limpiarErrores();
}

function cerrarModal() {
    const modal = document.getElementById('modalFondo');
    if (!modal) return;
    modal.classList.remove('modal-fondo--visible');
    modal.setAttribute('aria-hidden', 'true');

    const inputPassword = document.getElementById('inputPasswordActual');
    if (inputPassword) inputPassword.value = '';
}


// ------------------- VALIDACIÓN ------------------- //

function validarFormulario() {
    limpiarErrores();
    let esValido = true;

    const nombre   = document.getElementById('inputNombre')?.value.trim();
    const password = document.getElementById('inputPasswordActual')?.value;
    const archivo  = document.getElementById('inputAvatar')?.files[0];

    if (!nombre || nombre.length < 3) {
        mostrarErrorCampo('errorNombre', 'inputNombre', 'El nombre debe tener al menos 3 caracteres.');
        esValido = false;
    }

    if (!password) {
        mostrarErrorCampo('errorPasswordActual', 'inputPasswordActual', 'Introduce tu contraseña actual para confirmar los cambios.');
        esValido = false;
    }

    if (archivo && archivo.size > 2 * 1024 * 1024) {
        mostrarErrorCampo('errorAvatar', 'inputAvatar', 'La imagen no puede superar los 2 MB.');
        esValido = false;
    }

    return esValido;
}


// ------------------- GUARDAR CAMBIOS ------------------- //

async function guardarCambios(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    const token = obtenerToken();
    if (!token) {
        redirigirLogin();
        return;
    }

    const btnGuardar = document.getElementById('btnGuardarCambios');
    if (btnGuardar) {
        btnGuardar.textContent = 'Guardando...';
        btnGuardar.disabled    = true;
    }

    const formData = new FormData();
    formData.append('username',        document.getElementById('inputNombre')?.value.trim());
    formData.append('password_actual', document.getElementById('inputPasswordActual')?.value);

    const archivo = document.getElementById('inputAvatar')?.files[0];
    if (archivo) formData.append('avatar', archivo);

    try {
        const respuesta = await fetch(API_EDITAR, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Sin Content-Type: el navegador lo añade automáticamente con el boundary
            },
            body: formData,
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            const mensajeError = datos.detail
                || datos.password_actual
                || datos.username
                || 'Error al guardar los cambios.';
            mostrarFeedbackModal(
                Array.isArray(mensajeError) ? mensajeError[0] : mensajeError,
                'error'
            );
            return;
        }

        renderizarPerfil(datos);
        mostrarFeedbackModal('✓ Cambios guardados correctamente.', 'exito');
        setTimeout(cerrarModal, 1500);

    } catch (error) {
        console.error('Error al guardar cambios:', error);
        mostrarFeedbackModal('No se pudo conectar con el servidor.', 'error');

    } finally {
        if (btnGuardar) {
            btnGuardar.textContent = 'Guardar cambios';
            btnGuardar.disabled    = false;
        }
    }
}


// ------------------- CERRAR SESIÓN ------------------- //

function cerrarSesion() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('anc_recientes');
    redirigirLogin();
}


// ------------------- PREVIEW AVATAR ------------------- //

document.getElementById('inputAvatar')
    ?.addEventListener('change', function() {
        const archivo = this.files[0];
        if (!archivo) return;

        if (archivo.size > 2 * 1024 * 1024) {
            mostrarErrorCampo('errorAvatar', 'inputAvatar', 'La imagen no puede superar los 2 MB.');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('avatarPreview');
            if (preview) {
                preview.src = e.target.result;
                preview.classList.add('campo-avatar__preview--actualizado');
            }
        };
        reader.readAsDataURL(archivo);
    });


// ------------------- EVENTOS ------------------- //

document.getElementById('btnEditarPerfil')
    ?.addEventListener('click', abrirModal);

document.getElementById('btnCerrarModal')
    ?.addEventListener('click', cerrarModal);

document.getElementById('btnCancelarModal')
    ?.addEventListener('click', cerrarModal);

document.getElementById('btnCerrarSesion')
    ?.addEventListener('click', cerrarSesion);

document.getElementById('formEditarPerfil')
    ?.addEventListener('submit', guardarCambios);

document.getElementById('btnRefrescarRecomendados')
    ?.addEventListener('click', cargarRecomendados);

document.getElementById('modalFondo')
    ?.addEventListener('click', function(e) {
        if (e.target === this) cerrarModal();
    });

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cerrarModal();
});


// ------------------- INICIO ------------------- //

document.addEventListener('DOMContentLoaded', function() {
    cargarPerfil();
    renderizarRecientes();
    cargarRecomendados();
});