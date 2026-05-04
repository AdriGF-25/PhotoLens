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


// ------------------- PARALLAX HERO ------------------- //

/*
    El hero está fijo en la parte superior de la pantalla.
    Al hacer scroll, calculamos cuánto ha bajado el usuario respecto
    a la altura del hero y reducimos la opacidad proporcionalmente.
    Cuando el usuario ha scrollado más de la altura del hero, opacidad = 0.
*/
function iniciarParallax() {
    const heroImagen = document.getElementById('heroImagen');
    if (!heroImagen) return;

    window.addEventListener('scroll', function () {
        const alturaHero = document.querySelector('.hero-detalle')?.offsetHeight || 0;
        const scroll     = window.scrollY;

        // Calculamos opacidad: 1 cuando scroll=0, 0 cuando scroll >= alturaHero
        const opacidad = Math.max(0, 1 - (scroll / (alturaHero * 0.85)));
        heroImagen.style.opacity = opacidad;
    }, { passive: true });
}


// ------------------- RENDER NOTICIA PRINCIPAL ------------------- //

function renderizarNoticia(noticia) {
    // Actualizamos el título de la pestaña del navegador
    document.title = `${noticia.titulo} | anime'n'chill`;

    // ---- Hero: imagen de fondo ----
    // El hero ha sido eliminado del HTML, pero mantenemos la lógica por si se vuelve a añadir.
    const heroImagen = document.getElementById('heroImagen');
    if (heroImagen) {
        if (noticia.imagen_url) {
            heroImagen.style.backgroundImage = `url('${noticia.imagen_url}')`;
        } else {
            // Sin imagen: ocultamos el hero limpiamente
            document.querySelector('.hero-detalle')?.classList.add('oculto');
        }
    }

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
    const imagen    = document.getElementById('detalleImagen');
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
*/
    const cuerpo = document.getElementById('detalleCuerpo');
    // Guardamos el contenido original (probablemente en idioma original) para poder alternar
    const textoOriginal = noticia.contenido  || noticia.descripcion || '';
    // Por defecto mostramos la versión en español
    const textoEspanol  = noticia.contenido_es || textoOriginal;
    // Almacenar el texto original en un atributo de datos para su uso posterior
    cuerpo.dataset.original = textoOriginal;
    cuerpo.dataset.espanol = textoEspanol;
    // Estado inicial: español
    cuerpo.dataset.mostrar = 'es';

    function renderizarTexto(texto) {
        if (texto) {
            const parrafos = texto
                .split('\n')
                .filter(function (linea) { return linea.trim() !== ''; })
                .map(function (linea) { return `<p>${linea}</p>`; })
                .join('');
            cuerpo.innerHTML = parrafos || `<p>${texto}</p>`;
        } else {
            cuerpo.innerHTML = `<p>No hay descripción disponible para esta entrada.</p>`;
        }
    }

    // Renderizamos inicialmente en español
    renderizarTexto(textoEspanol);

cuerpo.querySelectorAll('a').forEach(function (enlace) {
    enlace.classList.add('enlace-externo');
    if (enlace.href && !enlace.href.includes(window.location.hostname)) {
        enlace.target = '_blank';
        enlace.rel    = 'noopener noreferrer';
    }
});

    // ---- Enlace ANN al pie del artículo ----
    // El elemento con id "detalleEnlaceAnn" ya no está presente en el HTML (se eliminó el botón redundante).
    // Por tanto, verificamos su existencia antes de intentar manipularlo para evitar errores.
    const enlaceAnn = document.getElementById('detalleEnlaceAnn');
    if (enlaceAnn) {
        if (noticia.url_externa) {
            enlaceAnn.href = noticia.url_externa;
        } else {
            enlaceAnn.style.display = 'none';
        }
    }

    // Configurar botón de toggle idioma
    const btnToggle = document.getElementById('toggleIdioma');
    if (btnToggle) {
        btnToggle.addEventListener('click', function () {
            const cuerpo = document.getElementById('detalleCuerpo');
            const mostrar = cuerpo.dataset.mostrar;
            if (mostrar === 'es') {
                // Cambiar a original
                cuerpo.dataset.mostrar = 'orig';
                // Renderizamos el texto original (sin traducción)
                cuerpo.innerHTML = cuerpo.dataset.original
                    .split('\n')
                    .filter(l => l.trim() !== '')
                    .map(l => `<p>${l}</p>`).join('');
                btnToggle.textContent = 'Español';
            } else {
                // Cambiar a español (usamos el mismo texto como placeholder)
                cuerpo.dataset.mostrar = 'es';
                cuerpo.innerHTML = cuerpo.dataset.espanol
                    .split('\n')
                    .filter(l => l.trim() !== '')
                    .map(l => `<p>${l}</p>`).join('');
                btnToggle.textContent = 'Original';
            }
        });

    }
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
        <p style="color: var(--texto-suave);">⚠️ ${mensaje}</p>
        <a href="../novedades/novedades.html" class="boton-secundario" style="margin-top:1rem; display:inline-block;">
            ← Volver a novedades
        </a>
    `;
    document.querySelector('.hero-detalle')?.classList.add('oculto');
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
        iniciarParallax();

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
        const respuesta  = await fetch(API_RELACIONADAS(noticia.id));
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
        // Pedimos los 5 mangas destacados
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
                  se implemente, y usar el campo volumen del último Progreso del usuario
                  para mostrar la portada del tomo correspondiente.
                  Por ahora, con sesión también mostramos portada general.
            */
            const portada = manga.portada || IMAGEN_PLACEHOLDER;
            const enlace  = `../lector/lector.html?manga=${manga.id}`;

            /*
                El texto del tomo solo se muestra cuando hay sesión y hay progreso.
                TODO: cuando se implemente el progreso, añadir aquí el número de tomo
                y quitar la clase 'oculto' del elemento sidebar-recomendacion__tomo.
            */
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

        /*
            PREPARADO PARA SESIÓN:
            Si el usuario está logueado, aquí llamaríamos a la API de progreso
            para actualizar cada tomo mostrado. Descomentar cuando se implemente.

            if (estaLogueado()) {
                actualizarTomosPorProgreso(mangas);
            }
        */

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
        // Pedimos los 5 animes destacados
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
                Por ahora solo mostramos la portada del anime al hacer hover.
                TODO cuando se implemente seguimiento de episodios:
                - Llamar a la API de progreso de episodios del usuario
                - Mostrar en la miniatura el episodio en el que se encuentra
                - Añadir barra de progreso visual si se desea
                El enlace apuntará a la futura página de detalle de anime.
            */
            const portada = anime.portada || IMAGEN_PLACEHOLDER;

            // TODO: cambiar este enlace cuando exista la página de detalle de anime
            const enlace  = '#';

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
                        <!--
                            STUB episodio: visible cuando se implemente progreso de anime.
                            TODO: quitar clase 'oculto' y rellenar con el episodio del usuario.
                        -->
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