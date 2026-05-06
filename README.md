# anime'n'chill

![Django](https://img.shields.io/badge/Django-6.0-092E20?style=flat-square&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.17-red?style=flat-square&logo=django&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/DB-SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/Proyecto-TFC_DAW-orange?style=flat-square)

Plataforma web de lectura de manga y noticiero de anime en español, desarrollada como Trabajo de Fin de Ciclo del Grado Superior de Desarrollo de Aplicaciones Web (DAW).

---

## Descripción

**anime'n'chill** nació de una necesidad personal: disponer de un servicio propio donde leer manga sin restricciones y mantenerse al día con las noticias del mundo del anime y el manga, todo en español.

La aplicación combina un backend robusto con Django REST Framework y un frontend ligero en HTML, CSS y JavaScript vanilla, sin frameworks adicionales.

---

## Estado del proyecto

| Funcionalidad | Estado |
|---|---|
| Noticiero — dashboard y página de detalle | Funcional |
| Traducción automática al español con fallback | Funcional |
| Filtros por categoría (Manga / Anime / Noticias / Lanzamientos) | Funcional |
| Imagen placeholder ante errores de scraping | Funcional |
| Dark mode / Light mode | Funcional |
| Responsive (móvil, tablet, escritorio) | Funcional |
| Lector de manga | En desarrollo |
| Login y registro de usuarios con JWT | En desarrollo |
| Recuperación de contraseña | En desarrollo |

---

## Stack tecnológico

**Frontend**
- HTML5 semántico, CSS3 con variables y media queries, JavaScript Vanilla

**Backend**
- Python 3.10+ · Django 6 · Django REST Framework 3.17
- SimpleJWT — autenticación con tokens de acceso y refresco
- django-filter — filtros, búsqueda y ordenación en la API
- django-cors-headers — control de CORS para el frontend local
- BeautifulSoup4 + lxml — scraping del RSS de Anime News Network
- deep-translator — traducción automática al español con fallback
- Pillow — gestión de imágenes de portadas

**Base de datos**
- SQLite en desarrollo

**APIs externas**
- [Anime News Network RSS](https://www.animenewsnetwork.com/all/rss.xml) — fuente de noticias en tiempo real

---

## Estructura del proyecto

## Estructura del proyecto

```text
animeNchill/
├── back-end/
│   ├── anime/                    # Gestión de manga: modelos, API, filtros
│   ├── noticias/                 # Noticiero: scraper, traducción, API
│   │   ├── management/
│   │   │   └── commands/         # scrapear_noticias, retraducir_noticias
│   │   └── services/             # ann.py (RSS), sincronizacion.py
│   ├── usuarios/                 # Registro y autenticación JWT
│   ├── config/                   # Settings, URLs, WSGI
│   ├── media/
│   │   └── Manga/
│   │       └── Chainsaw Man/     # +100 capítulos organizados por volumen
│   ├── manage.py
│   └── PipRequirements.txt
└── front-end/                    # HTML, CSS, JS
```

---

## Instalación

### Requisitos previos

- Python 3.10+
- pip
- Git

### Primer arranque en un dispositivo nuevo

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

# 4. Aplicar migraciones
python manage.py migrate

# 5. Crear superusuario para el panel de administración
python manage.py createsuperuser

# 6. Arrancar el servidor
python manage.py runserver
```

La API estará disponible en `http://127.0.0.1:8000/`
El panel de administración en `http://127.0.0.1:8000/admin/`

---

## Comandos útiles

Todos los comandos se ejecutan desde dentro de `back-end/` con el entorno virtual activo.

```bash
# Activar el entorno virtual
.venv/Scripts/activate

# Arrancar el servidor de desarrollo
python manage.py runserver

# Scrapear las últimas noticias de ANN (por defecto 30, opcional --limite X)
python manage.py scrapear_noticias --limite 50

# Retraducir noticias que aún no tienen versión en español
python manage.py retraducir_noticias

# Vaciar los datos de la BD sin borrar la estructura
python manage.py flush

# Actualizar el archivo de dependencias
pip freeze > PipRequirements.txt

# Salir del entorno virtual
deactivate
```

---

## Endpoints principales (API REST)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/noticias/noticias/` | Listado de noticias con filtros y paginación |
| `GET` | `/api/noticias/noticias/<slug>/` | Detalle de una noticia |
| `GET` | `/api/noticias/noticias/sincronizar/` | Sincronización manual con ANN |
| `POST` | `/api/usuarios/token/` | Obtener tokens JWT (login) |
| `POST` | `/api/usuarios/token/refresh/` | Refrescar token de acceso |

---

## Mantenerse al día con el proyecto

```bash
git pull
cd back-end
pip install -r PipRequirements.txt
python manage.py migrate
```

---

## Autor

Adrián González Fernández — TFC DAW 2025/2026