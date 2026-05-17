# Paginación con persistencia de sesión — Novedades

**Fecha:** 18/05/2026
**Módulo:** `front-end/paginas/novedades/`

***

## 1. Descripción

Se sustituyó el patrón "cargar más" (acumulativo, sin retorno) por un paginador clásico con botones `<` `>` y números de página con puntos suspensivos. Se añadió persistencia de estado mediante `sessionStorage` para que el usuario pueda volver a la misma página y filtro sin perder su posición.

***

## 2. Temporalización

Sesión única — 18/05/2026

***

## 3. Requisitos

- No depender del backend para calcular el rango de páginas (se calcula en cliente con `datos.count`)
- Persistir estado solo durante la misma pestaña (no entre sesiones → `sessionStorage`, no `localStorage`)
- Mantener el filtro activo sincronizado visualmente al restaurar sesión

***

## 4. Arquitectura

| Archivo | Responsabilidad |
|---|---|
| `novedades.html` | Estructura `<nav class="paginacion">` con botones y contenedor de números |
| `novedades.css` | Estilos del paginador con responsive para 700px y 500px |
| `novedades.js` | Lógica de paginación, persistencia y sincronización de filtros |

***

## 5. Datos

- `sessionStorage` claves: `anc_noticias_pagina`, `anc_noticias_filtro`
- Total de páginas calculado en cliente: `Math.ceil(datos.count / pageSize)`
- Rango visible: página 1, página total, y ventana de ±2 alrededor de la actual

***

## Explicación clara — los tres archivos

***

### `novedades.html` — Lo que cambia

**Función del archivo:** Es la estructura de la página. Define los contenedores vacíos que el JS luego rellena con datos reales. No tiene lógica, solo "esqueleto".

| Antes | Después |
|---|---|
| `<div class="zona-cargar">` con un botón de texto | `<nav class="paginacion">` con botón `<`, contenedor de números y botón `>` |

El cambio es mínimo: un bloque de HTML por otro. Lo importante es que el `<nav>` ya tiene los selectores que el JS va a buscar: `.paginacion__btn--anterior`, `.paginacion__numeros`, `.paginacion__btn--siguiente`.

***

### `novedades.css` — Lo que se añade

**Función del archivo:** Da aspecto visual a los elementos HTML. No tiene lógica, solo apariencia.

Se añaden al final los estilos del paginador. Nada se modifica de lo anterior. Puntos clave:

- `.paginacion__numero--activo` → fondo del color de acento, texto oscuro (mismo sistema que `.filtro--activo`)
- `.paginacion__btn:disabled` → opacidad 0.3, cursor `not-allowed` → feedback visual de que no puedes ir más allá
- `.paginacion__puntos` → no es un botón, es un `<span>`, por eso no tiene `cursor: pointer`

***

### `novedades.js` — Explicación completa con ejemplos

**Función del archivo:** Toda la lógica de la página. Pide datos al backend, los pinta en el DOM, gestiona filtros y ahora también gestiona la paginación y la sesión.

***

#### Bloque 1 — Estado y constantes

```javascript
let paginaActual    = 1;
let totalPaginas    = 1;
let filtroActivo    = 'todo';
let todasLasTarjetas = [];
```

Estas cuatro variables son la "memoria de trabajo" de la página. Todo lo demás las lee o las modifica.

***

#### Bloque 2 — `sessionStorage` (nuevo)

```javascript
const SESSION_KEY_PAGINA = 'anc_noticias_pagina';
const SESSION_KEY_FILTRO = 'anc_noticias_filtro';
```

`sessionStorage` es como un bloc de notas que el navegador borra cuando cierras la pestaña. Guardamos dos cosas: en qué página estabas y qué filtro tenías activo.

**Ejemplo práctico:**

1. Estás en la página 4 con el filtro "Manga"
2. Haces clic en una noticia y la lees
3. Das al botón atrás del navegador
4. La página carga → `restaurarEstadoSesion()` lee el `sessionStorage` → `paginaActual = 4`, `filtroActivo = 'manga'` → carga directamente la página 4 con el filtro Manga ya activado

Sin esto, siempre volverías a la página 1 con el filtro "Todo".

```javascript
function guardarEstadoSesion() {
    sessionStorage.setItem(SESSION_KEY_PAGINA, paginaActual); // guarda "4"
    sessionStorage.setItem(SESSION_KEY_FILTRO, filtroActivo); // guarda "manga"
}

function restaurarEstadoSesion() {
    const paginaGuardada = sessionStorage.getItem(SESSION_KEY_PAGINA); // recupera "4"
    if (paginaGuardada) paginaActual = parseInt(paginaGuardada, 10);   // convierte a número
}
```

> ⚠️ El `parseInt(..., 10)` es obligatorio porque `sessionStorage` siempre guarda cadenas de texto (`"4"`, no `4`). Sin el `parseInt`, `paginaActual` sería el string `"4"` y las comparaciones como `paginaActual > 1` fallarían.

***

#### Bloque 3 — `renderizarPaginacion()` (nuevo — el más complejo)

Esta función dibuja los botones de número de página. Recibe el total de páginas y la página actual.

**El algoritmo de rango:**

```javascript
const rango = new Set();
rango.add(1);        // siempre la primera
rango.add(total);    // siempre la última

// ventana de ±2 alrededor de la actual, sin tocar 1 ni total
for (let i = Math.max(2, actual - 2); i <= Math.min(total - 1, actual + 2); i++) {
    rango.add(i);
}
```

**Ejemplo visual** — 20 páginas totales, estás en la 8:

```
rango = { 1, 6, 7, 8, 9, 10, 20 }
```

Al pintarlo con los puntos suspensivos queda:

```
< [1] ··· [6] [7] [8] [9] [10] ··· [20] >
                    ^activa
```

Los `···` aparecen cuando hay un salto de más de 1 entre dos números consecutivos del rango:

```javascript
if (idx > 0 && num - paginas[idx - 1] > 1) {
    // pinta los puntos suspensivos
}
```

Los botones `<` y `>` simplemente se deshabilitan en los extremos:

```javascript
btnAnterior.disabled  = actual <= 1;     // primera página → < deshabilitado
btnSiguiente.disabled = actual >= total; // última página  → > deshabilitado
```

***

#### Bloque 4 — `irAPagina()` (nuevo)

```javascript
function irAPagina(num) {
    paginaActual = num;
    guardarEstadoSesion();                        // 1. guarda en sessionStorage
    cargarPagina(num);                            // 2. pide los datos al backend
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 3. sube al inicio
}
```

Tres responsabilidades en orden: persistir → cargar → reposicionar. Se llama tanto desde los botones de número como desde `<` y `>`.

***

#### Bloque 5 — `sincronizarBotonesFiltroDom()` (nuevo)

```javascript
function sincronizarBotonesFiltroDom() {
    document.querySelectorAll('.filtro').forEach(function (boton) {
        boton.classList.toggle('filtro--activo', boton.dataset.filtro === filtroActivo);
    });
}
```

Este pequeño helper resuelve un problema concreto: cuando restauras `filtroActivo = 'manga'` desde `sessionStorage`, la variable interna cambia, pero los botones del DOM siguen pintados como si el filtro fuera "Todo". Esta función sincroniza el DOM con el estado interno. Se llama siempre después de restaurar sesión o de cambiar filtro.