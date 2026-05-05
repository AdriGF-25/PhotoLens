/* ------------------- CABECERA/NAV ---------------- */


function marcarEnlaceActivo() {
    // Obtenemos el nombre del archivo HTML de la URL actual
    // Ejemplo: ".../paginas/novedades/novedades.html" → "novedades"
    const ruta = window.location.pathname;
    const nombreArchivo = ruta.split('/').pop().replace('.html', '');

    const enlaces = document.querySelectorAll('.cabecera__enlace[data-pagina]');

    enlaces.forEach(function (enlace) {
        const paginaEnlace = enlace.getAttribute('data-pagina');

        if (nombreArchivo.includes(paginaEnlace)) {
            enlace.classList.add('cabecera__enlace--activo');
        } else {
            enlace.classList.remove('cabecera__enlace--activo');
        }
    });
}


function iniciarCabecera() {
    const botonMenu = document.getElementById("botonMenu");
    const navegacionPrincipal = document.getElementById("navegacionPrincipal");
    const enlacesNavegacion = document.querySelectorAll(".cabecera__enlace");
    const botonTema = document.getElementById("botonTema");
    const menuTema = document.getElementById("menuTema");
    const opcionesTema = document.querySelectorAll(".selector-tema__opcion");

    if (botonMenu && navegacionPrincipal) {
        botonMenu.addEventListener("click", function () {
            navegacionPrincipal.classList.toggle("cabecera__nav--visible");
        });
    }

    if (enlacesNavegacion.length > 0 && navegacionPrincipal) {
        enlacesNavegacion.forEach(function (enlace) {
            enlace.addEventListener("click", function () {
                navegacionPrincipal.classList.remove("cabecera__nav--visible");
            });
        });
    }

    if (botonTema && menuTema) {
        botonTema.addEventListener("click", function (evento) {
            evento.stopPropagation();
            menuTema.classList.toggle("selector-tema__menu--visible");
        });
    }

    if (opcionesTema.length > 0) {
        opcionesTema.forEach(function (opcion) {
            opcion.addEventListener("click", function () {
                const temaSeleccionado = opcion.getAttribute("data-tema");
                document.documentElement.setAttribute("data-tema", temaSeleccionado);

                if (menuTema) {
                    menuTema.classList.remove("selector-tema__menu--visible");
                }
            });
        });
    }

    document.addEventListener("click", function (evento) {
        const clicDentroTema = evento.target.closest(".selector-tema");
        const clicDentroNav = evento.target.closest(".cabecera__nav");
        const clicBotonMenu = evento.target.closest("#botonMenu");

        if (!clicDentroTema && menuTema) {
            menuTema.classList.remove("selector-tema__menu--visible");
        }

        if (!clicDentroNav && !clicBotonMenu && navegacionPrincipal && window.innerWidth <= 700) {
            navegacionPrincipal.classList.remove("cabecera__nav--visible");
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 700 && navegacionPrincipal) {
            navegacionPrincipal.classList.remove("cabecera__nav--visible");
        }
    });

    /* ---- NUEVO: marcar enlace activo según la página actual ---- */
    marcarEnlaceActivo();
}


iniciarCabecera();