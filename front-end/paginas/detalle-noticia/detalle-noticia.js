// ------------------- CONSTANTES ------------------- //

const API_BASE          = 'http://127.0.0.1:8000/api/noticias/noticias/';
const API_POR_SLUG      = `${API_BASE}por-slug/`;
const API_RELACIONADAS  = (id) => `${API_BASE}${id}/relacionadas/`;
const API_MANGAS        = 'http://127.0.0.1:8000/api/anime/mangas/';
const API_ANIMES        = 'http://127.0.0.1:8000/api/anime/animes/';
const IMAGEN_PLACEHOLDER = '../../assets/img/placeholder-noticia.jpg';


// ------------------- UTILIDADES ------------------- //

function obtenerSlugDeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function obtenerClaseEtiqueta(tipo) {
    const mapa = {
        manga: 'etiqueta--manga',
        anime: 'etiqueta--anime',
        novel: 'etiqueta--noticia',
    };
    return mapa[tipo?.toLowerCase()] || 'etiqueta--lanzamiento';
}

function obtenerTextoEtiqueta(tipo) {
    const mapa = {
        manga: 'Manga',
        anime: 'Anime',
        novel: 'Noticia',
    };
    return mapa[tipo?.toLowerCase()] || 'Lanzamiento';
}

/*
    Comprueba si hay un JWT en localStorage.
    Devuelve el token si existe o null si el usuario no está logueado.
    Usado para decidir qué portada mostrar en las recomendaciones.
*/
function obtenerToken() {
    return localStorage.getItem('access') || null;
}

function estaLogueado() {
    return obtenerToken() !== null;
}


// ------------------- RENDER NOTICIA PRINCIPAL ------------------- //

function renderizarNoticia(noticia) {
    // Actualizamos el título de la pestaña del navegador
    document.title = `${noticia.titulo} | anime'n'chill`;

    // ---- Etiqueta de categoría ----
    const etiqueta = document.getElementById('detalleEtiqueta');
    etiqueta.textContent = obtenerTextoEtiqueta(noticia.tipo);
    etiqueta.className   = `etiqueta ${obtenerClaseEtiqueta(noticia.tipo)}`;

    // ---- Título ----
    document.getElementById('detalleTitulo').textContent = noticia.titulo;

    // ---- Fecha ----
    const fecha = noticia.fecha_ann || noticia.created_at;
    document.getElementById('detalleFecha').textContent = formatearFecha(fecha);

    // ---- Enlace a ANN en la meta ----
    const enlaceMeta = document.getElementById('detalleFuenteEnlace');
    if (noticia.url_externa) {
        enlaceMeta.href = noticia.url_externa;
    }

    // ---- Imagen del artículo ----
    const imagen     = document.getElementById('detalleImagen');
    const contenedor = document.querySelector('.detalle-articulo__imagen-contenedor');

    if (noticia.imagen_url) {
        imagen.src = noticia.imagen_url;
        imagen.alt = noticia.titulo;
        imagen.onerror = function () {
            this.onerror = null;
            contenedor.classList.add('detalle-articulo__imagen-contenedor--oculto');
        };
    } else {
        contenedor.classList.add('detalle-articulo__imagen-contenedor--oculto');
    }

    // ---- Cuerpo del artículo ----
    /*
        Prioridad:
        1. noticia.contenido → texto completo scrapeado del artículo de ANN
        2. noticia.descripcion → intro corta del RSS (fallback)
        3. Mensaje neutro si no hay ninguno de los dos

        El texto se divide por saltos de línea y cada fragmento
        se envuelve en un <p>. No se añaden iconos ni separadores.
    */
    const cuerpo     = document.getElementById('detalleCuerpo');
    const textoFuente = noticia.contenido || noticia.descripcion || '';

    if (textoFuente) {
        const parrafos = textoFuente
            .split('\n')
            .filter(function (linea) { return linea.trim() !== ''; })
            .map(function (linea) { return `<p>${linea}</p>`; })
            .join('');

        cuerpo.innerHTML = parrafos || `<p>${textoFuente}</p>`;
    } else {
        cuerpo.innerHTML = `
            <p>No hay descripción disponible para esta entrada.</p>
            ${noticia.url_externa
                ? `<p>Puedes leer el artículo completo en
                    <a href="${noticia.url_externa}"
                       class="enlace-externo"
                       target="_blank"
                       rel="noopener noreferrer">Anime News Network</a>.
                   </p>`
                : ''
            }
        `;
    }

    cuerpo.querySelectorAll('a').forEach(function (enlace) {
        enlace.classList.add('enlace-externo');
        if (enlace.href && !enlace.href.includes(window.location.hostname)) {
            enlace.target = '_blank';
            enlace.rel    = 'noopener noreferrer';
        }
    });
}


// ------------------- ESTADO DE CARGA ------------------- //

function mostrarSkeleton() {
    document.getElementById('detalleTitulo').textContent = 'Cargando noticia...';
    document.getElementById('detalleCuerpo').innerHTML   = `
        <div class="skeleton skeleton-heading" style="height:1.5rem; width:80%; margin-bottom:1rem; border-radius:6px; background:var(--borde);"></div>
        <div class="skeleton skeleton-text"    style="height:1rem;  width:100%; margin-bottom:0.75rem; border-radius:6px; background:var(--borde);"></div>
        <div class="skeleton skeleton-text"    style="height:1rem;  width:92%;  margin-bottom:0.75rem; border-radius:6px; background:var(--borde);"></div>
        <div class="skeleton skeleton-text"    style="height:1rem;  width:85%;  border-radius:6px; background:var(--borde);"></div>
    `;
}

function mostrarError(mensaje) {
    document.getElementById('detalleTitulo').textContent = 'No se pudo cargar la noticia';
    document.getElementById('detalleCuerpo').innerHTML   = `
        <p style="color: var(--texto-suave);">Error: ${mensaje}</p>
        <a href="../novedades/novedades.html" class="boton-secundario" style="margin-top:1rem; display:inline-block;">
            ← Volver a novedades
        </a>
    `;
}


// ------------------- API ------------------- //

async function obtenerNoticiaPorSlug(slug) {
    const respuesta = await fetch(`${API_POR_SLUG}?slug=${slug}`);

    if (respuesta.status === 404) {
        throw new Error('Noticia no encontrada');
    }
    if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status} al obtener la noticia`);
    }

    return await respuesta.json();
}


// ------------------- CARGA PRINCIPAL ------------------- //

async function cargarDetalle() {
    const slug = obtenerSlugDeURL();

    if (!slug) {
        mostrarError('No se especificó ninguna noticia. Vuelve al listado.');
        return;
    }

    mostrarSkeleton();

    try {
        const noticia = await obtenerNoticiaPorSlug(slug);
        renderizarNoticia(noticia);

        // Cargamos el sidebar en paralelo sin bloquear el artículo
        cargarSidebar(noticia);

    } catch (error) {
        console.error('Error al cargar la noticia:', error);
        mostrarError('No se pudo conectar con el servidor. ¿Está Django corriendo?');
    }
}


// ------------------- SIDEBAR ------------------- //

async function cargarSidebar(noticia) {
    // Las tres secciones se cargan en paralelo para no esperar una por una
    await Promise.allSettled([
        cargarRelacionadas(noticia),
        cargarRecomendacionesMangas(),
        cargarRecomendacionesAnimes(),
    ]);
}


// ---- Noticias relacionadas ----

async function cargarRelacionadas(noticia) {
    const contenedor = document.getElementById('sidebarRelacionadas');
    if (!contenedor) return;

    try {
        const respuesta    = await fetch(API_RELACIONADAS(noticia.id));
        const relacionadas = await respuesta.json();

        if (!relacionadas.length) {
            contenedor.innerHTML = '<p style="font-size:0.85rem; color:var(--texto-muy-suave);">Sin noticias relacionadas.</p>';
            return;
        }

        contenedor.innerHTML = '';

        relacionadas.forEach(function (rel) {
            const enlace = `detalle-noticia.html?slug=${rel.slug}`;
            const fecha  = formatearFecha(rel.fecha_ann || rel.created_at);
            const imagen = rel.imagen_url || IMAGEN_PLACEHOLDER;

            const elemento = document.createElement('div');
            elemento.className = 'sidebar-noticia';
            elemento.innerHTML = `
                <a href="${enlace}">
                    <img
                        class="sidebar-noticia__imagen"
                        src="${imagen}"
                        alt="${rel.titulo}"
                        loading="lazy"
                        onerror="this.onerror=null;this.src='${IMAGEN_PLACEHOLDER}';"
                    >
                </a>
                <div class="sidebar-noticia__info">
                    <a href="${enlace}" class="sidebar-noticia__titulo">${rel.titulo}</a>
                    <span class="sidebar-noticia__fecha">${fecha}</span>
                </div>
            `;

            contenedor.appendChild(elemento);
        });

    } catch (error) {
        console.error('Error al cargar relacionadas:', error);
        contenedor.innerHTML = '<p style="font-size:0.85rem; color:var(--texto-muy-suave);">No disponible.</p>';
    }
}


// ---- Recomendaciones de manga ----

async function cargarRecomendacionesMangas() {
    const contenedor = document.getElementById('sidebarMangas');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_MANGAS}?destacado=true&page_size=5`);
        const datos     = await respuesta.json();
        const mangas    = datos.results || datos;

        if (!mangas.length) {
            contenedor.innerHTML = '<li style="font-size:0.85rem; color:var(--texto-muy-suave); padding:0.5rem;">Sin mangas disponibles.</li>';
            return;
        }

        contenedor.innerHTML = '';

        mangas.forEach(function (manga) {
            /*
                PREPARADO PARA SESIÓN:
                - Sin sesión → portada del tomo 1 (campo portada del modelo Manga)
                - Con sesión → TODO: llamar a /api/anime/mangas/{id}/mi-progreso/ cuando
                  se implemente, y usar el campo volumen del último Progreso del usuario.
            */
            const portada = manga.portada || IMAGEN_PLACEHOLDER;
            const enlace  = `../lector/lector.html?manga=${manga.id}`;

            const li = document.createElement('li');
            li.className = 'sidebar-recomendacion';
            li.innerHTML = `
                <a href="${enlace}" class="sidebar-recomendacion__enlace">
                    ${manga.titulo}
                    <div class="sidebar-recomendacion__hover">
                        <img
                            class="sidebar-recomendacion__portada"
                            src="${portada}"
                            alt="Portada de ${manga.titulo}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='${IMAGEN_PLACEHOLDER}';"
                        >
                        <!-- STUB tomo: visible solo cuando haya progreso de usuario -->
                        <span class="sidebar-recomendacion__tomo oculto" id="tomo-manga-${manga.id}">
                            Tomo ?
                        </span>
                    </div>
                </a>
            `;

            contenedor.appendChild(li);
        });

    } catch (error) {
        console.error('Error al cargar mangas recomendados:', error);
        contenedor.innerHTML = '<li style="font-size:0.85rem; color:var(--texto-muy-suave); padding:0.5rem;">No disponible.</li>';
    }
}


// ---- Recomendaciones de anime ----

async function cargarRecomendacionesAnimes() {
    const contenedor = document.getElementById('sidebarAnimes');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_ANIMES}?destacado=true&page_size=5`);
        const datos     = await respuesta.json();
        const animes    = datos.results || datos;

        if (!animes.length) {
            contenedor.innerHTML = '<li style="font-size:0.85rem; color:var(--texto-muy-suave); padding:0.5rem;">Sin animes disponibles.</li>';
            return;
        }

        contenedor.innerHTML = '';

        animes.forEach(function (anime) {
            /*
                PREPARADO PARA IMPLEMENTACIÓN FUTURA:
                - Por ahora solo muestra la portada del anime al hacer hover.
                - TODO: conectar con progreso de episodios cuando se implemente.
            */
            const portada = anime.portada || IMAGEN_PLACEHOLDER;
            const enlace  = '#'; // TODO: cambiar cuando exista página de detalle de anime

            const li = document.createElement('li');
            li.className = 'sidebar-recomendacion';
            li.innerHTML = `
                <a href="${enlace}" class="sidebar-recomendacion__enlace">
                    ${anime.titulo}
                    <div class="sidebar-recomendacion__hover">
                        <img
                            class="sidebar-recomendacion__portada"
                            src="${portada}"
                            alt="Portada de ${anime.titulo}"
                            loading="lazy"
                            onerror="this.onerror=null;this.src='${IMAGEN_PLACEHOLDER}';"
                        >
                        <!-- STUB episodio: visible cuando se implemente progreso de anime -->
                        <span class="sidebar-recomendacion__tomo oculto" id="ep-anime-${anime.id}">
                            Ep. ?
                        </span>
                    </div>
                </a>
            `;

            contenedor.appendChild(li);
        });

    } catch (error) {
        console.error('Error al cargar animes recomendados:', error);
        contenedor.innerHTML = '<li style="font-size:0.85rem; color:var(--texto-muy-suave); padding:0.5rem;">No disponible.</li>';
    }
}


// ------------------- INICIO ------------------- //

document.addEventListener('DOMContentLoaded', cargarDetalle);
