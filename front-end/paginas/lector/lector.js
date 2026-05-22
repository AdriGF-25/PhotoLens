/* ------------------- LECTOR.JS ------------------- */

/* ------------------- CONSTANTES ------------------- */

const API_BASE       = 'http://localhost:8000/api/anime';
const STORAGE_PREFIX = 'anc_progreso_';
const URL_MANGA      = '../manga/manga.html';

/* ------------------- ESTADO ------------------- */

const estado = {
    mangaId      : null,
    tituloManga  : '',
    capitulos    : [],
    capIndice    : -1,
    paginas      : [],
    paginaActual : 0,
};

/* ------------------- UTILIDADES ------------------- */

function obtenerElemento(id) {
    return document.getElementById(id);
}

function mostrarOculto(el, visible) {
    if (!el) return;
    el.hidden = !visible;
}

function parseNumero(val) {
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
}

function obtenerToken() {
    return localStorage.getItem('access_token')
        ?? sessionStorage.getItem('access_token');
}

function obtenerUsuarioIdDesdeToken() {
    const token = obtenerToken();
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id ?? payload.id ?? null;
    } catch {
        return null;
    }
}

function obtenerClaveProgresoUsuario(mangaId) {
    const usuarioId = obtenerUsuarioIdDesdeToken();
    if (!usuarioId || !mangaId) return null;
    return `${STORAGE_PREFIX}${usuarioId}_${mangaId}`;
}

/* ------------------- URL PARAMS ------------------- */

function obtenerParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        mangaId : params.get('manga'),
        numero  : parseNumero(params.get('numero')),
    };
}

function actualizarURL(numero) {
    const url = new URL(window.location.href);
    url.searchParams.set('numero', numero);
    window.history.replaceState({}, '', url);
}

/* ------------------- PROGRESO (LOCALSTORAGE) ------------------- */

function leerProgreso(mangaId) {
    try {
        const clave = obtenerClaveProgresoUsuario(mangaId);
        if (!clave) {
            return {
                ultimoCapitulo: null,
                capitulosLeidos: [],
                ultimaApertura: null,
            };
        }

        const raw = localStorage.getItem(clave);
        if (!raw) {
            return {
                ultimoCapitulo: null,
                capitulosLeidos: [],
                ultimaApertura: null,
            };
        }

        const data = JSON.parse(raw);
        return {
            ultimoCapitulo : data.ultimoCapitulo ?? null,
            capitulosLeidos: Array.isArray(data.capitulosLeidos) ? data.capitulosLeidos : [],
            ultimaApertura : data.ultimaApertura ?? null,
        };
    } catch {
        return {
            ultimoCapitulo: null,
            capitulosLeidos: [],
            ultimaApertura: null,
        };
    }
}

function guardarProgreso(mangaId, numCap, completado = false) {
    try {
        const clave = obtenerClaveProgresoUsuario(mangaId);
        if (!clave) return;

        const progreso = leerProgreso(mangaId);
        progreso.ultimoCapitulo = numCap;
        progreso.ultimaApertura = new Date().toISOString();

        if (completado && !progreso.capitulosLeidos.includes(numCap)) {
            progreso.capitulosLeidos.push(numCap);
        }

        localStorage.setItem(clave, JSON.stringify(progreso));
    } catch (e) {
        console.warn('[Lector] No se pudo guardar progreso:', e);
    }
}

/* ------------------- API ------------------- */

async function fetchMangaInfo(mangaId) {
    const resp = await fetch(`${API_BASE}/mangas/${mangaId}/`);
    if (!resp.ok) throw new Error(`Manga ${mangaId} no encontrado`);
    return resp.json();
}

async function fetchCapitulos(mangaId) {
    const resp = await fetch(`${API_BASE}/mangas/${mangaId}/capitulos/`);
    if (!resp.ok) throw new Error('No se pudieron cargar los capítulos');
    return resp.json();
}

async function fetchPaginas(capituloId) {
    const resp = await fetch(`${API_BASE}/capitulos/${capituloId}/paginas/`);
    if (!resp.ok) return { paginas: [], total: 0 };
    return resp.json();
}

/* ------------------- UI — BARRA ------------------- */

function actualizarBarra() {
    const cap = estado.capitulos[estado.capIndice];
    if (!cap) return;

    const nombre = cap.titulo ? cap.titulo : `Capítulo ${cap.numero}`;

    obtenerElemento('lectorMangaTitulo').textContent = estado.tituloManga;
    obtenerElemento('lectorCapNombre').textContent   = nombre;
    obtenerElemento('lectorContador').textContent    = estado.paginas.length > 0
        ? `${estado.paginaActual + 1} / ${estado.paginas.length}`
        : '— / —';
}

/* ------------------- UI — IMAGEN ------------------- */

function cargarImagen(url) {
    return new Promise((resolve) => {
        const img = obtenerElemento('lectorImagen');

        img.classList.add('lector__imagen--fade-out');

        const onLoad = () => {
            img.classList.remove('lector__imagen--fade-out');
            img.classList.add('lector__imagen--fade-in');
            requestAnimationFrame(() => {
                img.classList.remove('lector__imagen--fade-in');
            });
            resolve();
        };

        const onError = () => {
            img.classList.remove('lector__imagen--fade-out');
            resolve();
        };

        img.onload = onLoad;
        img.onerror = onError;
        img.src = url;
        img.alt = `Página ${estado.paginaActual + 1} — ${estado.tituloManga}`;
    });
}

function actualizarProgresoBarra() {
    const fill = obtenerElemento('lectorProgresoFill');
    const barra = obtenerElemento('lectorProgreso');
    const total = estado.paginas.length;
    const actual = estado.paginaActual + 1;
    const porcentaje = total > 0 ? Math.round((actual / total) * 100) : 0;

    if (fill) fill.style.width = `${porcentaje}%`;
    if (barra) {
        barra.setAttribute('aria-valuemax', total);
        barra.setAttribute('aria-valuenow', actual);
    }
}

/* ------------------- UI — BOTONES ------------------- */

function actualizarBotones() {
    const btnPagPrev = obtenerElemento('btnPaginaAnterior');
    const btnPagNext = obtenerElemento('btnPaginaSiguiente');
    const btnCapPrev = obtenerElemento('btnCapAnterior');
    const btnCapNext = obtenerElemento('btnCapSiguiente');

    if (btnPagPrev) btnPagPrev.disabled = estado.paginaActual === 0;
    if (btnPagNext) btnPagNext.disabled = estado.paginaActual >= estado.paginas.length - 1;
    if (btnCapPrev) btnCapPrev.disabled = estado.capIndice <= 0;
    if (btnCapNext) btnCapNext.disabled = estado.capIndice >= estado.capitulos.length - 1;
}

/* ------------------- SPINNER ------------------- */

function mostrarSpinner(activo) {
    mostrarOculto(obtenerElemento('lectorSpinner'), activo);
}

/* ------------------- NAVEGACIÓN — PÁGINA ------------------- */

async function irPagina(n) {
    if (n < 0 || n >= estado.paginas.length) return;

    estado.paginaActual = n;

    await cargarImagen(estado.paginas[n]);

    const esUltimaPagina = n === estado.paginas.length - 1;
    const cap = estado.capitulos[estado.capIndice];

    if (cap) {
        guardarProgreso(estado.mangaId, parseFloat(cap.numero), esUltimaPagina);
    }

    actualizarBarra();
    actualizarBotones();
    actualizarProgresoBarra();

    obtenerElemento('lectorVisor')?.scrollTo(0, 0);
}

function paginaSiguiente() {
    irPagina(estado.paginaActual + 1);
}

function paginaAnterior() {
    irPagina(estado.paginaActual - 1);
}

/* ------------------- NAVEGACIÓN — CAPÍTULO ------------------- */

async function cargarCapitulo(indice) {
    if (indice < 0 || indice >= estado.capitulos.length) return;

    mostrarSpinner(true);
    mostrarOculto(obtenerElemento('lectorImagenWrap'), false);
    mostrarOculto(obtenerElemento('lectorVacio'), false);

    estado.capIndice = indice;
    estado.paginaActual = 0;
    estado.paginas = [];

    const cap = estado.capitulos[indice];

    try {
        const data = await fetchPaginas(cap.id);
        estado.paginas = Array.isArray(data.paginas) ? data.paginas : [];
    } catch (e) {
        console.error('[Lector] Error al cargar páginas:', e);
        estado.paginas = [];
    }

    mostrarSpinner(false);

    if (estado.paginas.length === 0) {
        mostrarOculto(obtenerElemento('lectorVacio'), true);
        actualizarBarra();
        actualizarBotones();
        return;
    }

    mostrarOculto(obtenerElemento('lectorImagenWrap'), true);

    await cargarImagen(estado.paginas[0]);
    guardarProgreso(estado.mangaId, parseFloat(cap.numero), false);
    actualizarURL(cap.numero);
    actualizarBarra();
    actualizarBotones();
    actualizarProgresoBarra();
}

function capituloSiguiente() {
    cargarCapitulo(estado.capIndice + 1);
}

function capituloAnterior() {
    cargarCapitulo(estado.capIndice - 1);
}

/* ------------------- SALIR ------------------- */

function salir() {
    const timeout = setTimeout(() => { window.location.href = URL_MANGA; }, 400);
    window.addEventListener('pagehide', () => clearTimeout(timeout), { once: true });
    window.history.back();
}

/* ------------------- EVENTOS ------------------- */

function iniciarEventos() {
    obtenerElemento('lectorSalir')?.addEventListener('click', salir);

    obtenerElemento('btnPaginaAnterior')?.addEventListener('click', paginaAnterior);
    obtenerElemento('btnPaginaSiguiente')?.addEventListener('click', paginaSiguiente);
    obtenerElemento('btnCapAnterior')?.addEventListener('click', capituloAnterior);
    obtenerElemento('btnCapSiguiente')?.addEventListener('click', capituloSiguiente);

    obtenerElemento('lectorVacioSalir')?.addEventListener('click', salir);
    obtenerElemento('lectorErrorSalir')?.addEventListener('click', salir);

    obtenerElemento('zonaIzq')?.addEventListener('click', paginaAnterior);
    obtenerElemento('zonaDer')?.addEventListener('click', paginaSiguiente);

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                paginaSiguiente();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                paginaAnterior();
                break;
            case 'Escape':
                salir();
                break;
        }
    });

    let touchStartX = 0;
    const visor = obtenerElemento('lectorVisor');

    visor?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    visor?.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            dx < 0 ? paginaSiguiente() : paginaAnterior();
        }
    }, { passive: true });
}

/* ------------------- INIT ------------------- */

async function iniciar() {
    const { mangaId, numero } = obtenerParams();

    iniciarEventos();

    if (!mangaId || numero === null) {
        console.warn('[Lector] Faltan parámetros manga/numero en la URL');
        mostrarSpinner(false);
        mostrarOculto(obtenerElemento('lectorError'), true);
        return;
    }

    estado.mangaId = mangaId;
    mostrarSpinner(true);

    try {
        const [mangaInfo, capitulos] = await Promise.all([
            fetchMangaInfo(mangaId),
            fetchCapitulos(mangaId),
        ]);

        estado.tituloManga = mangaInfo.titulo || '';
        estado.capitulos = capitulos;

        const indice = capitulos.findIndex(
            c => parseFloat(c.numero) === numero
        );

        if (indice === -1) {
            await cargarCapitulo(0);
        } else {
            await cargarCapitulo(indice);
        }

    } catch (err) {
        console.error('[Lector] Error al conectar con la API:', err);
        console.error('[Lector] Comprueba: backend en ' + API_BASE + ', CORS habilitado, IDs correctos');
        mostrarSpinner(false);
        mostrarOculto(obtenerElemento('lectorError'), true);
    }
}

document.addEventListener('DOMContentLoaded', iniciar);