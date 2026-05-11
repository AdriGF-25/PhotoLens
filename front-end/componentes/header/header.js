/* ------------------- CABECERA/NAV ---------------- */


// ------------------- ICONOS SVG POR TEMA ------------------- //


const ICONOS_TEMA = {
    claro: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>`,
    oscuro: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`,
    tarde: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        <path d="M12 8a4 4 0 0 1 0 8"/>
        <line x1="2" y1="20" x2="22" y2="20"/>
    </svg>`,
    noche: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`,
};


// ------------------- UTILIDADES ------------------- //


function obtenerTemaActual() {
    return document.documentElement.getAttribute('data-tema') || 'oscuro';
}


function actualizarIconoTema() {
    const botonTema = document.getElementById('botonTema');
    if (!botonTema) return;

    const tema = obtenerTemaActual();
    botonTema.innerHTML = ICONOS_TEMA[tema] || ICONOS_TEMA['oscuro'];
}


function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    actualizarIconoTema();
    localStorage.setItem('tema', tema);
}


// ------------------- MARCADO DE ENLACE ACTIVO ------------------- //


function marcarEnlaceActivo() {
    const ruta = window.location.pathname;
    const nombreArchivo = ruta.split('/').pop().replace('.html', '');

    const enlaces = document.querySelectorAll('.cabecera__enlace[data-pagina]');

    enlaces.forEach(function(enlace) {
        const paginaEnlace = enlace.getAttribute('data-pagina');

        if (nombreArchivo.includes(paginaEnlace)) {
            enlace.classList.add('cabecera__enlace--activo');
        } else {
            enlace.classList.remove('cabecera__enlace--activo');
        }
    });
}


// ------------------- INICIAR CABECERA ------------------- //


function iniciarCabecera() {
    const botonMenu          = document.getElementById('botonMenu');
    const navegacionPrincipal = document.getElementById('navegacionPrincipal');
    const enlacesNavegacion  = document.querySelectorAll('.cabecera__enlace');
    const botonTema          = document.getElementById('botonTema');
    const menuTema           = document.getElementById('menuTema');
    const opcionesTema       = document.querySelectorAll('.selector-tema__opcion');
    const selectorTema       = document.querySelector('.selector-tema');

    // Estado: si el usuario ha fijado el menú con clic
    let menuFijado  = false;
    let timerCierre = null;


    // ---- Tema guardado ---- //
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado && ICONOS_TEMA[temaGuardado]) {
        document.documentElement.setAttribute('data-tema', temaGuardado);
    }
    actualizarIconoTema();


    // ---- Menú hamburguesa ---- //
    if (botonMenu && navegacionPrincipal) {
        botonMenu.addEventListener('click', function() {
            navegacionPrincipal.classList.toggle('cabecera__nav--visible');
        });
    }

    if (enlacesNavegacion.length > 0 && navegacionPrincipal) {
        enlacesNavegacion.forEach(function(enlace) {
            enlace.addEventListener('click', function() {
                navegacionPrincipal.classList.remove('cabecera__nav--visible');
            });
        });
    }


    // ---- Selector de tema: hover + clic combinados ---- //
    if (selectorTema && botonTema && menuTema) {

        // HOVER ENTRA en la zona .selector-tema (botón + menú)
        selectorTema.addEventListener('mouseenter', function() {
            clearTimeout(timerCierre);
            menuTema.classList.add('selector-tema__menu--visible');
        });

        // HOVER SALE de la zona .selector-tema
        selectorTema.addEventListener('mouseleave', function() {
            // Solo cerramos si no está fijado
            if (!menuFijado) {
                // Delay de 200ms para no cerrar accidentalmente
                timerCierre = setTimeout(function() {
                    menuTema.classList.remove('selector-tema__menu--visible');
                }, 200);
            }
        });

        // CLIC en el botón → fijar/desfijar el menú
        botonTema.addEventListener('click', function(evento) {
            evento.stopPropagation();

            if (menuFijado) {
                // Desfijar y cerrar
                menuFijado = false;
                menuTema.classList.remove('selector-tema__menu--visible');
            } else {
                // Fijar abierto
                menuFijado = true;
                menuTema.classList.add('selector-tema__menu--visible');
            }
        });
    }


    // ---- Opciones de tema ---- //
    if (opcionesTema.length > 0) {
        opcionesTema.forEach(function(opcion) {
            opcion.addEventListener('click', function() {
                const temaSeleccionado = opcion.getAttribute('data-tema');
                aplicarTema(temaSeleccionado);

                // Al seleccionar tema, desfijamos y cerramos
                menuFijado = false;
                if (menuTema) {
                    menuTema.classList.remove('selector-tema__menu--visible');
                }
            });
        });
    }


    // ---- Clic fuera cierra el menú ---- //
    document.addEventListener('click', function(evento) {
        const clicDentroTema = evento.target.closest('.selector-tema');
        const clicDentroNav  = evento.target.closest('.cabecera__nav');
        const clicBotonMenu  = evento.target.closest('#botonMenu');

        if (!clicDentroTema && menuTema) {
            menuFijado = false;
            menuTema.classList.remove('selector-tema__menu--visible');
        }

        if (!clicDentroNav && !clicBotonMenu && navegacionPrincipal && window.innerWidth <= 700) {
            navegacionPrincipal.classList.remove('cabecera__nav--visible');
        }
    });


    // ---- Resize ---- //
    window.addEventListener('resize', function() {
        if (window.innerWidth > 700 && navegacionPrincipal) {
            navegacionPrincipal.classList.remove('cabecera__nav--visible');
        }
    });


    // ---- Enlace activo ---- //
    marcarEnlaceActivo();
}


iniciarCabecera();