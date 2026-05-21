/* ------------------- MANGA.JS ------------------- */


/* ------------------- CONSTANTES ------------------- */

const API_BASE             = 'http://127.0.0.1:8000/api/anime';
const SELECTOR_FILTRO      = '.filtro';
const SELECTOR_SECCIONES   = '.manga-seccion';
const SELECTOR_TARJETAS    = '.manga-tarjeta';
const SELECTOR_MODAL       = '#mangaModal';
const SELECTOR_FONDO       = '#modalFondo';
const SELECTOR_CERRAR      = '#modalCerrar';
const SELECTOR_BUSQUEDA    = '#inputBusqueda';
const CLASE_FILTRO_ACTIVO  = 'filtro--activo';
const CLASE_SECCION_OCULTA = 'manga-seccion--oculta';
const CLASE_TARJETA_OCULTA = 'manga-tarjeta--oculta';
const CLASE_MODAL_VISIBLE  = 'manga-modal--visible';
const STORAGE_PREFIX       = 'anc_progreso_';
const STORAGE_RECIENTES    = 'anc_recientes';
const MAX_RECIENTES        = 20;
const PORTADA_PLACEHOLDER  = '../../assets/placeholders/placeholder-portada.jpg';


/* ------------------- MAPA DE ETIQUETAS ------------------- */

const ETIQUETAS = {
    'todo'         : 'Todo',
    'accion'       : 'Acción',
    'aventura'     : 'Aventura',
    'romance'      : 'Romance',
    'terror'       : 'Terror',
    'comedia'      : 'Comedia',
    'fantasia'     : 'Fantasía',
    'sci-fi'       : 'Sci-Fi',
    'sin-categoria': 'Sin Categoría',
};

function etiquetaLegible(categoria) {
    return ETIQUETAS[categoria]
        ?? categoria.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


/* ------------------- ESTADO ------------------- */

let filtroActivo      = 'todo';
let terminoBusqueda   = '';
let mangaSeleccionado = null;
let mangasCargados    = [];
let debounceTimer     = null;


/* ------------------- UTILIDADES ------------------- */

function obtenerElemento(selector) {
    return document.querySelector(selector);
}

function obtenerTodos(selector) {
    return document.querySelectorAll(selector);
}

function mostrarOculto(el, visible) {
    if (!el) return;
    el.hidden = !visible;
}

function actualizarConteo(seccionEl, cantidad) {
    const conteo = seccionEl.querySelector('.manga-seccion__conteo');
    if (conteo) {
        conteo.textContent = `${cantidad} título${cantidad !== 1 ? 's' : ''}`;
    }
}

function normalizarTexto(valor) {
    return (valor ?? '').toString().trim().toLowerCase();
}

function normalizarCategoria(valor) {
    return normalizarTexto(valor)
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function obtenerTitulo(manga) {
    return manga.titulo ?? manga.nombre ?? manga.title ?? 'Sin título';
}

function obtenerCategoria(manga) {
    if (manga.categoria && manga.categoria !== 'sin-categoria') {
        return manga.categoria;
    }
    const genero = manga.generos && manga.generos.length > 0 ? manga.generos[0] : null;
    return normalizarCategoria(genero?.slug ?? genero?.nombre ?? 'sin-categoria');
}

function obtenerTotalCapitulos(manga) {
    return manga.total_capitulos ?? 0;
}

function obtenerPortada(manga) {
    const portada = manga.portada ?? manga.portada_url ?? null;

    if (!portada || typeof portada !== 'string') {
        return PORTADA_PLACEHOLDER;
    }

    const portadaLimpia = portada.trim();

    if (!portadaLimpia) {
        return PORTADA_PLACEHOLDER;
    }

    if (portadaLimpia.startsWith('http://') || portadaLimpia.startsWith('https://')) {
        return portadaLimpia;
    }

    if (portadaLimpia.startsWith('/')) {
        return `http://127.0.0.1:8000${portadaLimpia}`;
    }

    return `http://127.0.0.1:8000/media/${portadaLimpia.replace(/^media\//, '')}`;
}

function obtenerIdManga(manga) {
    return manga.id ?? manga.pk;
}

function obtenerNumeroCapitulo(capitulo) {
    return parseFloat(capitulo.numero ?? capitulo.num ?? capitulo.capitulo);
}


/* ------------------- PROGRESO (LOCALSTORAGE) ------------------- */

function leerProgreso(mangaId) {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + mangaId);
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

function guardarProgreso(mangaId, numCap, completado = false) {
    try {
        const progreso = leerProgreso(mangaId);
        progreso.ultimoCapitulo = numCap;
        if (completado && !progreso.capitulosLeidos.includes(numCap)) {
            progreso.capitulosLeidos.push(numCap);
        }
        localStorage.setItem(STORAGE_PREFIX + mangaId, JSON.stringify(progreso));
    } catch (e) {
        console.warn('[Manga] No se pudo guardar progreso:', e);
    }
}


// ------------------- RECIENTES (LOCALSTORAGE) ------------------- //


function actualizarRecientes(manga, ultimoCapitulo) {
    try {
        const raw      = localStorage.getItem(STORAGE_RECIENTES);
        let recientes  = raw ? JSON.parse(raw) : [];

        // Quitar si ya existe para moverlo al principio
        recientes = recientes.filter(function(m) {
            return String(m.id) !== String(obtenerIdManga(manga));
        });

        // Insertar al principio con los datos actualizados
        recientes.unshift({
            id              : obtenerIdManga(manga),
            titulo          : obtenerTitulo(manga),
            portada         : obtenerPortada(manga),
            categoria       : obtenerCategoria(manga),
            total_capitulos : obtenerTotalCapitulos(manga),
            ultimo_capitulo : ultimoCapitulo,
        });

        // Limitar al máximo
        if (recientes.length > MAX_RECIENTES) {
            recientes = recientes.slice(0, MAX_RECIENTES);
        }

        localStorage.setItem(STORAGE_RECIENTES, JSON.stringify(recientes));
    } catch (e) {
        console.warn('[Manga] No se pudo actualizar recientes:', e);
    }
}



/* ------------------- API ------------------- */


async function fetchMangas(params = {}) {
    const query = new URLSearchParams();

    if (params.genero_slug) query.set('genero_slug', params.genero_slug);
    if (params.search)      query.set('search',      params.search);

    let url      = `${API_BASE}/mangas/?${query.toString()}`;
    let resultado = [];

    while (url) {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar mangas`);
        const data = await resp.json();

        if (Array.isArray(data)) return data;
        resultado = resultado.concat(data.results ?? []);
        url       = data.next ?? null;
    }

    return resultado;
}

async function fetchCapitulos(mangaId) {
    const resp = await fetch(`${API_BASE}/mangas/${mangaId}/capitulos/`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} al cargar capítulos`);
    const data = await resp.json();
    if (Array.isArray(data)) return data;
    return data.results ?? [];
}


/* ------------------- GENERACIÓN DE TARJETAS ------------------- */

function crearTarjeta(manga) {
    const article   = document.createElement('article');
    article.className = 'manga-tarjeta';

    const idManga   = obtenerIdManga(manga);
    const titulo    = obtenerTitulo(manga);
    const categoria = obtenerCategoria(manga);

    article.dataset.id        = idManga;
    article.dataset.categoria = categoria;
    article.setAttribute('tabindex', '0');
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Ver detalles de ${titulo}`);

    const totalCaps = obtenerTotalCapitulos(manga);
    const portada   = obtenerPortada(manga);

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

function renderizarTarjetas(mangas) {
    const contenedorSecciones = obtenerElemento('#contenedorSecciones');
    if (!contenedorSecciones) return;

    contenedorSecciones.innerHTML = '';
    const categoriasUnicas = [...new Set(mangas.map(obtenerCategoria))].sort();

    categoriasUnicas.forEach(categoria => {
        const section = document.createElement('section');
        section.className = 'manga-seccion';
        section.dataset.categoria = categoria;
        section.setAttribute('aria-label', `Manga de ${etiquetaLegible(categoria)}`);

        const grid = document.createElement('div');
        grid.className = 'manga-grid';
        grid.id = `grid-${categoria}`;

        section.innerHTML = `
            <div class="manga-seccion__cabecera">
                <div class="manga-seccion__titulo-grupo">
                    <span class="manga-seccion__etiqueta etiqueta--${categoria}">${etiquetaLegible(categoria)}</span>
                    <h2 class="manga-seccion__titulo">${etiquetaLegible(categoria)}</h2>
                </div>
                <span class="manga-seccion__conteo">0 títulos</span>
            </div>
        `;
        section.appendChild(grid);
        contenedorSecciones.appendChild(section);
    });

    mangas.forEach(manga => {
        const categoria = obtenerCategoria(manga);
        const grid      = document.getElementById(`grid-${categoria}`);
        if (grid) grid.appendChild(crearTarjeta(manga));
    });

    const secciones = obtenerTodos(SELECTOR_SECCIONES);
    secciones.forEach(seccion => {
        const cat      = seccion.dataset.categoria;
        const cantidad = mangas.filter(m => obtenerCategoria(m) === cat).length;
        actualizarConteo(seccion, cantidad);
    });
}


/* ------------------- CARGA CON FILTROS DE DJANGO ------------------- */

async function cargarYRenderizar() {
    const contenedorSecciones = obtenerElemento('#contenedorSecciones');

    if (contenedorSecciones) {
        contenedorSecciones.innerHTML =
            '<p class="manga-cargando">Cargando...</p>';
    }

    try {
        const params = {};

        if (filtroActivo !== 'todo') params.genero_slug = filtroActivo;
        if (terminoBusqueda) params.search = terminoBusqueda;

        const mangas = await fetchMangas(params);
        renderizarTarjetas(mangas);
        iniciarTarjetas(mangas);

    } catch (err) {
        console.error('[Manga] Error al cargar:', err);
        if (contenedorSecciones) {
            contenedorSecciones.innerHTML =
                '<p class="manga-error">No se pudo cargar el catálogo. Inténtalo de nuevo.</p>';
        }
    }
}


/* ------------------- FILTROS — EVENTOS ------------------- */

function iniciarFiltros() {
    const filtrosContainer = obtenerElemento('#contenedorFiltros');
    if (!filtrosContainer) return;

    const categorias          = [...new Set(mangasCargados.map(obtenerCategoria))];
    const categoriasOrdenadas = ['todo', ...categorias.sort()];

    filtrosContainer.innerHTML = '';

    categoriasOrdenadas.forEach(cat => {
        const button = document.createElement('button');
        button.className      = `filtro${cat === filtroActivo ? ` ${CLASE_FILTRO_ACTIVO}` : ''}`;
        button.dataset.filtro = cat;
        button.textContent    = etiquetaLegible(cat);

        button.addEventListener('click', () => {
            obtenerTodos(SELECTOR_FILTRO).forEach(b => b.classList.remove(CLASE_FILTRO_ACTIVO));
            button.classList.add(CLASE_FILTRO_ACTIVO);
            filtroActivo = cat;
            cargarYRenderizar();
        });

        filtrosContainer.appendChild(button);
    });
}


/* ------------------- BUSCADOR — EVENTOS ------------------- */

function iniciarBuscador() {
    const inputBusqueda = obtenerElemento(SELECTOR_BUSQUEDA);
    if (!inputBusqueda) return;

    inputBusqueda.addEventListener('input', (e) => {
        terminoBusqueda = e.target.value.trim();

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            cargarYRenderizar();
        }, 400);
    });
}


/* ------------------- MODAL — CONSTRUCCIÓN ------------------- */

function construirCapitulos(capitulos, ultimoCapitulo, capitulosLeidos = []) {
    const lista = obtenerElemento('#modalCapitulosLista');
    if (!lista) return;

    lista.innerHTML = '';

    if (!capitulos || capitulos.length === 0) {
        lista.innerHTML = '<p class="manga-modal__sin-caps">No hay capítulos disponibles.</p>';
        return;
    }

    const ordenados = [...capitulos].sort((a, b) =>
        obtenerNumeroCapitulo(a) - obtenerNumeroCapitulo(b)
    );

    const BLOQUE = 20;

    for (let i = 0; i < ordenados.length; i += BLOQUE) {
        const grupo   = ordenados.slice(i, i + BLOQUE);
        const primero = obtenerNumeroCapitulo(grupo[0]);
        const ultimo  = obtenerNumeroCapitulo(grupo[grupo.length - 1]);

        const details = document.createElement('details');
        details.className = 'manga-volumen';
        if (i === 0) details.setAttribute('open', '');

        const summary = document.createElement('summary');
        summary.className = 'manga-volumen__cabecera';
        summary.innerHTML = `
            <span class="manga-volumen__nombre">Caps. ${primero} – ${ultimo}</span>
            <span class="manga-volumen__rango">${grupo.length} capítulos</span>
            <span class="manga-volumen__flecha">▾</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'manga-volumen__grid';

        grupo.forEach(cap => {
            const numCap = obtenerNumeroCapitulo(cap);
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
            boton.addEventListener('click', () => manejarClickCapitulo(numCap));

            grid.appendChild(boton);
        });

        details.appendChild(summary);
        details.appendChild(grid);
        lista.appendChild(details);
    }
}


/* ------------------- MODAL — CAPÍTULO CLICK ------------------- */

function manejarClickCapitulo(numCap) {
    if (!mangaSeleccionado) return;
    // Guardar progreso y actualizar recientes al ir a leer
    guardarProgreso(mangaSeleccionado.id, numCap);
    actualizarRecientes(mangaSeleccionado, numCap);
    window.location.href =
        `../lector/lector.html?manga=${mangaSeleccionado.id}&numero=${numCap}`;
}


/* ------------------- MODAL — ABRIR / CERRAR ------------------- */

async function abrirModal(manga) {
    mangaSeleccionado = manga;

    const modal          = obtenerElemento(SELECTOR_MODAL);
    const modalPortada   = obtenerElemento('#modalPortada');
    const modalTitulo    = obtenerElemento('#modalTitulo');
    const modalGenero    = obtenerElemento('#modalGenero');
    const modalUltimoCap = obtenerElemento('#modalUltimoCapitulo');
    const lista          = obtenerElemento('#modalCapitulosLista');

    if (!modal) return;

    const idManga   = obtenerIdManga(manga);
    const progreso  = leerProgreso(idManga);
    const ultimoCap = progreso.ultimoCapitulo ?? null;
    const titulo    = obtenerTitulo(manga);
    const categoria = obtenerCategoria(manga);

    modalPortada.src             = obtenerPortada(manga);
    modalPortada.alt             = `Portada de ${titulo}`;
    modalTitulo.textContent      = titulo;
    modalGenero.textContent      = etiquetaLegible(categoria);
    modalUltimoCap.textContent   =
        ultimoCap !== null ? `Capítulo ${ultimoCap}` : 'Sin progreso';

    const botonContinuar = obtenerElemento('#modalBotonContinuar');
    if (botonContinuar) {
        botonContinuar.onclick = () => manejarClickCapitulo(ultimoCap ?? 1);
    }

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add(CLASE_MODAL_VISIBLE);
    document.body.style.overflow = 'hidden';

    if (lista) lista.innerHTML =
        '<p class="manga-modal__sin-caps">Cargando capítulos…</p>';

    const botonCerrar = obtenerElemento(SELECTOR_CERRAR);
    if (botonCerrar) botonCerrar.focus();

    try {
        const capitulos = await fetchCapitulos(manga.id);
        construirCapitulos(capitulos, ultimoCap, progreso.capitulosLeidos);
    } catch (e) {
        console.error('[Manga] Error al cargar capítulos:', e);
        if (lista) lista.innerHTML =
            '<p class="manga-modal__sin-caps">No se pudieron cargar los capítulos.</p>';
    }
}

function cerrarModal() {
    const modal = obtenerElemento(SELECTOR_MODAL);
    if (!modal) return;

    modal.classList.remove(CLASE_MODAL_VISIBLE);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mangaSeleccionado = null;
}


/* ------------------- MODAL — EVENTOS ------------------- */

function iniciarModal() {
    const fondoModal  = obtenerElemento(SELECTOR_FONDO);
    const botonCerrar = obtenerElemento(SELECTOR_CERRAR);

    if (fondoModal)  fondoModal.addEventListener('click', cerrarModal);
    if (botonCerrar) botonCerrar.addEventListener('click', cerrarModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
}


/* ------------------- TARJETAS — EVENTOS ------------------- */

function iniciarTarjetas(mangas) {
    const contenedorSecciones = obtenerElemento('#contenedorSecciones');
    if (!contenedorSecciones) return;

    const nuevo = contenedorSecciones.cloneNode(true);
    contenedorSecciones.parentNode.replaceChild(nuevo, contenedorSecciones);

    nuevo.addEventListener('click', (e) => {
        const tarjeta = e.target.closest(SELECTOR_TARJETAS);
        if (!tarjeta) return;
        const idManga = tarjeta.dataset.id;
        const datos   = mangas.find(m => String(obtenerIdManga(m)) === String(idManga));
        if (datos) abrirModal(datos);
    });

    nuevo.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tarjeta = e.target.closest(SELECTOR_TARJETAS);
        if (!tarjeta) return;
        e.preventDefault();
        const idManga = tarjeta.dataset.id;
        const datos   = mangas.find(m => String(obtenerIdManga(m)) === String(idManga));
        if (datos) abrirModal(datos);
    });
}


/* ------------------- INIT ------------------- */

async function iniciar() {
    iniciarModal();
    iniciarBuscador();

    try {
        mangasCargados = await fetchMangas();

        iniciarFiltros();
        renderizarTarjetas(mangasCargados);
        iniciarTarjetas(mangasCargados);

    } catch (err) {
        console.error('[Manga] Error al cargar la biblioteca:', err);
        const contenedorSecciones = obtenerElemento('#contenedorSecciones');
        if (contenedorSecciones) {
            contenedorSecciones.innerHTML =
                '<p class="manga-error">No se pudo cargar el catálogo.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciar);