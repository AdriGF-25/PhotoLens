<p align="center">
  <img src="front-end/assets/logo_animenchill.png" alt="anime'n'chill logo" width="300"/>
</p>

---

![Django](https://img.shields.io/badge/Django-6.0-092E20?style=flat-square&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17-red?style=flat-square&logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/DB-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/Proyecto-TFC_DAW-orange?style=flat-square)

Plataforma web de lectura de manga y noticiero de anime en español, desarrollada como Trabajo de Fin de Ciclo del Grado Superior de Desarrollo de Aplicaciones Web (DAW).

***

## Descripción

**anime'n'chill** nació de una necesidad personal: disponer de un servicio propio donde leer manga sin restricciones y mantenerse al día con las noticias del mundo del anime y el manga, todo en español.

La aplicación combina un backend robusto con Django REST Framework y un frontend ligero en HTML, CSS y JavaScript vanilla, sin frameworks adicionales.

***

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Noticiero — dashboard y página de detalle | ✅ Funcional |
| Traducción automática al español con fallback (Google + MyMemory) | ✅ Funcional |
| Filtros por categoría (Manga / Anime / Noticias / Lanzamientos) | ✅ Funcional |
| Imagen placeholder ante errores de scraping | ✅ Funcional |
| Dark mode / Light mode / Tarde / Noche | ✅ Funcional |
| Responsive (móvil, tablet, escritorio) — 4 breakpoints | ✅ Funcional |
| Paginación de noticias con persistencia de sesión | ✅ Funcional |
| Login y registro de usuarios con JWT | ✅ Funcional |
| Protección de rutas (redirección sin token) | ✅ Funcional |
| Renovación automática de token JWT caducado | ✅ Funcional |
| Página de perfil de usuario | ✅ Funcional |
| Leídos recientemente en perfil (historial real por usuario) | ✅ Funcional |
| Catálogo de manga con modal de detalle | ✅ Funcional |
| Lector de manga con páginas por capítulo | ✅ Funcional |
| Gestión de portadas desde Django Admin | ✅ Funcional |
| Progreso de lectura por usuario (localStorage) | ✅ Funcional |
| Favoritos de manga | 🔧 Backend listo, frontend pendiente |
| Recuperación de contraseña | 🔧 En desarrollo |
| Verificación de email | 🔧 Pendiente |
| Conexión en vivo con MangaDex para portadas | 🔧 En desarrollo |

***

## Stack tecnológico

**Frontend**
- HTML semántico, CSS con variables y media queries, JavaScript Vanilla

**Backend**
- Python 3.10+ · Django 6 · Django REST Framework 3.17
- SimpleJWT — autenticación con tokens de acceso (60 min) y refresco (7 días con rotación)
- django-filter — filtros, búsqueda y ordenación en la API
- django-cors-headers — control de CORS para el frontend local
- BeautifulSoup4 + lxml — scraping del RSS de Anime News Network
- deep-translator — traducción automática al español (Google Translator + fallback MyMemory)
- Pillow — gestión de imágenes de portadas

**Base de datos**
- SQLite

**APIs externas**
- [Anime News Network RSS](https://www.animenewsnetwork.com/all/rss.xml) — fuente de noticias en tiempo real
- [MangaDex API v5](https://api.mangadex.org) — metadatos, portadas

***

## Estructura del proyecto

```text
animeNchill/
├── back-end/
│   ├── anime/                        # Gestión de manga: modelos, API, filtros
│   │   ├── management/
│   │   │   └── commands/             # registrar_mangas, poblar_capitulos, metadatos_manga
│   │   └── services/                 # mangadex.py, sincronizacion.py
│   ├── noticias/                     # Noticiero: scraper, traducción, API
│   │   ├── management/
│   │   │   └── commands/             # scrapear_noticias, retraducir_noticias
│   │   └── services/                 # ann.py (RSS), sincronizacion.py
│   ├── usuarios/                     # Registro, perfil y autenticación JWT
│   ├── config/                       # Settings, URLs, WSGI
│   ├── media/
│   │   ├── Manga/                    # capítulos organizados por mangas y volumenes
│   │   └── portadas/                 # Portadas gestionadas por Django
│   ├── manage.py
│   └── PipRequirements.txt
└── front-end/
    ├── componentes/                  # header.html, footer.html, temas.css
    ├── paginas/
    │   ├── novedades/                # Noticiero principal
    │   ├── detalle-noticia/          # Detalle de una noticia
    │   ├── manga/                    # Catálogo de manga
    │   ├── lector/                   # Lector de capítulos
    │   ├── perfil/                   # Perfil de usuario
    │   ├── login/                    # Inicio de sesión
    │   └── registro/                 # Registro de nuevos usuarios
    └── assets/                       # Imágenes placeholder y logo
```

***

## Instalación

### Requisitos previos

- Python 3.10+
- pip
- Git

### Primer arranque en un dispositivo nuevo

> **Base de datos:** El proyecto usa SQLite. El archivo `db.sqlite3` **no se incluye en el repositorio** y se genera automáticamente al ejecutar las migraciones. Para disponer de contenido visible tras el arranque, ejecuta los comandos de población del paso 7.

```bash
# 1. Clonar el repositorio
git clone https://github.com/AdriGF-25/animeNchill.git
cd animeNchill

# 2. Crear y activar el entorno virtual
python -m venv .venv
.venv/Scripts/activate          # Windows
source .venv/bin/activate       # Linux / macOS

# 3. Entrar al backend e instalar dependencias
cd back-end
pip install -r PipRequirements.txt

# 4. Aplicar migraciones (crea el archivo db.sqlite3 automáticamente)
python manage.py migrate

# 5. Crear superusuario para el panel de administración
python manage.py createsuperuser

# 6. Arrancar el servidor
python manage.py runserver

# 7. Poblar la base de datos con contenido inicial
#    (necesario para ver noticias y catálogo de manga en el frontend)

# Scrapear las últimas noticias de Anime News Network
python manage.py scrapear_noticias --limite 30

# Menu de comandos 
python manage.py menu_comandos

  # Con el comando anterior puedes ejecutar los siguiente:

    # Registrar mangas desde la carpeta media/Manga/
    python manage.py registrar_mangas

    # Crear los capítulos a partir de las subcarpetas
    python manage.py poblar_capitulos

    # Obtener portadas y metadatos desde MangaDex
    python manage.py metadatos_manga
```

La API estará disponible en `http://127.0.0.1:8000/`
El panel de administración en `http://127.0.0.1:8000/admin/`

***

## Comandos útiles

Todos los comandos se ejecutan desde dentro de `back-end/` con el entorno virtual activo.

```bash
# Activar el entorno virtual
.venv/Scripts/activate

# Arrancar el servidor de desarrollo
python manage.py runserver

# ── NOTICIAS ──────────────────────────────────────────────────────────
# Scrapear y sincronizar las últimas noticias de ANN (por defecto 30, opcional --limite X)
python manage.py scrapear_noticias --limite 50

# Retraducir noticias que aún no tienen versión en español
python manage.py retraducir_noticias

# ── MANGA ─────────────────────────────────────────────────────────────
# 1. Registrar mangas desde la carpeta media/Manga/ en la BD
python manage.py registrar_mangas

# 2. Crear objetos Capitulo desde las subcarpetas de cada manga
python manage.py poblar_capitulos

# 3. Obtener portadas y metadatos desde la API de MangaDex
python manage.py metadatos_manga

# ── BASE DE DATOS ──────────────────────────────────────────────────────
# Vaciar los datos de la BD sin borrar la estructura
python manage.py flush

# ── DEPENDENCIAS ───────────────────────────────────────────────────────
# Actualizar el archivo de dependencias
pip freeze > PipRequirements.txt

# Salir del entorno virtual
deactivate
```

***

## Endpoints principales (API REST)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/noticias/noticias/` | Listado de noticias con filtros y paginación |
| `GET` | `/api/noticias/noticias/<slug>/` | Detalle de una noticia |
| `GET` | `/api/noticias/noticias/sincronizar/` | Sincronización manual con ANN |
| `GET` | `/api/anime/mangas/` | Listado del catálogo de manga |
| `GET` | `/api/anime/mangas/<id>/` | Detalle de un manga |
| `GET` | `/api/anime/capitulos/<id>/paginas/` | Páginas de un capítulo (lector) |
| `GET` | `/api/anime/mangas/<id>/portada-mangadex/` | Portada desde MangaDex |
| `POST` | `/api/usuarios/token/` | Obtener tokens JWT (login) |
| `POST` | `/api/usuarios/token/refresh/` | Refrescar token de acceso |
| `POST` | `/api/usuarios/registro/` | Registro de nuevo usuario |
| `GET` | `/api/usuarios/perfil/` | Datos del usuario autenticado |
| `PATCH` | `/api/usuarios/perfil/editar/` | Editar datos del perfil |

***

## Mantenerse al día con el proyecto

```bash
git pull
cd back-end
pip install -r PipRequirements.txt
python manage.py migrate
```

***

## Autor

Adrián González Fernández — TFC DAW 2025/2026