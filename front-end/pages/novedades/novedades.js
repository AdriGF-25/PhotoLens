// ------------------- CONSTANTES ------------------- //

const API_NOTICIAS    = 'http://127.0.0.1:8000/api/noticias/noticias/';
const API_SINCRONIZAR = 'http://127.0.0.1:8000/api/noticias/noticias/sincronizar/';

// Mapa de tipo ANN → categoría de filtro y etiqueta visual
const TIPO_CATEGORIA = {
    manga:  { filtro: 'manga',      etiqueta: 'Manga',       clase: 'etiqueta--manga'      },
    anime:  { filtro: 'anime',      etiqueta: 'Anime',       clase: 'etiqueta--anime'      },
    novel:  { filtro: 'noticia',    etiqueta: 'Noticia',     clase: 'etiqueta--noticia'    },
};
const CATEGORIA_DEFECTO = { filtro: 'lanzamiento', etiqueta: 'Lanzamiento', clase: 'etiqueta--lanzamiento' };


// ------------------- ESTADO ------------------- //

let paginaActual   = 1;
let hayMasPaginas  = false;
let filtroActivo   = 'todo';
let todasLasTarjetas = [];  // guardamos los datos para re-filtrar sin pedir de nuevo


// ------------------- UTILIDADES ------------------- //

function obtenerCategoria(tipo) {
    if (!tipo) return CATEGORIA_DEFECTO;
    return TIPO_CATEGORIA[tipo.toLowerCase()] || CATEGORIA_DEFECTO;
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function obtenerImagenNoticia(noticia) {
    if (noticia.imagen_url) return noticia.imagen_url;
    // Fallback con seed del id para que cada noticia tenga imagen diferente
    return `https://picsum.photos/seed/ann-${noticia.id}/600/340`;
}


// ------------------- RENDER HERO ------------------- //

function renderizarHero(noticia) {
    const cat = obtenerCategoria(noticia.tipo);

    document.querySelector('.hero__imagen').src          = obtenerImagenNoticia(noticia);
    document.querySelector('.hero__imagen').alt          = noticia.titulo;
    document.querySelector('.hero__titulo').textContent  = noticia.titulo;
    document.querySelector('.hero__descripcion').textContent = noticia.descripcion || '';

    // Fecha
    const metaSpans = document.querySelectorAll('.hero__meta span');
    if (metaSpans.length > 0) metaSpans[0].textContent = formatearFecha(noticia.fecha_ann || noticia.created_at);

    // Etiqueta
    const etiquetaHero = document.querySelector('.hero .etiqueta');
    etiquetaHero.textContent  = cat.etiqueta;
    etiquetaHero.className    = `etiqueta ${cat.clase}`;

    // Enlace "Leer noticia"
    const enlaceHero = document.querySelector('.boton-primario');
    if (noticia.url_externa) {
        enlaceHero.href   = noticia.url_externa;
        enlaceHero.target = '_blank';
        enlaceHero.rel    = 'noopener noreferrer';
    }
}


// ------------------- RENDER TARJETAS ------------------- //

function crearTarjeta(noticia) {
    const cat    = obtenerCategoria(noticia.tipo);
    const imagen = obtenerImagenNoticia(noticia);
    const fecha  = formatearFecha(noticia.fecha_ann || noticia.created_at);
    const enlace = noticia.url_externa || '#';

    const article = document.createElement('article');
    article.className         = 'tarjeta';
    article.dataset.categoria = cat.filtro;

    article.innerHTML = `
        <a href="${enlace}" class="tarjeta__enlace-imagen" target="_blank" rel="noopener noreferrer">
            <img
                class="tarjeta__imagen"
                src="${imagen}"
                alt="${noticia.titulo}"
                loading="lazy"
                width="600"
                height="210"
            >
        </a>
        <div class="tarjeta__cuerpo">
            <span class="etiqueta ${cat.clase}">${cat.etiqueta}</span>
            <h2 class="tarjeta__titulo">
                <a href="${enlace}" class="tarjeta__enlace" target="_blank" rel="noopener noreferrer">
                    ${noticia.titulo}
                </a>
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

function renderizarTarjetas(noticias, limpiar = false) {
    const cuadricula = document.querySelector('.cuadricula-noticias');

    if (limpiar) {
        cuadricula.innerHTML = '';
        todasLasTarjetas = [];
    }

    noticias.forEach(function(noticia) {
        const tarjeta = crearTarjeta(noticia);
        cuadricula.appendChild(tarjeta);
        todasLasTarjetas.push(tarjeta);
    });

    // Aplicamos el filtro activo sobre las tarjetas nuevas
    aplicarFiltroActual();
}


// ------------------- ESTADO DE CARGA ------------------- //

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
    cuadricula.innerHTML = `
        <div class="estado-vacio">
            <p class="estado-vacio__mensaje">⚠️ ${mensaje}</p>
            <button class="boton-secundario" id="btnReintentar">Reintentar</button>
        </div>
    `;
    document.getElementById('btnReintentar')?.addEventListener('click', cargarNoticias);
}


// ------------------- API ------------------- //

async function sincronizarConANN() {
    const respuesta = await fetch(API_SINCRONIZAR, { method: 'POST' });
    if (!respuesta.ok) throw new Error('Error al sincronizar con ANN');
}

async function obtenerNoticias(pagina = 1) {
    const url       = `${API_NOTICIAS}?page=${pagina}`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) throw new Error(`Error ${respuesta.status} al obtener noticias`);

    return await respuesta.json();
}


// ------------------- CARGA PRINCIPAL ------------------- //

async function cargarNoticias() {
    mostrarSkeleton();

    try {
        let datos = await obtenerNoticias(1);

        // Si la BD está vacía, sincronizamos primero
        if (datos.count === 0) {
            await sincronizarConANN();
            datos = await obtenerNoticias(1);
        }

        paginaActual  = 1;
        hayMasPaginas = !!datos.next;

        const noticias = datos.results;

        if (!noticias || noticias.length === 0) {
            mostrarError('No hay novedades disponibles en este momento.');
            return;
        }

        // Primera noticia → hero; el resto → tarjetas
        renderizarHero(noticias[0]);
        renderizarTarjetas(noticias.slice(1), true);

        actualizarContador();
        actualizarBotonCargarMas();

    } catch (error) {
        console.error('Error al cargar noticias:', error);
        mostrarError('No se pudo conectar con el servidor. ¿Está Django corriendo?');
    }
}

async function cargarMas() {
    if (!hayMasPaginas) return;

    paginaActual++;

    try {
        const datos    = await obtenerNoticias(paginaActual);
        hayMasPaginas  = !!datos.next;

        renderizarTarjetas(datos.results, false);
        actualizarContador();
        actualizarBotonCargarMas();

    } catch (error) {
        console.error('Error al cargar más noticias:', error);
    }
}


// ------------------- FILTROS ------------------- //

function aplicarFiltroActual() {
    let cantidad = 0;

    todasLasTarjetas.forEach(function(tarjeta) {
        const categoriaTargeta = tarjeta.dataset.categoria;
        const debeVerse = (filtroActivo === 'todo') || (categoriaTargeta === filtroActivo);

        tarjeta.classList.toggle('tarjeta--oculta', !debeVerse);
        if (debeVerse) cantidad++;
    });

    actualizarContador(cantidad);
}

function actualizarContador(cantidad) {
    const conteo = document.querySelector('.conteo-resultados strong');
    if (!conteo) return;

    // Si no pasamos cantidad, contamos las visibles
    if (cantidad === undefined) {
        cantidad = todasLasTarjetas.filter(function(t) {
            return !t.classList.contains('tarjeta--oculta');
        }).length;
    }

    conteo.textContent = cantidad;
}

function actualizarBotonCargarMas() {
    const zona = document.querySelector('.zona-cargar');
    if (!zona) return;
    zona.style.display = hayMasPaginas ? 'flex' : 'none';
}


// ------------------- EVENTOS ------------------- //

document.querySelectorAll('.filtro').forEach(function(boton) {
    boton.addEventListener('click', function() {
        document.querySelectorAll('.filtro').forEach(function(b) {
            b.classList.remove('filtro--activo');
        });

        boton.classList.add('filtro--activo');
        filtroActivo = boton.dataset.filtro;
        aplicarFiltroActual();
    });
});

document.querySelector('.zona-cargar .boton-secundario')
    ?.addEventListener('click', cargarMas);


// ------------------- INICIO ------------------- //

document.addEventListener('DOMContentLoaded', cargarNoticias);