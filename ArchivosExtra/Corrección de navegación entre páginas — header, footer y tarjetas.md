### Función del sistema de componentes
`componentes.js` carga `header.html` y `footer.html` de forma dinámica
mediante `fetch()` e inyecta su contenido en el DOM de cada página.
El problema clave: los `href` se resuelven **desde la página que hace el fetch**,
no desde el archivo del componente. Esto hace que las rutas relativas se dupliquen.

---

### Causa del error
| URL al abrir novedades.html | href relativo usado | Resultado |
|---|---|---|
| `/front-end/paginas/novedades/novedades.html` | `../paginas/novedades/novedades.html` | `/front-end/paginas/paginas/novedades/novedades.html` ❌ |
| `/front-end/paginas/novedades/novedades.html` | `/front-end/paginas/novedades/novedades.html` | `/front-end/paginas/novedades/novedades.html` ✅ |

---

### Archivos modificados

| Archivo | Cambio | Por qué |
|---|---|---|
| `header.html` | `href="#"` y rutas relativas → rutas absolutas `/front-end/paginas/...` | Las rutas relativas se duplicaban al resolverse desde la página cargadora |
| `header.html` | Se elimina `cabecera__enlace--activo` hardcodeado del HTML | Lo gestiona el JS dinámicamente |
| `header.html` | Se añade `data-pagina` a cada enlace | Para que `marcarEnlaceActivo()` identifique el enlace correcto |
| `footer.html` | `href="#"` → rutas absolutas donde existe página | Mismo motivo que el header |
| `header.js` | Se añade `marcarEnlaceActivo()` | Detecta la página actual por URL y aplica `cabecera__enlace--activo` |
| `novedades.js` | Enlace a detalle-noticia cambiado a ruta absoluta | La ruta relativa también se duplicaría al navegar desde otra profundidad |

---

### Función añadida — `marcarEnlaceActivo()`
```js
function marcarEnlaceActivo() {
    const nombreArchivo = window.location.pathname.split('/').pop().replace('.html', '');
    document.querySelectorAll('.cabecera__enlace[data-pagina]').forEach(function (enlace) {
        const paginaEnlace = enlace.getAttribute('data-pagina');
        enlace.classList.toggle('cabecera__enlace--activo', nombreArchivo.includes(paginaEnlace));
    });
}
````

Lee el nombre del archivo HTML de la URL actual y lo compara con el atributo
`data-pagina` de cada enlace del nav para aplicar o quitar la clase activa.

---

### Regla general aprendida
> En componentes inyectados con `fetch()`, **siempre usar rutas absolutas** desde
> la raíz del servidor (`/front-end/paginas/...`). Las rutas relativas se
> resuelven desde la página que carga el componente, no desde el componente mismo.