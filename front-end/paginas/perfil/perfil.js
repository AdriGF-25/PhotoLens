// ------------------- CONSTANTES ------------------- //

const API_BASE         = 'http://127.0.0.1:8000/api/usuarios/';
const API_PERFIL       = `${API_BASE}perfil/`;
const API_EDITAR       = `${API_BASE}perfil/editar/`;
const API_MANGA        = 'http://127.0.0.1:8000/api/anime/mangas/';
// Constantes para la sección recientes (lógica de manga)
const API_MANGA_BASE       = 'http://localhost:8000/api/anime';
const PORTADA_PLACEHOLDER  = '../../assets/placeholders/placeholder-portada.jpg';
const STORAGE_PREFIX_MANGA = 'anc_progreso_';
const CLASE_MODAL_VISIBLE  = 'manga-modal--visible';
const SELECTOR_TARJETAS_REC = '.manga-tarjeta';

const IMAGEN_PLACEHOLDER = 'https://picsum.photos/seed/manga-cover/300/450';
const AVATAR_PLACEHOLDER = 'https://picsum.photos/seed/perfil-user/120/120';

const MAX_RECOMENDADOS = 5;


// ------------------- UTILIDADES ------------------- //

// ------------------- UTILIDADES ------------------- //


function obtenerToken() {
    return localStorage.getItem('access_token')
        ?? sessionStorage.getItem('access_token');
}


function obtenerRefreshToken() {
    return localStorage.getItem('refresh_token')
        ?? sessionStorage.getItem('refresh_token');
}


function guardarNuevoToken(accessToken) {
    if (localStorage.getItem('refresh_token')) {
        localStorage.setItem('access_token', accessToken);
    } else {
        sessionStorage.setItem('access_token', accessToken);
    }
}


async function renovarToken() {
    const refresh = obtenerRefreshToken();
    if (!refresh) return null;

    try {
        const respuesta = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ refresh })
        });

        if (!respuesta.ok) return null;

        const datos = await respuesta.json();
        guardarNuevoToken(datos.access);
        return datos.access;

    } catch {
        return null;
    }
}


async function obtenerTokenValido() {
    const token = obtenerToken();
    if (!token) return null;

    // Comprobamos si el token ha caducado leyendo el payload JWT
    try {
        const payload   = JSON.parse(atob(token.split('.')[1]));
        const caducado  = payload.exp * 1000 < Date.now();

        if (!caducado) return token;

        // Caducado → intentamos renovar
        return await renovarToken();

    } catch {
        return await renovarToken();
    }
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
        // ✅ avatar ya viene en la raíz gracias al SerializerMethodField
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
    const inputNombre   = document.getElementById('inputNombre');
    const inputEmail    = document.getElementById('inputEmail');
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
    const token = await obtenerTokenValido();

    if (!token) {
        redirigirLogin();
        return;
    }

    try {
        const respuesta = await fetch(API_PERFIL, {
            headers: { 'Authorization': `Bearer ${token}` }
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


// ------------------- RECIENTES (API) ------------------- //


// — Utilidades de manga (replicadas de manga.js para uso local) —

function rec_obtenerTitulo(manga) {
    return manga.titulo ?? manga.nombre ?? manga.title ?? 'Sin título';
}

function rec_normalizarCategoria(valor) {
    return (valor ?? '').toString().trim().toLowerCase()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function rec_obtenerCategoria(manga) {
    if (manga.categoria && manga.categoria !== 'sin-categoria') {
        return manga.categoria;
    }
    const genero = manga.generos && manga.generos.length > 0 ? manga.generos[0] : null;
    return rec_normalizarCategoria(genero?.slug ?? genero?.nombre ?? 'sin-categoria');
}

function rec_obtenerPortada(manga) {
    const portada = manga.portada ?? manga.portada_url ?? null;
    if (!portada) return PORTADA_PLACEHOLDER;
    if (typeof portada !== 'string') return PORTADA_PLACEHOLDER;
    if (portada.startsWith('http://') || portada.startsWith('https://')) return portada;
    if (portada.startsWith('/')) return `http://localhost:8000${portada}`;
    return portada;
}

function rec_obtenerIdManga(manga) {
    return manga.id ?? manga.pk;
}

function rec_leerProgreso(mangaId) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX_MANGA + mangaId);
        if (!raw) return { ultimoCapitulo: null, capitulosLeidos: [] };
        const data = JSON.parse(raw);
        return {
            ultimoCapitulo  : data.ultimoCapitulo  ?? null,
            capitulosLeidos : Array.isArray(data.capitulosLeidos) ? data.capitulosLeidos : [],
        };
    } catch {
        return { ultimoCapitulo: null, capitulosLeidos: [] };
    }
}

function rec_obtenerNumeroCapitulo(capitulo) {
    return parseFloat(capitulo.numero ?? capitulo.num ?? capitulo.capitulo);
}


// — Tarjeta —

function rec_crearTarjeta(manga) {
    const article     = document.createElement('article');
    article.className = 'manga-tarjeta';

    const idManga   = rec_obtenerIdManga(manga);
    const titulo    = rec_obtenerTitulo(manga);
    const categoria = rec_obtenerCategoria(manga);
    const totalCaps = manga.total_capitulos ?? 0;
    const portada   = rec_obtenerPortada(manga);

    article.dataset.id        = idManga;
    article.dataset.categoria = categoria;
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Ver detalles de ${titulo}`);

    article.innerHTML = `
        <div class="manga-tarjeta__portada-contenedor">
            <img
                class="manga-tarjeta__portada"
                src="${portada}"
                alt="Portada de ${titulo}"
                loading="lazy"
                width="200"
                height="290"
                onerror="this.onerror=null;this.src='${PORTADA_PLACEHOLDER}'"
            >
        </div>
        <div class="manga-tarjeta__info">
            <h3 class="manga-tarjeta__titulo">${titulo}</h3>
            <span class="manga-tarjeta__capitulos">${totalCaps} caps.</span>
        </div>
    `;

    return article;
}


// — Modal —

let rec_mangaSeleccionado = null;

function rec_cerrarModal() {
    const modal = document.getElementById('mangaModal');
    if (!modal) return;
    modal.classList.remove(CLASE_MODAL_VISIBLE);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    rec_mangaSeleccionado = null;
}

function rec_manejarClickCapitulo(numCap) {
    if (!rec_mangaSeleccionado) return;
    window.location.href =
        `/front-end/paginas/lector/lector.html?manga=${rec_mangaSeleccionado.id}&numero=${numCap}`;
}

function rec_construirCapitulos(capitulos, ultimoCapitulo, capitulosLeidos = []) {
    const lista = document.getElementById('modalCapitulosLista');
    if (!lista) return;

    lista.innerHTML = '';

    if (!capitulos || capitulos.length === 0) {
        lista.innerHTML = '<p class="manga-modal__sin-caps">No hay capítulos disponibles.</p>';
        return;
    }

    const ordenados = [...capitulos].sort((a, b) =>
        rec_obtenerNumeroCapitulo(a) - rec_obtenerNumeroCapitulo(b)
    );

    const BLOQUE = 20;

    for (let i = 0; i < ordenados.length; i += BLOQUE) {
        const grupo   = ordenados.slice(i, i + BLOQUE);
        const primero = rec_obtenerNumeroCapitulo(grupo[0]);
        const ultimo  = rec_obtenerNumeroCapitulo(grupo[grupo.length - 1]);

        const details   = document.createElement('details');
        details.className = 'manga-volumen';
        if (i === 0) details.setAttribute('open', '');

        const summary   = document.createElement('summary');
        summary.className = 'manga-volumen__cabecera';
        summary.innerHTML = `
            <span class="manga-volumen__nombre">Caps. ${primero} – ${ultimo}</span>
            <span class="manga-volumen__rango">${grupo.length} capítulos</span>
            <span class="manga-volumen__flecha">▾</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'manga-volumen__grid';

        grupo.forEach(function(cap) {
            const numCap = rec_obtenerNumeroCapitulo(cap);
            const boton  = document.createElement('button');
            boton.className   = 'manga-cap-btn';
            boton.dataset.cap = numCap;
            boton.setAttribute('aria-label', `Ir al capítulo ${numCap}`);

            const estaLeido =
                capitulosLeidos.includes(numCap) ||
                (ultimoCapitulo !== null && numCap < ultimoCapitulo);
            const esActual = numCap === ultimoCapitulo;

            if (esActual)       boton.classList.add('manga-cap-btn--actual');
            else if (estaLeido) boton.classList.add('manga-cap-btn--leido');

            boton.innerHTML = `<span class="manga-cap-btn__num">${numCap}</span>`;
            boton.addEventListener('click', function() {
                rec_manejarClickCapitulo(numCap);
            });

            grid.appendChild(boton);
        });

        details.appendChild(summary);
        details.appendChild(grid);
        lista.appendChild(details);
    }
}

async function rec_abrirModal(manga) {
    rec_mangaSeleccionado = manga;

    const modal          = document.getElementById('mangaModal');
    const modalPortada   = document.getElementById('modalPortada');
    const modalTitulo    = document.getElementById('modalTituloManga');
    const modalGenero    = document.getElementById('modalGenero');
    const modalUltimoCap = document.getElementById('modalUltimoCapitulo');
    const lista          = document.getElementById('modalCapitulosLista');

    if (!modal) return;

    const idManga   = rec_obtenerIdManga(manga);
    const progreso  = rec_leerProgreso(idManga);
    const ultimoCap = progreso.ultimoCapitulo ?? null;
    const titulo    = rec_obtenerTitulo(manga);
    const categoria = rec_obtenerCategoria(manga);

    modalPortada.src           = rec_obtenerPortada(manga);
    modalPortada.alt           = `Portada de ${titulo}`;
    modalTitulo.textContent    = titulo;
    modalGenero.textContent    = categoria;
    modalUltimoCap.textContent =
        ultimoCap !== null ? `Capítulo ${ultimoCap}` : 'Sin progreso';

    const botonContinuar = document.getElementById('modalBotonContinuar');
    if (botonContinuar) {
        botonContinuar.onclick = function() {
            rec_manejarClickCapitulo(ultimoCap ?? 1);
        };
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add(CLASE_MODAL_VISIBLE);
    document.body.style.overflow = 'hidden';

    if (lista) lista.innerHTML =
        '<p class="manga-modal__sin-caps">Cargando capítulos…</p>';

    try {
        const respuesta = await fetch(`${API_MANGA_BASE}/mangas/${idManga}/capitulos/`);
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const data      = await respuesta.json();
        const capitulos = Array.isArray(data) ? data : (data.results ?? []);
        rec_construirCapitulos(capitulos, ultimoCap, progreso.capitulosLeidos);
    } catch (e) {
        console.error('[Perfil] Error al cargar capítulos:', e);
        if (lista) lista.innerHTML =
            '<p class="manga-modal__sin-caps">No se pudieron cargar los capítulos.</p>';
    }
}

function rec_iniciarModal() {
    const fondoModal  = document.getElementById('modalFondoManga');
    const botonCerrar = document.getElementById('modalCerrar');

    if (fondoModal)  fondoModal.addEventListener('click', rec_cerrarModal);
    if (botonCerrar) botonCerrar.addEventListener('click', rec_cerrarModal);
}


// — Render principal —

async function renderizarRecientes() {
    const cuadricula  = document.getElementById('cuadriculaRecientes');
    const estadoVacio = document.getElementById('estadoVacioRecientes');
    const conteo      = document.getElementById('conteoRecientes');

    if (!cuadricula) return;

    // Indicador de carga
    cuadricula.classList.remove('oculto');
    if (estadoVacio) estadoVacio.classList.add('oculto');
    cuadricula.innerHTML = '<p style="padding:1rem;color:var(--texto-suave);font-size:0.85rem;">Cargando...</p>';

    try {
        // Recogemos todas las páginas igual que en manga.js
        let url    = `${API_MANGA_BASE}/mangas/`;
        let mangas = [];

        while (url) {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (Array.isArray(data)) { mangas = data; break; }
            mangas = mangas.concat(data.results ?? []);
            url    = data.next ?? null;
        }

        if (mangas.length === 0) {
            cuadricula.classList.add('oculto');
            if (estadoVacio) estadoVacio.classList.remove('oculto');
            if (conteo) conteo.textContent = '0';
            return;
        }

        cuadricula.classList.remove('oculto');
        if (estadoVacio) estadoVacio.classList.add('oculto');
        if (conteo) conteo.textContent = Math.min(mangas.length, MAX_RECOMENDADOS);

        cuadricula.innerHTML = '';
        mangas.slice(0, MAX_RECOMENDADOS).forEach(function(manga) {
            cuadricula.appendChild(rec_crearTarjeta(manga));
        });

        // Eventos de clic en tarjetas (delegación)
        cuadricula.addEventListener('click', function(e) {
            const tarjeta = e.target.closest(SELECTOR_TARJETAS_REC);
            if (!tarjeta) return;
            const idManga = tarjeta.dataset.id;
            const datos   = mangas.find(function(m) {
                return String(rec_obtenerIdManga(m)) === String(idManga);
            });
            if (datos) rec_abrirModal(datos);
        });

        cuadricula.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            const tarjeta = e.target.closest(SELECTOR_TARJETAS_REC);
            if (!tarjeta) return;
            e.preventDefault();
            const idManga = tarjeta.dataset.id;
            const datos   = mangas.find(function(m) {
                return String(rec_obtenerIdManga(m)) === String(idManga);
            });
            if (datos) rec_abrirModal(datos);
        });

    } catch (error) {
        console.error('[Perfil] Error al cargar mangas recientes:', error);
        cuadricula.classList.add('oculto');
        if (estadoVacio) estadoVacio.classList.remove('oculto');
    }
}


// ------------------- RECOMENDADOS ------------------- //

async function cargarRecomendados() {
    const cuadricula  = document.getElementById('cuadriculaRecomendados');
    const estadoVacio = document.getElementById('estadoVacioRecomendados');

    if (!cuadricula) return;

    const recientes     = obtenerRecientes();
    const titulosLeidos = recientes.map(function(m) {
        return m.titulo?.toLowerCase().trim();
    });

    try {
        const respuesta = await fetch(`${API_MANGA}?page=1`);

        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos  = await respuesta.json();
        const mangas = datos.results || datos;

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

    const token = await obtenerTokenValido();
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
            method:  'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
            body:    formData,
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            const mensajeError = datos.password_actual
                || datos.non_field_errors
                || datos.username
                || datos.detail
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
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
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
    rec_iniciarModal();
    renderizarRecientes();
    cargarRecomendados();
});


/* ------------------- IR A CAMBIAR CONTRASEÑA ------------------- */

function irACambiarPassword() {
    const email = document.getElementById('inputEmail')?.value.trim();
    const emailEncoded = email ? encodeURIComponent(email) : '';
    window.location.href =
        `/front-end/paginas/recuperar_contrasena/recuperar-contrasena.html?modo=logueado&email=${emailEncoded}`;
}

document.getElementById('enlaceCambiarPassword')
    ?.addEventListener('click', function(e) {
        e.preventDefault();
        irACambiarPassword();
    });