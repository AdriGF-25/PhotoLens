/* ------------------- MANGA.JS ------------------- */


/* ------------------- CONSTANTES ------------------- */

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


/* ------------------- DATOS HARDCODED (temporal) ------------------- */

const DATOS_MANGA = [
    {
        id: 1,
        titulo: 'Chainsaw Man',
        categoria: 'accion',
        genero: 'Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 47,
        volumenes: [
            { nombre: 'Volumen 1',  rango: 'Caps. 1 – 7',   caps: [1,2,3,4,5,6,7] },
            { nombre: 'Volumen 2',  rango: 'Caps. 8 – 16',  caps: [8,9,10,11,12,13,14,15,16] },
            { nombre: 'Volumen 3',  rango: 'Caps. 17 – 25', caps: [17,18,19,20,21,22,23,24,25] },
            { nombre: 'Volumen 4',  rango: 'Caps. 26 – 34', caps: [26,27,28,29,30,31,32,33,34] },
            { nombre: 'Volumen 5',  rango: 'Caps. 35 – 43', caps: [35,36,37,38,39,40,41,42,43] },
            { nombre: 'Parte II',   rango: 'Caps. 44 – 97', caps: Array.from({ length: 54 }, (_, i) => i + 44) }
        ]
    },
    {
        id: 2,
        titulo: 'Kimetsu no Yaiba',
        categoria: 'accion',
        genero: 'Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 120,
        volumenes: [
            { nombre: 'Arco Selección Final', rango: 'Caps. 1 – 22',   caps: Array.from({ length: 22 }, (_, i) => i + 1) },
            { nombre: 'Arco Hermano Tambor',  rango: 'Caps. 23 – 44',  caps: Array.from({ length: 22 }, (_, i) => i + 23) },
            { nombre: 'Arco Tren Infinito',   rango: 'Caps. 45 – 70',  caps: Array.from({ length: 26 }, (_, i) => i + 45) },
            { nombre: 'Arco Distrito Placer', rango: 'Caps. 71 – 99',  caps: Array.from({ length: 29 }, (_, i) => i + 71) },
            { nombre: 'Arco Aldea Herrero',   rango: 'Caps. 100 – 127', caps: Array.from({ length: 28 }, (_, i) => i + 100) },
            { nombre: 'Arco Final',           rango: 'Caps. 128 – 205', caps: Array.from({ length: 78 }, (_, i) => i + 128) }
        ]
    },
    {
        id: 3,
        titulo: 'Gachiakuta',
        categoria: 'accion',
        genero: 'Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 30,
        volumenes: [
            { nombre: 'Volumen 1', rango: 'Caps. 1 – 10',  caps: Array.from({ length: 10 }, (_, i) => i + 1) },
            { nombre: 'Volumen 2', rango: 'Caps. 11 – 25', caps: Array.from({ length: 15 }, (_, i) => i + 11) },
            { nombre: 'Volumen 3', rango: 'Caps. 26 – 68', caps: Array.from({ length: 43 }, (_, i) => i + 26) }
        ]
    },
    {
        id: 4,
        titulo: 'Solo Leveling',
        categoria: 'accion',
        genero: 'Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 90,
        volumenes: [
            { nombre: 'Arco Despertar',   rango: 'Caps. 1 – 45',   caps: Array.from({ length: 45 }, (_, i) => i + 1) },
            { nombre: 'Arco Crecimiento', rango: 'Caps. 46 – 110',  caps: Array.from({ length: 65 }, (_, i) => i + 46) },
            { nombre: 'Arco Final',       rango: 'Caps. 111 – 179', caps: Array.from({ length: 69 }, (_, i) => i + 111) }
        ]
    },
    {
        id: 5,
        titulo: 'Fire Force',
        categoria: 'accion',
        genero: 'Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 1,
        volumenes: [
            { nombre: 'Arco Brigada 8',  rango: 'Caps. 1 – 50',   caps: Array.from({ length: 50 }, (_, i) => i + 1) },
            { nombre: 'Arco Evangelist', rango: 'Caps. 51 – 150',  caps: Array.from({ length: 100 }, (_, i) => i + 51) },
            { nombre: 'Arco Final',      rango: 'Caps. 151 – 304', caps: Array.from({ length: 154 }, (_, i) => i + 151) }
        ]
    },
    {
        id: 6,
        titulo: 'One Piece',
        categoria: 'aventura',
        genero: 'Aventura',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 550,
        volumenes: [
            { nombre: 'Saga Este Azul',   rango: 'Caps. 1 – 100',    caps: Array.from({ length: 100 }, (_, i) => i + 1) },
            { nombre: 'Saga Arabasta',    rango: 'Caps. 101 – 217',   caps: Array.from({ length: 117 }, (_, i) => i + 101) },
            { nombre: 'Saga Skypiea',     rango: 'Caps. 218 – 302',   caps: Array.from({ length: 85 }, (_, i) => i + 218) },
            { nombre: 'Saga Water 7',     rango: 'Caps. 303 – 441',   caps: Array.from({ length: 139 }, (_, i) => i + 303) },
            { nombre: 'Saga Marineford', rango: 'Caps. 442 – 597',   caps: Array.from({ length: 156 }, (_, i) => i + 442) },
            { nombre: 'Nueva世界',       rango: 'Caps. 598 – 1110+', caps: Array.from({ length: 513 }, (_, i) => i + 598) }
        ]
    },
    {
        id: 7,
        titulo: 'BLAME!',
        categoria: 'aventura',
        genero: 'Aventura / Sci-Fi',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 30,
        volumenes: [
            { nombre: 'Volumen 1 – 5',  rango: 'Caps. 1 – 33',  caps: Array.from({ length: 33 }, (_, i) => i + 1) },
            { nombre: 'Volumen 6 – 10', rango: 'Caps. 34 – 66', caps: Array.from({ length: 33 }, (_, i) => i + 34) }
        ]
    },
    {
        id: 8,
        titulo: 'Horimiya',
        categoria: 'romance',
        genero: 'Romance',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 60,
        volumenes: [
            { nombre: 'Volumen 1 – 4',  rango: 'Caps. 1 – 40',   caps: Array.from({ length: 40 }, (_, i) => i + 1) },
            { nombre: 'Volumen 5 – 8',  rango: 'Caps. 41 – 85',  caps: Array.from({ length: 45 }, (_, i) => i + 41) },
            { nombre: 'Volumen 9 – 16', rango: 'Caps. 86 – 122', caps: Array.from({ length: 37 }, (_, i) => i + 86) }
        ]
    },
    {
        id: 9,
        titulo: 'SPY x FAMILY',
        categoria: 'romance',
        genero: 'Comedia / Acción',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 55,
        volumenes: [
            { nombre: 'Misión 1 – 20',  rango: 'Caps. 1 – 20',   caps: Array.from({ length: 20 }, (_, i) => i + 1) },
            { nombre: 'Misión 21 – 60', rango: 'Caps. 21 – 60',  caps: Array.from({ length: 40 }, (_, i) => i + 21) },
            { nombre: 'Misión 61 – 100+', rango: 'Caps. 61 – 100+', caps: Array.from({ length: 40 }, (_, i) => i + 61) }
        ]
    },
    {
        id: 10,
        titulo: 'Zero kara Hajimeru',
        categoria: 'sci-fi',
        genero: 'Fantasía / Sci-Fi',
        portada: '../../assets/placeholders/placeholder-portada.jpg',
        ultimoCapitulo: 20,
        volumenes: [
            { nombre: 'Volumen 1 – 3', rango: 'Caps. 1 – 22',  caps: Array.from({ length: 22 }, (_, i) => i + 1) },
            { nombre: 'Volumen 4 – 6', rango: 'Caps. 23 – 46', caps: Array.from({ length: 24 }, (_, i) => i + 23) }
        ]
    }
];


/* ------------------- ESTADO ------------------- */

let filtroActivo      = 'todo';
let terminoBusqueda   = '';
let mangaSeleccionado = null;


/* ------------------- UTILIDADES ------------------- */

function obtenerElemento(selector) {
    return document.querySelector(selector);
}

function obtenerTodos(selector) {
    return document.querySelectorAll(selector);
}

function actualizarConteo(seccionEl, cantidad) {
    const conteo = seccionEl.querySelector('.manga-seccion__conteo');
    if (conteo) {
        conteo.textContent = `${cantidad} título${cantidad !== 1 ? 's' : ''}`;
    }
}


/* ------------------- PROGRESO (LOCALSTORAGE) ------------------- */

/**
 * Lee el progreso guardado de un manga.
 * @param {number} mangaId
 * @returns {{ ultimoCapitulo: number|null, capitulosLeidos: number[] }}
 */
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


/* ------------------- FILTRADO ------------------- */

function aplicarFiltros() {
    const secciones = obtenerTodos(SELECTOR_SECCIONES);

    secciones.forEach(seccion => {
        const categoria    = seccion.dataset.categoria;
        const tarjetas     = seccion.querySelectorAll(SELECTOR_TARJETAS);
        let tarjetasVis    = 0;

        tarjetas.forEach(tarjeta => {
            const categoriaTarjeta = tarjeta.dataset.categoria;
            const tituloTarjeta    = tarjeta.querySelector('.manga-tarjeta__titulo')
                                            .textContent.toLowerCase();
            const coincideFiltro   = filtroActivo === 'todo' || categoriaTarjeta === filtroActivo;
            const coincideBusqueda = tituloTarjeta.includes(terminoBusqueda.toLowerCase());

            if (coincideFiltro && coincideBusqueda) {
                tarjeta.classList.remove(CLASE_TARJETA_OCULTA);
                tarjetasVis++;
            } else {
                tarjeta.classList.add(CLASE_TARJETA_OCULTA);
            }
        });

        const seccionVisible = (filtroActivo === 'todo' || categoria === filtroActivo) && tarjetasVis > 0;

        seccion.classList.toggle(CLASE_SECCION_OCULTA, !seccionVisible);
        actualizarConteo(seccion, tarjetasVis);
    });
}


/* ------------------- FILTROS — EVENTOS ------------------- */

function iniciarFiltros() {
    const botonesFiltro = obtenerTodos(SELECTOR_FILTRO);

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', () => {
            botonesFiltro.forEach(b => b.classList.remove(CLASE_FILTRO_ACTIVO));
            boton.classList.add(CLASE_FILTRO_ACTIVO);
            filtroActivo = boton.dataset.filtro;
            aplicarFiltros();
        });
    });
}


/* ------------------- BUSCADOR — EVENTOS ------------------- */

function iniciarBuscador() {
    const inputBusqueda = obtenerElemento(SELECTOR_BUSQUEDA);

    if (!inputBusqueda) return;

    inputBusqueda.addEventListener('input', (e) => {
        terminoBusqueda = e.target.value.trim();
        aplicarFiltros();
    });
}


/* ------------------- MODAL — CONSTRUCCIÓN ------------------- */

/**
 * Construye la lista de capítulos en el modal.
 * @param {Array}    volumenes
 * @param {number}   ultimoCapitulo   - Número del último cap leído/actual
 * @param {number[]} capitulosLeidos  - Caps completados explícitamente
 */
function construirCapitulos(volumenes, ultimoCapitulo, capitulosLeidos = []) {
    const lista = obtenerElemento('#modalCapitulosLista');

    if (!lista) return;

    lista.innerHTML = '';

    volumenes.forEach((volumen, indice) => {
        const details = document.createElement('details');
        details.className = 'manga-volumen';

        if (indice === 0) {
            details.setAttribute('open', '');
        }

        const summary = document.createElement('summary');
        summary.className = 'manga-volumen__cabecera';
        summary.innerHTML = `
            <span class="manga-volumen__nombre">${volumen.nombre}</span>
            <span class="manga-volumen__rango">${volumen.rango}</span>
            <span class="manga-volumen__flecha">▾</span>
        `;

        const grid = document.createElement('div');
        grid.className = 'manga-volumen__grid';

        volumen.caps.forEach(numCap => {
            const boton = document.createElement('button');
            boton.className = 'manga-cap-btn';
            boton.dataset.cap = numCap;
            boton.setAttribute('aria-label', `Ir al capítulo ${numCap}`);

            // Un cap está leído si: está en el array explícito de leídos,
            // o su número es menor que el último capítulo visto.
            const estaLeido  = capitulosLeidos.includes(numCap) || numCap < ultimoCapitulo;
            const esActual   = numCap === ultimoCapitulo;

            if (esActual) {
                boton.classList.add('manga-cap-btn--actual');
            } else if (estaLeido) {
                boton.classList.add('manga-cap-btn--leido');
            }

            boton.innerHTML = `<span class="manga-cap-btn__num">${numCap}</span>`;
            boton.addEventListener('click', () => manejarClickCapitulo(numCap));

            grid.appendChild(boton);
        });

        details.appendChild(summary);
        details.appendChild(grid);
        lista.appendChild(details);
    });
}


/* ------------------- MODAL — CAPÍTULO CLICK ------------------- */

/**
 * Navega al lector para el capítulo indicado.
 * Usa el ID del manga seleccionado y el número de capítulo como parámetros de URL.
 */
function manejarClickCapitulo(numCap) {
    if (!mangaSeleccionado) return;
    window.location.href = `../lector/lector.html?manga=${mangaSeleccionado.id}&numero=${numCap}`;
}


/* ------------------- MODAL — ABRIR / CERRAR ------------------- */

function abrirModal(datosManga) {
    // Leer progreso guardado y fusionarlo con los datos del manga
    const progreso = leerProgreso(datosManga.id);

    // Si hay progreso guardado, usarlo; si no, mantener el del hardcode
    const ultimoCap = progreso.ultimoCapitulo !== null
        ? progreso.ultimoCapitulo
        : datosManga.ultimoCapitulo;

    // Guardar referencia con el progreso actualizado
    mangaSeleccionado = { ...datosManga, ultimoCapitulo: ultimoCap };

    const modal          = obtenerElemento(SELECTOR_MODAL);
    const modalPortada   = obtenerElemento('#modalPortada');
    const modalTitulo    = obtenerElemento('#modalTitulo');
    const modalGenero    = obtenerElemento('#modalGenero');
    const modalUltimoCap = obtenerElemento('#modalUltimoCapitulo');

    if (!modal) return;

    modalPortada.src            = datosManga.portada;
    modalPortada.alt            = `Portada de ${datosManga.titulo}`;
    modalTitulo.textContent     = datosManga.titulo;
    modalGenero.textContent     = datosManga.genero;
    modalUltimoCap.textContent  = `Capítulo ${ultimoCap}`;

    construirCapitulos(datosManga.volumenes, ultimoCap, progreso.capitulosLeidos);

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add(CLASE_MODAL_VISIBLE);
    document.body.style.overflow = 'hidden';

    const botonCerrar = obtenerElemento(SELECTOR_CERRAR);
    if (botonCerrar) botonCerrar.focus();
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

    if (fondoModal) {
        fondoModal.addEventListener('click', cerrarModal);
    }

    if (botonCerrar) {
        botonCerrar.addEventListener('click', cerrarModal);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarModal();
    });
}


/* ------------------- TARJETAS — EVENTOS ------------------- */

function iniciarTarjetas() {
    const tarjetas = obtenerTodos(SELECTOR_TARJETAS);

    tarjetas.forEach(tarjeta => {
        const idManga = parseInt(tarjeta.dataset.id, 10);
        const datos   = DATOS_MANGA.find(m => m.id === idManga);

        if (!datos) return;

        tarjeta.addEventListener('click', () => abrirModal(datos));

        tarjeta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrirModal(datos);
            }
        });
    });
}


/* ------------------- CONTEOS INICIALES ------------------- */

function iniciarConteos() {
    const secciones = obtenerTodos(SELECTOR_SECCIONES);

    secciones.forEach(seccion => {
        const categoria = seccion.dataset.categoria;
        const cantidad  = DATOS_MANGA.filter(m => m.categoria === categoria).length;
        actualizarConteo(seccion, cantidad);
    });
}


/* ------------------- INIT ------------------- */

function iniciar() {
    iniciarConteos();
    iniciarFiltros();
    iniciarBuscador();
    iniciarTarjetas();
    iniciarModal();
}

document.addEventListener('DOMContentLoaded', iniciar);