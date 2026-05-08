# Botón de cambio de idioma en detalle de noticia

## Qué se hizo
Se añadió un botón que permite al usuario alternar entre la versión original del artículo y una versión en español (por defecto).

## Por qué
Los usuarios pueden preferir leer la noticia en su idioma nativo. Como la API externa devuelve el contenido en inglés, se ofrece una alternativa de traducción (en este caso, se muestra el mismo texto como placeholder).

## Cómo
1. En `detalle-noticia.html` se insertó el botón:
```html
<button id="toggleIdioma" class="boton-primario" style="margin-left:0.5rem;">Original</button>
```
2. En `detalle-noticia.js` se guardó el texto original en `data-original` y una versión en español en `data-espanol`.
3. Se añadió un listener al botón que intercambia el contenido del elemento `#detalleCuerpo` y actualiza el texto del propio botón.

## Código clave
```js
const btnToggle = document.getElementById('toggleIdioma');
btnToggle.addEventListener('click', () => {
    const cuerpo = document.getElementById('detalleCuerpo');
    if (cuerpo.dataset.mostrar === 'es') {
        cuerpo.dataset.mostrar = 'orig';
        cuerpo.innerHTML = cuerpo.dataset.original
            .split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('');
        btnToggle.textContent = 'Español';
    } else {
        cuerpo.dataset.mostrar = 'es';
        cuerpo.innerHTML = cuerpo.dataset.espanol
            .split('\n').filter(l=>l.trim()).map(l=>`<p>${l}</p>`).join('');
        btnToggle.textContent = 'Original';
    }
});
```

## Notas
En una implementación real, se podría integrar un servicio de traducción (por ejemplo, Google Translate API) para generar la versión en español.
