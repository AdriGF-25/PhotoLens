// SELECTOR DE TEMAS

// Guardamos referencias a los elementos que vamos a usar
const raizHtml    = document.documentElement;   // <html>
const btnTema     = document.getElementById('btnTema');
const menuTema    = document.getElementById('menuTema');
const opcionesTema = document.querySelectorAll('.selector-tema__opcion');

// Función que aplica un tema concreto al HTML
function aplicarTema(tema) {
  // Ponemos el atributo data-tema en <html>
  raizHtml.setAttribute('data-tema', tema);

  // Marcamos la opción activa en el menú
  opcionesTema.forEach(function(opcion) {
    if (opcion.dataset.tema === tema) {
      opcion.classList.add('selector-tema__opcion--activo');
    } else {
      opcion.classList.remove('selector-tema__opcion--activo');
    }
  });

  // Cerramos el menú después de elegir
  cerrarMenuTema();
}

// Abre o cierra el menú del selector de tema
function alternarMenuTema() {
  var estaAbierto = !menuTema.hidden;

  if (estaAbierto) {
    cerrarMenuTema();
  } else {
    menuTema.hidden = false;
    btnTema.setAttribute('aria-expanded', 'true');
  }
}

function cerrarMenuTema() {
  menuTema.hidden = true;
  btnTema.setAttribute('aria-expanded', 'false');
}

// Evento: clic en el botón del icono de sol/luna
btnTema.addEventListener('click', function(evento) {
  evento.stopPropagation(); // Evita que el clic se propague al document
  alternarMenuTema();
});

// Evento: clic en cada opción del menú
opcionesTema.forEach(function(opcion) {
  opcion.addEventListener('click', function() {
    aplicarTema(opcion.dataset.tema);
  });
});

// Cierra el menú si se hace clic fuera de él
document.addEventListener('click', function() {
  cerrarMenuTema();
});

// Inicializamos los iconos de Lucide después de que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
});


// FILTROS DE CATEGORÍAS

var botonesFilto = document.querySelectorAll('.filtro');
var tarjetas     = document.querySelectorAll('.tarjeta');
var conteo       = document.querySelector('.conteo-resultados strong');

// Función que muestra solo las tarjetas de la categoría elegida
function filtrarNoticias(categoriaElegida) {
  var cantidad = 0;

  tarjetas.forEach(function(tarjeta) {
    var categoriaTargeta = tarjeta.dataset.categoria;

    // "todo" muestra todas; si no, compara categorías
    var debeVerse = (categoriaElegida === 'todo') || (categoriaTargeta === categoriaElegida);

    if (debeVerse) {
      tarjeta.classList.remove('tarjeta--oculta');
      cantidad++;
    } else {
      tarjeta.classList.add('tarjeta--oculta');
    }
  });

  // Actualizamos el contador de resultados
  if (conteo) {
    conteo.textContent = cantidad;
  }
}

// Evento: clic en cada botón de filtro
botonesFilto.forEach(function(boton) {
  boton.addEventListener('click', function() {

    // Quitamos la clase activa de todos los botones
    botonesFilto.forEach(function(b) {
      b.classList.remove('filtro--activo');
    });

    // La añadimos solo al botón pulsado
    boton.classList.add('filtro--activo');

    // Filtramos usando el atributo data-filtro del botón
    filtrarNoticias(boton.dataset.filtro);
  });
});


// HAMBURQUESA

var btnMenu = document.getElementById('btnMenu');
var nav     = document.querySelector('.nav');

btnMenu.addEventListener('click', function() {
  var estaAbierto = nav.classList.contains('nav--visible');

  if (estaAbierto) {
    nav.classList.remove('nav--visible');
    btnMenu.setAttribute('aria-expanded', 'false');
  } else {
    nav.classList.add('nav--visible');
    btnMenu.setAttribute('aria-expanded', 'true');
  }
});