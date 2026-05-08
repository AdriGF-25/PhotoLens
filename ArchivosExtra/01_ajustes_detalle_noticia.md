# Ajustes en la página de detalle de noticia

## Qué se hizo
- Se eliminó la separación visual entre la cabecera y el inicio del contenido de la noticia.
- Se ocultó el *hero* que mostraba una imagen de fondo difuminada.
- Se ajustaron los márgenes y paddings en los estilos CSS para que el artículo fluya sin espacios innecesarios.

## Por qué
El diseño anterior mostraba un espacio vacío y una capa translúcida que dificultaba la lectura y restaba estética al detalle de la noticia.

## Cómo
Se modificó `detalle-noticia.css` añadiendo reglas que:
```css
.hero-detalle { display: none; }
.detalle-articulo__cabecera { margin-top:0; padding-top:0; margin-bottom:0; }
.detalle-principal { padding-top:0; margin-top:0; }
```
Esto elimina el hero y los márgenes entre la cabecera y el cuerpo.
