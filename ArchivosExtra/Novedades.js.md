# `novedades.js` — Explicación completa

**Fecha:** 18/05/2026  
**Módulo:** `front-end/paginas/novedades/`

---

## ¿Qué hace este archivo?

Es el **cerebro** de la página de novedades. Se encarga de:

1. Pedir noticias al backend Django
2. Pintarlas en el DOM (hero + tarjetas)
3. Gestionar los filtros por categoría
4. Navegar entre páginas con un paginador inteligente
5. Recordar en qué página y filtro estabas al volver atrás

No modifica estilos ni estructura HTML directamente — solo **lee y escribe datos** en los contenedores que ya existen en el HTML.

---

## Estructura general del archivo

```text
CONSTANTES       → URLs, claves, mapas de categoría
ESTADO           → variables de "memoria de trabajo"
SESSION STORAGE  → guardar/restaurar/limpiar posición del usuario
UTILIDADES       → funciones de apoyo (fechas, imágenes, categorías)
RENDER HERO      → pinta la noticia destacada grande
RENDER TARJETAS  → pinta la cuadrícula de noticias
SKELETON/ERROR   → feedback visual mientras carga o si falla
API              → llamadas fetch al backend
PAGINACIÓN       → calcula y dibuja el paginador
CARGA POR PÁGINA → función principal que orquesta todo
FILTROS          → filtrado por categoría sin ir al servidor
EVENTOS          → escucha clicks del usuario
INICIO           → arranca todo cuando el DOM está listo
```

---

## 1. CONSTANTES

```javascript
const API_NOTICIAS    = 'http://127.0.0.1:8000/api/noticias/noticias/';
const API_SINCRONIZAR = 'http://127.0.0.1:8000/api/noticias/noticias/sincronizar/';
const IMAGEN_PLACEHOLDER = '../../assets/img/placeholder-noticia.jpg';

const SESSION_KEY_PAGINA = 'anc_noticias_pagina';
const SESSION_KEY_FILTRO = 'anc_noticias_filtro';
```

Se usan `UPPER_CASE` porque son valores fijos que no deben cambiar durante la ejecución. Centralizarlos aquí significa que si mañana cambia la URL del backend, solo tocas una línea.

```javascript
const TIPO_CATEGORIA = {
    manga:  { filtro: 'manga',      etiqueta: 'Manga',       clase: 'etiqueta--manga'      },
    anime:  { filtro: 'anime',      etiqueta: 'Anime',       clase: 'etiqueta--anime'      },
    novel:  { filtro: 'noticia',    etiqueta: 'Noticia',     clase: 'etiqueta--noticia'    },
};
const CATEGORIA_DEFECTO = { filtro: 'lanzamiento', etiqueta: 'Lanzamiento', clase: 'etiqueta--lanzamiento' };
```

Este mapa traduce el tipo que devuelve ANN (`manga`, `anime`, `novel`) a las tres cosas que necesita el frontend:

| Propiedad | Uso |
|---|---|
| `filtro` | valor del `data-filtro` del botón |
| `etiqueta` | texto visible en la etiqueta de color |
| `clase` | clase CSS que da el color a la etiqueta |

**Ejemplo:** ANN devuelve `tipo: "novel"` → el mapa devuelve `{ filtro: 'noticia', etiqueta: 'Noticia', clase: 'etiqueta--noticia' }`.

Si llega un tipo desconocido o `null`, se usa `CATEGORIA_DEFECTO` (Lanzamiento). Así nunca se rompe.

---

## 2. ESTADO

```javascript
let paginaActual     = 1;
let totalPaginas     = 1;
let filtroActivo     = 'todo';
let todasLasTarjetas = [];
```

Estas cuatro variables son la **memoria de trabajo** de la página. Todo el resto del código las lee o las modifica.

| Variable | Qué guarda | Ejemplo |
|---|---|---|
| `paginaActual` | En qué página está el usuario | `4` |
| `totalPaginas` | Cuántas páginas hay en total | `15` |
| `filtroActivo` | Qué filtro está seleccionado | `'manga'` |
| `todasLasTarjetas` | Array de `<article>` del DOM | `[article, article, ...]` |

---

## 3. SESSION STORAGE

`sessionStorage` es un bloc de notas del navegador que **se borra al cerrar la pestaña**. Es perfecto para "recuerda dónde estaba mientras navego".

### `guardarEstadoSesion()`

```javascript
function guardarEstadoSesion() {
    sessionStorage.setItem(SESSION_KEY_PAGINA, paginaActual); // guarda "4"
    sessionStorage.setItem(SESSION_KEY_FILTRO, filtroActivo); // guarda "manga"
}
```

Se llama cada vez que el usuario cambia de página o de filtro.

---

### `restaurarEstadoSesion()`

```javascript
function restaurarEstadoSesion() {
    const paginaGuardada = sessionStorage.getItem(SESSION_KEY_PAGINA);
    const filtroGuardado = sessionStorage.getItem(SESSION_KEY_FILTRO);

    if (paginaGuardada) paginaActual = parseInt(paginaGuardada, 10);
    if (filtroGuardado) filtroActivo = filtroGuardado;
}
```

> ⚠️ El `parseInt(..., 10)` es **obligatorio**. `sessionStorage` siempre devuelve strings. Sin esto, `paginaActual` valdría `"4"` (texto) y comparaciones como `paginaActual > 1` darían resultados incorrectos.

**Flujo completo del beneficio:**

```text
1. Usuario está en página 4, filtro "Manga"
2. Hace clic en una noticia y la lee
3. Pulsa atrás en el navegador
4. restaurarEstadoSesion() recupera página 4 y filtro "manga"
5. La página carga directamente en ese estado
```

Sin `sessionStorage`, el usuario volvería siempre a la página 1 con filtro "Todo".

---

### `limpiarEstadoSesion()`

Borra las claves guardadas. Se usa cuando el usuario pulsa "Reintentar" tras un error, para volver a empezar desde cero.

---

## 4. UTILIDADES

### `obtenerCategoria(tipo)`

```javascript
function obtenerCategoria(tipo) {
    if (!tipo) return CATEGORIA_DEFECTO;
    return TIPO_CATEGORIA[tipo.toLowerCase()] || CATEGORIA_DEFECTO;
}
```

Busca el tipo en el mapa `TIPO_CATEGORIA`. Usa `toLowerCase()` para que funcione aunque llegue `"MANGA"` o `"Manga"`. Si no encuentra el tipo, devuelve `CATEGORIA_DEFECTO`.

---

### `formatearFecha(fechaISO)`

```javascript
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    return new Date(fechaISO).toLocaleDateString('es-ES', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}
```

**Entrada:** `"2026-04-17T10:30:00Z"`  
**Salida:** `"17 abr 2026"`

---

### `obtenerImagenNoticia(noticia)`

Devuelve `imagen_url` si existe y no está vacía, o el placeholder en caso contrario. Así nunca se muestra un `src` roto.

---

### `crearAtributoOnErrorImagen()`

Devuelve el contenido del atributo `onerror` para los `<img>`. Si la imagen falla al cargar, el navegador sustituye el `src` por el placeholder automáticamente.

---

## 5. RENDER HERO

### `renderizarHero(noticia)`

Toma la **primera noticia** de la página actual y rellena la sección hero grande. Actualiza:

- `src` y `alt` de la imagen
- Título y descripción
- Fecha
- Clase CSS de la etiqueta de categoría
- `href` del botón "Leer noticia"

**¿Por qué slug y no siempre id?**

```text
/detalle-noticia.html?slug=chainsaw-man-nuevo-arco  ← legible, mejor para compartir
/detalle-noticia.html?id=42                          ← fallback si no hay slug
```

---

## 6. RENDER TARJETAS

### `crearTarjeta(noticia)`

Crea un `<article>` completo en memoria, sin añadirlo al DOM todavía. Rellena imagen, título, resumen, fecha y etiqueta. También guarda la categoría en `data-categoria`:

```html
<article class="tarjeta" data-categoria="anime">
```

Ese atributo permite al filtrado saber a qué categoría pertenece la tarjeta sin tener que releer los datos.

---

### `renderizarTarjetas(noticias)`

- Limpia la cuadrícula y vacía `todasLasTarjetas`
- Crea cada tarjeta y la inserta en el DOM
- Guarda cada tarjeta en `todasLasTarjetas` para poder filtrarlas luego
- Aplica `aplicarFiltroActual()` para que el filtro activo se refleje inmediatamente

> La primera noticia siempre va al hero. Las tarjetas empiezan desde `noticias.slice(1)`.

---

## 7. SKELETON / ERROR

### `mostrarSkeleton()`

Muestra 6 tarjetas "fantasma" con bloques grises mientras esperamos la respuesta del servidor.

```text
[██████████]    ← donde irá la imagen
[███]           ← donde irá la etiqueta
[████████████]  ← donde irá el título
[████████████]  ← donde irá el resumen
```

Evita que el usuario vea la pantalla en blanco y da sensación de carga rápida.

---

### `mostrarError(mensaje)`

Si la carga falla:

- Limpia la cuadrícula
- Vacía `todasLasTarjetas`
- Muestra el mensaje recibido
- Pone un botón "Reintentar"
- Pone el contador a 0

Al reintentar, llama a `limpiarEstadoSesion()` y vuelve a la página 1.

---

## 8. API

### `obtenerNoticias(pagina = 1)`

```javascript
async function obtenerNoticias(pagina = 1) {
    const respuesta = await fetch(`${API_NOTICIAS}?page=${pagina}`);
    if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
    return await respuesta.json();
}
```

Llama a DRF con el número de página. Si la respuesta no es 2xx, lanza un error que captura el `try/catch` de `cargarPagina()`.

DRF siempre devuelve este formato:

```json
{
  "count": 150,
  "next": "http://...?page=3",
  "previous": "http://...?page=1",
  "results": [ ...noticias... ]
}
```

---

### `sincronizarConANN()`

Hace un `POST` al endpoint que va a buscar noticias a Anime News Network y las guarda en la BD. Solo se llama si `datos.count === 0`, es decir, si la base de datos está vacía.

---

## 9. PAGINACIÓN

### `calcularTotalPaginas(datos)` ← el fix clave

```javascript
function calcularTotalPaginas(datos) {
    if (!datos.next) return paginaActual;

    try {
        const itemsPorPagina = datos.results.length;
        if (itemsPorPagina > 0 && datos.count > 0) {
            return Math.ceil(datos.count / itemsPorPagina);
        }
        const url = new URL(datos.next);
        return parseInt(url.searchParams.get('page'), 10);
    } catch (_) {
        return paginaActual + 1;
    }
}
```

**Por qué el cálculo anterior generaba páginas 404:**

```text
Tienes 150 noticias, 10 por página → 15 páginas reales
La página 15 tiene solo 3 noticias (las últimas)

Cálculo antiguo → Math.ceil(150 / 3) = 50 páginas → FALSO
Páginas 16 a 50 dan 404 porque no existen en el backend

Cálculo nuevo:
  Si next === null → página actual ES la última → totalPaginas = 15 ✓
  Si next existe  → la página actual está completa (10 items)
                 → Math.ceil(150 / 10) = 15 ✓
```

---

### `renderizarPaginacion(total, actual)`

Construye los botones del paginador dinámicamente. Algoritmo de rango:

- Siempre muestra la página 1 y la última
- Muestra una ventana de ±2 páginas alrededor de la actual
- Inserta `···` cuando hay un salto de más de 1

**Ejemplo visual — 20 páginas, estás en la 8:**

```text
rango = { 1, 6, 7, 8, 9, 10, 20 }

<  ···      ···  >[1][2][3][4]
                   ^activa
```

Los botones `<` y `>` se deshabilitan en los extremos:

```javascript
btnAnterior.disabled  = actual <= 1;      // primera página → < deshabilitado
btnSiguiente.disabled = actual >= total;  // última página  → > deshabilitado
```

---

### `irAPagina(num)`

```javascript
function irAPagina(num) {
    paginaActual = num;
    guardarEstadoSesion();                            // 1. persiste el estado
    cargarPagina(paginaActual);                       // 2. pide los datos al backend
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 3. sube al inicio
}
```

Tres responsabilidades en orden: persistir → cargar → reposicionar. Se usa tanto desde los números como desde `<` y `>`.

---

## 10. CARGA POR PÁGINA

### `cargarPagina(pagina)`

Es la función principal del archivo. Coordina todo.

**Flujo completo:**

```text
1.  mostrarSkeleton()                → feedback inmediato al usuario
2.  obtenerNoticias(pagina)          → fetch al backend
3.  Si count === 0 → sincronizarConANN() + reintentar
4.  Si no hay resultados → mostrarError() y salir
5.  calcularTotalPaginas()           → cuántas páginas hay realmente
6.  Corrección de seguridad:
      si paginaActual > totalPaginas → corregir a totalPaginas
7.  renderizarHero(noticias)      → pinta el hero
8.  renderizarTarjetas(slice(1))     → pinta la cuadrícula
9.  actualizarContador()             → actualiza "Mostrando X novedades"
10. renderizarPaginacion()           → dibuja los botones de página
11. sincronizarBotonesFiltroDom()    → marca visualmente el filtro activo
```

**La corrección del paso 6 protege este caso:**

```text
sessionStorage tenía guardada página 20
Se borran noticias → ahora solo hay 10 páginas
Sin corrección: se pide página 20 → 404
Con corrección: se redirige automáticamente a página 10
```

---

## 11. FILTROS

### `aplicarFiltroActual()`

Recorre `todasLasTarjetas` y añade o quita `tarjeta--oculta` según si la categoría coincide con `filtroActivo`. No hace ninguna petición al servidor — filtra sobre los datos que ya están en el DOM.

---

### `actualizarContador(cantidad)`

Cuenta las tarjetas visibles (sin clase `tarjeta--oculta`) y actualiza el texto "Mostrando X novedades". Si se le pasa un número directamente, lo usa sin contar.

---

### `sincronizarBotonesFiltroDom()`

```javascript
function sincronizarBotonesFiltroDom() {
    document.querySelectorAll('.filtro').forEach(function (boton) {
        boton.classList.toggle('filtro--activo', boton.dataset.filtro === filtroActivo);
    });
}
```

Resuelve un problema sutil: al restaurar `filtroActivo = 'manga'` desde `sessionStorage`, la variable interna cambia pero los botones del HTML siguen pintados con "Todo" como activo. Esta función sincroniza el DOM con el estado real. Se llama siempre tras restaurar sesión o cambiar filtro.

---

## 12. EVENTOS

### Botones de filtro

```javascript
document.querySelectorAll('.filtro').forEach(function (boton) {
    boton.addEventListener('click', function () {
        filtroActivo = boton.dataset.filtro;
        guardarEstadoSesion();
        sincronizarBotonesFiltroDom();
        aplicarFiltroActual();
    });
});
```

Cada clic: cambia el estado → guarda sesión → sincroniza botones → aplica filtro.

---

### Botones de paginación

```javascript
// Botón anterior
document.querySelector('.paginacion__btn--anterior')
    ?.addEventListener('click', function () {
        if (paginaActual > 1) irAPagina(paginaActual - 1);
    });

// Botón siguiente
document.querySelector('.paginacion__btn--siguiente')
    ?.addEventListener('click', function () {
        if (paginaActual < totalPaginas) irAPagina(paginaActual + 1);
    });
```

La condición en cada botón es la barrera de seguridad que impide salirse del rango real de páginas.

---

## 13. INICIO

```javascript
document.addEventListener('DOMContentLoaded', function () {
    restaurarEstadoSesion();
    cargarPagina(paginaActual);
});
```

`DOMContentLoaded` se dispara cuando el HTML está parseado y el DOM está listo, antes de que carguen imágenes o CSS. Es el momento correcto para empezar a trabajar con el DOM.

El orden importa:

1. Primero se restaura el estado (por si el usuario vuelve de un detalle)
2. Luego se carga la página correspondiente

---

## Funciones del archivo — resumen rápido

| Función | Qué hace |
|---|---|
| `guardarEstadoSesion()` | Guarda página y filtro en `sessionStorage` |
| `restaurarEstadoSesion()` | Recupera página y filtro de `sessionStorage` |
| `limpiarEstadoSesion()` | Borra el estado guardado |
| `obtenerCategoria(tipo)` | Traduce el tipo ANN a categoría del frontend |
| `formatearFecha(fechaISO)` | Convierte ISO a fecha legible en español |
| `obtenerImagenNoticia(noticia)` | Devuelve la imagen o el placeholder |
| `crearAtributoOnErrorImagen()` | Genera el `onerror` para imágenes rotas |
| `renderizarHero(noticia)` | Rellena el bloque hero con la primera noticia |
| `crearTarjeta(noticia)` | Crea un `<article>` con todos los datos de una noticia |
| `renderizarTarjetas(noticias)` | Limpia y reconstruye toda la cuadrícula |
| `mostrarSkeleton()` | Muestra tarjetas de carga animadas |
| `mostrarError(mensaje)` | Muestra error y botón de reintentar |
| `sincronizarConANN()` | Llama al endpoint de sincronización con ANN |
| `obtenerNoticias(pagina)` | Hace fetch de las noticias de una página |
| `calcularTotalPaginas(datos)` | Calcula el total real de páginas usando `datos.next` |
| `renderizarPaginacion(total, actual)` | Dibuja los botones numéricos del paginador |
| `irAPagina(num)` | Cambia página, guarda sesión, carga y sube arriba |
| `cargarPagina(pagina)` | Función principal — coordina todo el flujo |
| `aplicarFiltroActual()` | Muestra u oculta tarjetas según el filtro activo |
| `actualizarContador(cantidad)` | Actualiza el texto "Mostrando X novedades" |
| `sincronizarBotonesFiltroDom()` | Sincroniza visualmente el botón de filtro activo |