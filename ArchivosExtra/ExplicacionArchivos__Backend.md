# 📖 Explicación completa de cada archivo

## config/settings.py

**Qué es:** El cerebro de Django. Toda la configuración del proyecto vive aquí.

**Por qué existe:** Django lo necesita para saber qué apps están activas, qué base de datos usar, cómo gestionar archivos, etc.

**Qué hace cada sección:**

* **INSTALLED_APPS** → Le dice a Django qué apps existen. Si no pones tu app aquí, Django la ignora completamente. Las terceras como rest_framework o corsheaders también van aquí.
* **MIDDLEWARE** → Son capas que procesan cada petición antes de que llegue a tu vista. CorsMiddleware va el primero para que el frontend pueda hablar con el backend sin bloqueos.
* **DATABASES** → Usamos SQLite en desarrollo (no necesita instalación extra). En producción se cambiaría a PostgreSQL.
* **REST_FRAMEWORK** → Configura DRF globalmente: JWT como autenticación, paginación de 12 elementos, filtros activos por defecto.
* **SIMPLE_JWT** → El token de acceso dura 60 minutos. El de refresco 7 días y se renueva solo al usarlo.
* **CORS_ALLOW_ALL_ORIGINS** → Permite que el frontend (en otro puerto) hable con el backend. Solo para desarrollo.
* **MANGADEX_API_URL / ANN_API_URL / MANGAPI_KEY** → Las URLs de las APIs externas centralizadas aquí para no repetirlas en el código.

---

## config/urls.py

**Qué es:** El mapa de rutas principal del proyecto.

**Por qué existe:** Django necesita saber a qué vista mandar cada petición según la URL.

**Qué hace:**

* `/admin/` → Panel de administración de Django (automático).
* `/api/token/` → Devuelve un JWT al hacer login (usuario + contraseña).
* `/api/token/refresh/` → Renueva el token sin volver a hacer login.
* `include("anime.urls")` → Delega todas las rutas de la app anime a su propio archivo de URLs. Igual con noticias y usuarios.
* `static(...)` → En desarrollo sirve las imágenes subidas (avatares, portadas locales).

---

## anime/models.py

**Qué es:** La definición de la base de datos. Cada clase = una tabla.

**Por qué existe:** Django usa estos modelos para crear las tablas automáticamente con makemigrations + migrate, sin escribir SQL a mano.

### Modelos y por qué cada uno:

| Modelo   | Por qué existe                                                                          |
| -------- | --------------------------------------------------------------------------------------- |
| Genero   | Tabla de géneros reutilizable (Acción, Romance...) para no repetir texto en Manga/Anime |
| Manga    | Almacena los mangas. Tiene mangadex_id para pedir la portada a MangaDex sin descargarla |
| Anime    | Almacena los animes. Tiene tipo (TV, OVA, película...)                                  |
| Capitulo | Cada capítulo de un manga. Relación 1:N con Manga                                       |
| Episodio | Cada episodio de un anime. Relación 1:N con Anime                                       |
| Favorito | Relación N:M con datos extra entre User y Manga/Anime. Guarda la fecha y nota personal  |
| Progreso | Relación N:M con datos extra entre User y Capitulo. Guarda en qué página vas            |

**Por qué Favorito y Progreso son modelos through:**
Cuando una relación N:M necesita guardar información extra (fecha, nota, página...) no basta con un campo ManyToManyField simple. Necesitas un modelo intermedio que Django llama through model. Es un requisito explícito del enunciado.

**Por qué portada_url + portada_local:**
Dos campos porque hay dos estrategias: usar la URL de MangaDex directamente (sin descargar nada) o subir una imagen local si la API no tiene portada. La propiedad portada decide cuál usar.

---

## anime/serializers.py

**Qué es:** Los traductores entre Python y JSON.

**Por qué existe:** DRF necesita serializers para convertir los objetos de la base de datos en JSON (para las respuestas) y el JSON que llega en JSON (para guardarlo en BD).

### Patrones usados:

* **List vs Detail:** MangaListSerializer devuelve pocos campos (para listados rápidos). MangaDetailSerializer devuelve todo (para la página de detalle). Así las peticiones de lista no traen datos innecesarios.

* **Patrón mixto lectura/escritura:** En MangaDetailSerializer, generos_detalle devuelve los objetos completos al leer, pero generos acepta solo IDs al escribir. Así el frontend puede enviar `"generos": [1, 3]` y recibir `"generos_detalle": [{"nombre": "Acción"}, ...]`. Esto es un requisito del enunciado DWES.

* **SerializerMethodField:** Campos calculados que no existen en la base de datos, como portada (decide entre URL o local) o total_capitulos (cuenta los capítulos).

* **Validaciones:**

  * `validate_numero` en CapituloSerializer impide números negativos.
  * `validate` en FavoritoSerializer impide guardar manga y anime a la vez.

* **GuardarFavoritoInputSerializer:** No es un ModelSerializer. Es un serializer de entrada solo para validar los datos del @action guardar_favorito.

---

## anime/filters.py

**Qué es:** Filtros avanzados para los endpoints de listado.

**Por qué existe:** DRF por defecto no sabe filtrar por rangos de años ni por relaciones N:M. django-filter lo hace de forma limpia.

### Qué permite:

* `GET /api/mangas/?estado=ongoing` → Solo mangas en curso
* `GET /api/mangas/?anio_min=2020&anio_max=2023` → Mangas publicados entre esos años
* `GET /api/mangas/?genero=2` → Mangas que tienen el género con ID 2

Igual para animes con además filtro por tipo

---

## anime/views.py

**Qué es:** Las vistas que procesan las peticiones HTTP y devuelven respuestas.

**Por qué ModelViewSet:** Un ModelViewSet te da gratis los 5 métodos CRUD (list, create, retrieve, update, destroy) sin escribirlos. Solo sobreescribes lo que necesitas cambiar.

* **get_serializer_class:** Decide qué serializer usar según la acción. Si es list usa el ligero, si es cualquier otra usa el de detalle.
* **get_permissions:** Decide los permisos según la acción. AllowAny = cualquiera puede acceder (lectura pública). IsAuthenticated = necesita token JWT. IsAdminUser = solo el superusuario.

### Los @action:

| @action          | Dónde                | Qué hace                                                         |
| ---------------- | -------------------- | ---------------------------------------------------------------- |
| capitulos        | MangaViewSet         | Devuelve los capítulos de un manga concreto                      |
| portada_mangadex | MangaViewSet         | Llama a MangaDex, obtiene la URL de la portada y la guarda en BD |
| guardar_favorito | Manga y AnimeViewSet | Añade ese manga/anime a los favoritos del usuario logueado       |
| episodios        | AnimeViewSet         | Devuelve los episodios de un anime concreto                      |
| marcar_progreso  | CapituloViewSet      | Guarda en qué página va el usuario en ese capítulo               |
| sincronizar_ann  | NoticiaViewSet       | Llama a AnimeNewsNetwork, parsea el XML y guarda las noticias    |

---

## anime/urls.py

**Qué es:** El router de la app anime.

**Por qué existe:** El DefaultRouter de DRF genera automáticamente todas las URLs del CRUD a partir de los ViewSets. Sin él tendrías que escribir a mano 5 rutas por cada recurso.

### Qué genera automáticamente:

* `GET /api/mangas/` → lista
* `POST /api/mangas/` → crear
* `GET /api/mangas/1/` → detalle
* `PUT/PATCH /api/mangas/1/` → editar
* `DELETE /api/mangas/1/` → borrar
* `GET /api/mangas/1/capitulos/` → @action
* `POST /api/mangas/1/guardar_favorito/` → @action

---

## anime/admin.py

**Qué es:** La configuración del panel `/admin/` de Django.

**Por qué existe:** Sin registrar los modelos aquí, el panel de admin no los muestra. Con él puedes gestionar la base de datos visualmente sin tocar código.

### Cosas importantes:

* **list_display** → columnas visibles en el listado
* **list_filter** → filtros en la barra lateral
* **search_fields** → caja de búsqueda
* **filter_horizontal** → selector visual para relaciones N:M (géneros)
* **list_editable** → campos editables directamente desde el listado (ej: destacado)
* **prepopulated_fields** → el slug del género se rellena automáticamente desde el nombre

---

## noticias/models.py

**Qué es:** La tabla de noticias en la base de datos.

**Por qué ann_id con unique=True:** Cuando sincronizamos desde AnimeNewsNetwork, usamos este ID para saber si la noticia ya existe o es nueva. Así nunca se duplica.

**Por qué url_externa:** Las noticias no se almacenan enteras, solo los metadatos. El enlace apunta al artículo original en ANN.

---

## noticias/views.py

**Por qué sincronizar_ann es un @action:** Es una operación especial que no es un CRUD normal. No crea una noticia manualmente, sino que lanza un proceso automático contra una API externa. Los @action son perfectos para esto.

**Por qué parsea XML:** La API de AnimeNewsNetwork devuelve XML, no JSON. Por eso usamos xml.etree.ElementTree (librería estándar de Python, sin instalar nada extra).

**Por qué update_or_create:** Si la noticia ya existe (mismo ann_id), la actualiza. Si no existe, la crea. Así puedes llamar a sincronizar varias veces sin duplicados.

---

## usuarios/models.py

**Por qué OneToOneField y no añadir campos al User de Django:** Django no permite modificar su modelo User directamente. La solución estándar es crear un Perfil con una relación 1:1. Cada usuario tiene exactamente un perfil, y cada perfil pertenece a exactamente un usuario. Es además un requisito explícito del enunciado.

---

## usuarios/serializers.py

* **RegistroSerializer:** Tiene password y password2 para confirmar la contraseña. En el método create hace tres cosas: crea el usuario con set_password (que lo hashea, nunca se guarda en texto plano), y crea el Perfil vacío automáticamente.

* **UsuarioSerializer:** Patrón mixto 1:1 — perfil_detalle devuelve el objeto perfil completo al leer, pero no se puede escribir desde aquí (tiene su propio endpoint).

---

## usuarios/views.py

**Por qué GenericViewSet con mixins en vez de ModelViewSet:** Un ModelViewSet daría acceso a listar TODOS los usuarios, lo cual es un problema de seguridad. Con RetrieveModelMixin + UpdateModelMixin solo se puede ver y editar, y además get_object siempre devuelve request.user, así que cada usuario solo puede ver y editar su propio perfil.

**RegistroView es una CreateAPIView:** No necesita autenticación (AllowAny) porque es el endpoint de registro público.




## EXPLICACION FLUJO BACKEND
# 🔄 Flujo completo de una petición HTTP

```
PETICIÓN HTTP
     │
     ▼
┌─────────────────────────────────────────┐
│           config/urls.py                │
│                                         │
│  /api/ → include("anime.urls")          │
│                                         │
│  → Redirige a anime/urls.py             │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│           anime/urls.py                 │
│                                         │
│  router.register("mangas", MangaViewSet)│
│                                         │
│  → /api/mangas/ = MangaViewSet.list()   │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│           MIDDLEWARE (settings.py)      │
│                                         │
│  1. CorsMiddleware → ¿origen permitido? │
│  2. AuthMiddleware → ¿lleva JWT?        │
│     (en este caso no, es pública)       │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      anime/views.py → MangaViewSet      │
│                                         │
│  get_permissions() → AllowAny ✅        │
│  get_serializer_class() → ListSerializer│
│                                         │
│  filter_backends aplica:                │
│    → MangaFilter (?genero=1)            │
│    → SearchFilter (?search=)            │
│    → OrderingFilter (?ordering=)        │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      anime/filters.py → MangaFilter     │
│                                         │
│  Traduce ?genero=1 a:                   │
│  Manga.objects.filter(generos__id=1)    │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│      anime/models.py → Manga            │
│                                         │
│  Django ORM ejecuta el SQL:             │
│  SELECT * FROM anime_manga              │
│  JOIN anime_manga_generos ON ...        │
│  WHERE genero.id = 1                    │
│                                         │
│  Devuelve objetos Python Manga          │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│   anime/serializers.py                  │
│   → MangaListSerializer                 │
│                                         │
│  Convierte cada objeto Manga en dict:   │
│  {                                      │
│    "id": 1,                             │
│    "titulo": "Naruto",                  │
│    "portada": "https://uploads..."      │
│    ...                                  │
│  }                                      │
└─────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│   RESPUESTA JSON al frontend            │
│                                         │
│  {                                      │
│    "count": 24,                         │
│    "next": "/api/mangas/?page=2",       │
│    "results": [ {...}, {...} ]          │
│  }                                      │
└─────────────────────────────────────────┘
```



## EXPLICACION FLUJO ""GUARDAR FAVORITO""

# 🔄 FLUJO DE PETICIÓN Y AUTENTICACIÓN

```
PETICIÓN
  │
  ▼
config/urls.py
  │
  ▼
anime/urls.py
  │
  ▼
MangaViewSet
  │
  ▼
MIDDLEWARE AuthMiddleware
  │
  ├── Lee header:
  │     Authorization: Bearer eyJ...
  │
  ├── Verifica JWT (SimpleJWT - settings.py)
  │
  ├── ✔ Válido:
  │       request.user = usuario autenticado
  │
  └── ❌ Inválido:
          401 Unauthorized
  │
  ▼
MangaViewSet.guardar_favorito() (@action)
  │
  ▼
GuardarFavoritoInputSerializer
  │
  └── Valida datos de entrada
  │
  ▼
Favorito.objects.get_or_create(
    usuario = request.user
    manga   = manga (de la URL /5/)
)
  │
  ▼
models.py
  │
  └── Inserta registro en tabla Favorito
  │
  ▼
RESPUESTA
  │
  ▼
{
  "mensaje": "Naruto guardado en favoritos."
}
```



## MAPA MENTAL
settings.py   → configuración global (quién puede, qué BD, qué apps)
urls.py       → cartero (reparte peticiones a cada app)
middleware    → seguridad y JWT (antes de llegar a las vistas)
views.py      → lógica (qué hacer con la petición)
filters.py    → filtrado de datos (?estado=ongoing)
serializers.py→ traducción objetos ↔ JSON
models.py     → definición de tablas y consultas a BD
admin.py      → panel visual para gestionar datos
services/     → código externo (MangaDex, ANN)





<br><br>
****
<br><br>

# EXPLICACION — 18/04/2026

Lo que hemos hecho realmente se divide en dos bloques principales: **backend** y **frontend**. En backend hemos corregido la forma de sincronizar las noticias para que haya una sola lógica coherente; en frontend hemos mejorado cómo se muestran las imágenes cuando ANN no trae foto o cuando esa foto falla al cargar.

---

## 🔎 Estado actual

Antes tenías una situación un poco inconsistente:

* El scraper/command hacía una sincronización más completa (con imagen y detalle)
* El endpoint de DRF no hacía lo mismo

Resultado: dependiendo de cómo sincronizaras, la BD podía variar.

En frontend:

* Se usaba `picsum.photos` como fallback
* Visualmente rellenaba, pero semánticamente era incorrecto

---

## 🔄 Sincronización backend

### Qué pasaba antes

Dos caminos distintos:

* `scrapear_noticias.py`
* `sincronizar_ann` en `views.py`

El command:

* obtenía noticias
* creaba o recuperaba
* enriquecía con detalle

El endpoint:

* hacía `update_or_create`
* guardaba solo datos básicos

➡️ Resultado: inconsistencias

---

### ✅ Qué hicimos

Mover la lógica a un servicio compartido:

`services/sincronizacion.py`

#### Ventajas

* Centralización
* Evita duplicación
* Consistencia total

---

### ⚙️ Flujo actual

1. Pide lista a ANN
2. Recorre noticias
3. Busca por `ann_id`
4. Crea o actualiza
5. Si falta info → pide detalle
6. Completa datos
7. Devuelve resumen

---

## 🧱 Arquitectura (DWES)

* View → expone API
* Servicio → lógica negocio
* Command → reutiliza servicio
* Modelo → persistencia

---

## 🌐 Endpoint de sincronización

```python
@action(detail=False, methods=["post"], url_path="sincronizar")
```

### Significado

* `detail=False` → colección
* `POST` → acción
* URL → `/api/noticias/noticias/sincronizar/`

### Qué hace

* Lee request
* Llama servicio
* Devuelve JSON

---

## 🖼️ Placeholder de imágenes

### ❌ No en base de datos

Problemas:

* Mezcla datos reales y falsos
* Difícil mantenimiento
* Pierdes claridad

### ✅ Solución correcta

* BD → solo datos reales
* Frontend → resuelve placeholder

---

## 🧠 Lógica anterior

```js
function obtenerImagenNoticia(noticia) {
    if (noticia.imagen_url) return noticia.imagen_url;
    return `https://picsum.photos/seed/ann-${noticia.id}/600/340`;
}
```

---

## 🧠 Lógica actual

```js
const IMAGEN_PLACEHOLDER = '../../assets/img/placeholder-noticia.jpg';

function obtenerImagenNoticia(noticia) {
    if (noticia.imagen_url && noticia.imagen_url.trim() !== '') {
        return noticia.imagen_url;
    }
    return IMAGEN_PLACEHOLDER;
}
```

---

## ⚠️ Fallback con onerror

```js
img.onerror = function() {
    this.onerror = null;
    this.src = IMAGEN_PLACEHOLDER;
};
```

✔️ Evita errores de carga
✔️ Hace el frontend robusto

---

## 🎨 CSS mejoras

### object-fit

```css
object-fit: cover;
```

### object-position

```css
object-position: center;
```

### Filtros

```css
filter: saturate(1.02) contrast(1.03);
```

---

## ⚠️ Problema de UI detectado

* Hero visible
* Error visible
* Contador incorrecto
* Botón activo

➡️ Estado inconsistente

### Solución

* Limpiar grid
* Reset contador
* Ocultar botón
* Vaciar estado

---

## 🧠 Tipos de problemas

### Visual

* recorte
* calidad
* diseño

### Datos

* API falla
* backend caído
* imagen inexistente

---

## 🚀 Mejora del proyecto

* Menos duplicación
* Arquitectura limpia
* Mejor UX
* Mayor robustez

---

## 🗣️ Cómo explicarlo

* Qué: unificación + mejora visual
* Por qué: inconsistencias + mala UX
* Para qué: consistencia + estabilidad

---

## 📁 Resumen por archivo

### sincronizacion.py

* lógica central

### views.py

* usa servicio

### scrapear_noticias.py

* delega lógica

### novedades.js

* placeholder
* onerror
* estados

### novedades.css

* object-fit
* object-position
* filtros

---

## ❌ Lo que NO hicimos

* Upscaling real
* Procesado de imágenes
* Guardar placeholders en BD

---

## 🧠 Fórmula final

> Los datos reales se gestionan en backend; la apariencia y tolerancia a fallos se gestionan





