# 1. Descripción del proyecto y ámbito de implantación

## ¿Qué se ha desarrollado?

anime'n'chill es una plataforma web de lectura de manga y noticiero de anime en español. La aplicación permite al usuario consultar las últimas noticias del mundo del manga y el anime, traducidas automáticamente al español desde fuentes en inglés, y leer manga organizado por volumen y capítulo directamente desde el navegador. El proyecto nació de una necesidad personal: disponer de un servicio propio, sin publicidad ni restricciones, donde centralizar tanto la lectura como la actualidad del sector.

La aplicación se divide en dos bloques funcionales. El primero es el noticiero, que obtiene noticias en tiempo real desde el RSS público de Anime News Network, las almacena en base de datos propia y las sirve al frontend traducidas al español mediante un sistema de traducción automática con doble proveedor y fallback. El segundo es el lector de manga, actualmente en desarrollo, que servirá capítulos almacenados localmente organizados por volumen y título.

## ¿Quién lo usará?

El público objetivo son aficionados al manga y al anime de habla hispana que buscan una alternativa centralizada para leer y mantenerse informados. No se requiere registro para consultar noticias, aunque el sistema de usuarios permitirá en el futuro guardar listas de lectura, marcar favoritos y recibir notificaciones de nuevos capítulos.

## ¿Qué tecnologías se han utilizado?

El proyecto sigue la modalidad Tipo 2 del enunciado: frontend en HTML, CSS y JavaScript vanilla consumiendo una API REST de elaboración propia. El backend está construido con Django 6 y Django REST Framework 3.17, con autenticación mediante tokens JWT a través de SimpleJWT. La base de datos utilizada en desarrollo es SQLite, previendo migración a PostgreSQL en producción.

Para el noticiero se utiliza el RSS público de Anime News Network como fuente de datos, procesado mediante BeautifulSoup4 y lxml. La traducción automática se realiza con la librería deep-translator, usando Google Translator como servicio principal y MyMemory como fallback en caso de fallo o límite de peticiones. La gestión de imágenes de portadas se apoya en Pillow, y el control de CORS entre frontend y backend se gestiona con django-cors-headers.

El frontend no utiliza ningún framework. Toda la interactividad, el sistema de temas visuales (modo claro y oscuro), los filtros de categoría, la paginación y la carga dinámica de componentes compartidos como la cabecera y el pie de página se implementan en JavaScript vanilla puro.

## ¿Se prevén cambios en el futuro?

El proyecto tiene previstas varias líneas de evolución una vez completadas las funcionalidades base. A corto plazo, se completará el sistema de autenticación de usuarios con registro, recuperación de contraseña y persistencia de sesión. A medio plazo se incorporará el lector de manga funcional con navegación entre páginas y progreso guardado por usuario. A largo plazo se plantea el despliegue público en una plataforma como Railway o Render, la migración de la base de datos a PostgreSQL y la ampliación del catálogo de manga disponible.


---


# 2. Temporalización del proyecto y fases del desarrollo

## Planificación y fases

El proyecto anime'n'chill surgió a partir de una necesidad personal: poder consultar noticias de anime y leer manga desde un entorno propio, sin anuncios ni redirecciones externas. La idea inicial era un proyecto más sencillo de uso local, pero al coincidir con el TFC y con la insatisfacción del proyecto anterior que se estaba desarrollando en ese momento, se tomó la decisión de reconvertirla en el proyecto definitivo del ciclo. El cambio formal se produjo el 17 de abril de 2026.

El desarrollo se ha organizado en las siguientes fases, con una dedicación total estimada de entre 24 y 27 horas:

| Fase | Descripción | Fechas | Duración estimada |
|---|---|---|---|
| 1. Decisión y planificación | Cambio de proyecto, definición de funcionalidades, elección del stack | 14/04 – 16/04/2026 | 2 h |
| 2. Frontend base | Página de novedades, sistema de temas CSS, componentes header/footer reutilizables, responsive | 17/04/2026 | 4 h |
| 3. Backend Django | Creación de las tres apps (anime, noticias, usuarios), modelos, serializers, ViewSets, JWT, filtros | 17/04/2026 | 5 h |
| 4. Integración ANN | Scraper RSS, servicio ann.py, sincronización, modelo Noticia, endpoints API | 18/04/2026 | 4 h |
| 5. Conexión frontend-backend | Carga dinámica de noticias con fetch(), hero, tarjetas, paginación, skeleton, filtros en memoria | 18/04/2026 | 3 h |
| 6. Corrección y estabilización | Navegación rota con rutas absolutas, sistema de traducción (Google + fallback MyMemory), filtrado de fichas ANN | 05/05/2026 | 4 h |
| 7. Autenticación JWT | Login completo HTML/CSS/JS conectado a SimpleJWT, descarte de Google OAuth, persistencia con localStorage | 05/05 – 06/05/2026 | 4 h |
| 8. Documentación y organización | README, variables de entorno con dotenv, .gitignore, documentación de herramientas | 07/05/2026 | 2 h |

## Retos encontrados y aprendizajes significativos

El desarrollo presentó tres retos principales que merecen destacarse.

El primero fue el scraping de imágenes desde Anime News Network. La fuente RSS no siempre devuelve una URL de imagen válida por artículo, lo que obligó a visitar la página de cada noticia para extraer la imagen mediante og:image o twitter:image. Esto añadió una capa de complejidad al servicio ann.py y obligó a implementar pausas entre peticiones para respetar el servidor. La solución definitiva incluye un sistema de imagen placeholder en el frontend para los casos en que ANN no devuelva ningún recurso gráfico, manteniendo la coherencia visual del listado.

El segundo fue el sistema de traducción automática. La implementación inicial con MyMemory como único proveedor encontró rápidamente el límite diario de la API (~5.000 caracteres por IP), lo que dejaba el campo contenido_es vacío en la mayoría de noticias. La solución fue migrar a Google Translator como servicio principal y mantener MyMemory como fallback, además de reescribir la función de troceado de texto para respetar párrafos completos y no cortar frases a mitad. Se añadió también un comando de gestión propio (retraducir_noticias) para recuperar automáticamente las noticias que habían quedado sin traducir.

El tercero fue el intento de integración de Google OAuth. Se configuró un Client ID en Google Cloud Console y se probaron tres métodos de integración (FedCM, popup y redirección), todos bloqueados por Chrome en entorno localhost sin HTTPS. La decisión de descartarlo a favor de autenticación clásica con JWT fue acertada dado el tiempo disponible y los requisitos reales del proyecto, que no requerían OAuth para funcionar correctamente.