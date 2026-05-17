// ------------------- CONSTANTES ------------------- //

const API_NOTICIAS    = 'http://127.0.0.1:8000/api/noticias/noticias/';
const API_SINCRONIZAR = 'http://127.0.0.1:8000/api/noticias/noticias/sincronizar/';
const IMAGEN_PLACEHOLDER = '../../assets/img/placeholder-noticia.jpg';

const SESSION_KEY_PAGINA = 'anc_noticias_pagina';
const SESSION_KEY_FILTRO = 'anc_noticias_filtro';

const TIPO_CATEGORIA = {
    manga:  { filtro: 'manga',      etiqueta: 'Manga',       clase: 'etiqueta--manga'      },
    anime:  { filtro: 'anime',      etiqueta: 'Anime',       clase: 'etiqueta--anime'      },
    novel:  { filtro: 'noticia',    etiqueta: 'Noticia',     clase: 'etiqueta--noticia'    },
};
const CATEGORIA_DEFECTO = { filtro: 'lanzamiento', etiqueta: 'Lanzamiento', clase: 'etiqueta--lanzamiento' };


// ------------------- ESTADO ------------------- //

let paginaActual    = 1;
let totalPaginas    = 1;
let filtroActivo    = 'todo';
let todasLasTarjetas = [];


// ------------------- SESSION STORAGE ------------------- //

function guardarEstadoSesion() {
    sessionStorage.setItem(SESSION_KEY_PAGINA, paginaActual);
    sessionStorage.setItem(SESSION_KEY_FILTRO, filtroActivo);
}

function restaurarEstadoSesion() {
    const paginaGuardada = sessionStorage.getItem(SESSION_KEY_PAGINA);
    const filtroGuardado = sessionStorage.getItem(SESSION_KEY_FILTRO);

    if (paginaGuardada) paginaActual = parseInt(paginaGuardada, 10);
    if (filtroGuardado) filtroActivo = filtroGuardado;
}

function limpiarEstadoSesion() {
    sessionStorage.removeItem(SESSION_KEY_PAGINA);
    sessionStorage.removeItem(SESSION_KEY_FILTRO);
}


// ------------------- UTILIDADES ------------------- //

function obtenerCategoria(tipo) {
    if (!tipo) return CATEGORIA_DEFECTO;
    return TIPO_CATEGORIA[tipo.toLowerCase()] || CATEGORIA_DEFECTO;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

function obtenerImagenNoticia(noticia) {
    if (noticia.imagen_url && noticia.imagen_url.trim() !== '') return noticia.imagen_url;
    return IMAGEN_PLACEHOLDER;
}

function crearAtributoOnErrorImagen() {
    return `this.onerror=null;this.src='${IMAGEN_PLACEHOLDER}';`;
}


// ------------------- RENDER HERO ------------------- //

function renderizarHero(noticia) {
    const cat = obtenerCategoria(noticia.tipo);
    const heroImagen = document.querySelector('.hero__imagen');

    heroImagen.src = obtenerImagenNoticia(noticia);
    heroImagen.alt = noticia.titulo;
    heroImagen.onerror = function () {
        this.onerror = null;
        this.src = IMAGEN_PLACEHOLDER;
    };

    document.querySelector('.hero__titulo').textContent = noticia.titulo;
    document.querySelector('.hero__descripcion').textContent = noticia.descripcion || '';

    const metaSpans = document.querySelectorAll('.hero__meta span');
    if (metaSpans.length > 0) {
        metaSpans[0].textContent = formatearFecha(noticia.fecha_ann || noticia.created_at);
    }

    const etiquetaHero = document.querySelector('.hero .etiqueta');
    etiquetaHero.textContent = cat.etiqueta;
    etiquetaHero.className = `etiqueta ${cat.clase}`;

    const enlaceHero = document.querySelector('.boton-primario');
    enlaceHero.href = noticia.slug
        ? `/front-end/paginas/detalle-noticia/detalle-noticia.html?slug=${noticia.slug}`
        : `/front-end/paginas/detalle-noticia/detalle-noticia.html?id=${noticia.id}`;
    enlaceHero.target = '_self';
    enlaceHero.removeAttribute('rel');
}


// ------------------- RENDER TARJETAS ------------------- //

function crearTarjeta(noticia) {
    const cat    = obtenerCategoria(noticia.tipo);
    const imagen = obtenerImagenNoticia(noticia);
    const fecha  = formatearFecha(noticia.fecha_ann || noticia.created_at);

    const enlaceDetalle = noticia.slug
        ? `/front-end/paginas/detalle-noticia/detalle-noticia.html?slug=${noticia.slug}`
        : `/front-end/paginas/detalle-noticia/detalle-noticia.html?id=${noticia.id}`;

    const article = document.createElement('article');
    article.className = 'tarjeta';
    article.dataset.categoria = cat.filtro;

    article.innerHTML = `
        <a href="${enlaceDetalle}" class="tarjeta__imagen-contenedor">
            <div class="tarjeta__imagen-meta">
                <span class="etiqueta ${cat.clase}">${cat.etiqueta}</span>
                <span class="tarjeta__comentarios oculto" aria-label="Comentarios">                    
                    <span class="tarjeta__comentarios-numero">0</span>
                </span>
            </div>
            <img
                class="tarjeta__imagen"
                src="${imagen}"
                alt="${noticia.titulo}"
                loading="lazy"
                width="600"
                height="210"
                onerror="${crearAtributoOnErrorImagen()}"
            >
        </a>
        <div class="tarjeta__cuerpo">
            <h2 class="tarjeta__titulo">
                <a href="${enlaceDetalle}" class="tarjeta__enlace">${noticia.titulo}</a>
            </h2>
            <p class="tarjeta__resumen">${noticia.descripcion || 'Sin descripción disponible.'}</p>
            <div class="tarjeta__pie">
                <span>${fecha}</span>
                <span>ANN</span>
            </div>
        </div>
    `;

    return article;
}

function renderizarTarjetas(noticias) {
    const cuadricula = document.querySelector('.cuadricula-noticias');
    cuadricula.innerHTML = '';
    todasLasTarjetas = [];

    noticias.forEach(function (noticia) {
        const tarjeta = crearTarjeta(noticia);
        cuadricula.appendChild(tarjeta);
        todasLasTarjetas.push(tarjeta);
    });

    aplicarFiltroActual();
}


// ------------------- SKELETON / ERROR ------------------- //

function mostrarSkeleton() {
    const cuadricula = document.querySelector('.cuadricula-noticias');
    cuadricula.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        cuadricula.innerHTML += `
            <article class="tarjeta">
                <div class="skeleton skeleton-image"></div>
                <div class="tarjeta__cuerpo">
                    <div class="skeleton skeleton-text" style="width:30%"></div>
                    <div class="skeleton skeleton-heading"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            </article>
        `;
    }
}

function mostrarError(mensaje) {
    const cuadricula = document.querySelector('.cuadricula-noticias');
    todasLasTarjetas = [];

    cuadricula.innerHTML = `
        <div class="estado-vacio">
            <p class="estado-vacio__mensaje">${mensaje}</p>
            <button class="boton-secundario" id="btnReintentar">Reintentar</button>
        </div>
    `;

    const conteo = document.querySelector('.conteo-resultados strong');
    if (conteo) conteo.textContent = '0';

    document.getElementById('btnReintentar')?.addEventListener('click', function () {
        limpiarEstadoSesion();
        paginaActual = 1;
        cargarPagina(paginaActual);
    });
}


// ------------------- API ------------------- //

async function sincronizarConANN() {
    const respuesta = await fetch(API_SINCRONIZAR, { method: 'POST' });
    if (!respuesta.ok) throw new Error('Error al sincronizar con ANN');
}

async function obtenerNoticias(pagina = 1) {
    const respuesta = await fetch(`${API_NOTICIAS}?page=${pagina}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al obtener noticias`);
    return await respuesta.json();
}


// ------------------- PAGINACIÓN ------------------- //

function renderizarPaginacion(total, actual) {
    const contenedor = document.querySelector('.paginacion__numeros');
    const btnAnterior = document.querySelector('.paginacion__btn--anterior');
    const btnSiguiente = document.querySelector('.paginacion__btn--siguiente');

    contenedor.innerHTML = '';

    // Botones < >
    btnAnterior.disabled = actual <= 1;
    btnSiguiente.disabled = actual >= total;

    // Calcula qué números mostrar: 3 antes + actual + 3 después
    const rango = new Set();
    rango.add(1);
    rango.add(total);

    for (let i = Math.max(2, actual - 2); i <= Math.min(total - 1, actual + 2); i++) {
        rango.add(i);
    }

    const paginas = Array.from(rango).sort(function (a, b) { return a - b; });

    paginas.forEach(function (num, idx) {
        // Añadir "..." si hay salto
        if (idx > 0 && num - paginas[idx - 1] > 1) {
            const puntos = document.createElement('span');
            puntos.className = 'paginacion__puntos';
            puntos.textContent = '···';
            contenedor.appendChild(puntos);
        }

        const btn = document.createElement('button');
        btn.className = 'paginacion__numero' + (num === actual ? ' paginacion__numero--activo' : '');
        btn.textContent = num;
        btn.setAttribute('aria-label', `Ir a página ${num}`);
        if (num === actual) btn.setAttribute('aria-current', 'page');

        btn.addEventListener('click', function () {
            if (num !== paginaActual) irAPagina(num);
        });

        contenedor.appendChild(btn);
    });
}

function irAPagina(num) {
    paginaActual = num;
    guardarEstadoSesion();
    cargarPagina(paginaActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ------------------- CARGA POR PÁGINA ------------------- //

async function cargarPagina(pagina) {
    mostrarSkeleton();

    try {
        let datos = await obtenerNoticias(pagina);

        // BD vacía → sincronizar y reintentar
        if (datos.count === 0) {
            await sincronizarConANN();
            datos = await obtenerNoticias(pagina);
        }

        const noticias = datos.results;

        if (!noticias || noticias.length === 0) {
            mostrarError('No hay novedades disponibles en este momento.');
            return;
        }

        // Calcular total de páginas desde la API
        const pageSize = noticias.length || 1;
        totalPaginas = Math.ceil(datos.count / pageSize);

        renderizarHero(noticias[0]);
        renderizarTarjetas(noticias.slice(1));
        actualizarContador();
        renderizarPaginacion(totalPaginas, paginaActual);
        sincronizarBotonesFiltroDom();

    } catch (error) {
        console.error('Error al cargar noticias:', error);
        mostrarError('No se pudo conectar con el servidor. ¿Está Django corriendo?');
    }
}


// ------------------- FILTROS ------------------- //

function aplicarFiltroActual() {
    todasLasTarjetas.forEach(function (tarjeta) {
        const debeVerse = filtroActivo === 'todo' || tarjeta.dataset.categoria === filtroActivo;
        tarjeta.classList.toggle('tarjeta--oculta', !debeVerse);
    });
    actualizarContador();
}

function actualizarContador(cantidad) {
    const conteo = document.querySelector('.conteo-resultados strong');
    if (!conteo) return;

    if (cantidad === undefined) {
        cantidad = todasLasTarjetas.filter(function (t) {
            return !t.classList.contains('tarjeta--oculta');
        }).length;
    }

    conteo.textContent = cantidad;
}

// Sincroniza el botón activo del DOM con filtroActivo restaurado de sesión
function sincronizarBotonesFiltroDom() {
    document.querySelectorAll('.filtro').forEach(function (boton) {
        boton.classList.toggle('filtro--activo', boton.dataset.filtro === filtroActivo);
    });
}


// ------------------- EVENTOS ------------------- //

document.querySelectorAll('.filtro').forEach(function (boton) {
    boton.addEventListener('click', function () {
        filtroActivo = boton.dataset.filtro;
        guardarEstadoSesion();
        sincronizarBotonesFiltroDom();
        aplicarFiltroActual();
    });
});

document.querySelector('.paginacion__btn--anterior')
    ?.addEventListener('click', function () {
        if (paginaActual > 1) irAPagina(paginaActual - 1);
    });

document.querySelector('.paginacion__btn--siguiente')
    ?.addEventListener('click', function () {
        if (paginaActual < totalPaginas) irAPagina(paginaActual + 1);
    });


// ------------------- INICIO ------------------- //

document.addEventListener('DOMContentLoaded', function () {
    restaurarEstadoSesion();
    cargarPagina(paginaActual);
});