## 1. Página `novedades` — análisis del código existente

### Qué es

La página de novedades (`/paginas/novedades/`) es el **noticiero** del proyecto.
Muestra noticias sincronizadas desde Anime News Network (ANN) a través de la API de Django.

### Cómo funciona
DOMContentLoaded
└── cargarNoticias()
├── mostrarSkeleton() → pone 6 tarjetas fantasma mientras carga
├── obtenerNoticias(pagina=1) → GET /api/noticias/noticias/?page=1
│ └── si BD vacía → sincronizarConANN() → POST /api/noticias/sincronizar/
├── renderizarHero(noticias) → primera noticia ocupa el hero
└── renderizarTarjetas(resto) → el resto van a la cuadrícula 3 columnas

text

### Funciones clave

| Función | Qué hace | Por qué existe |
|---|---|---|
| `mostrarSkeleton()` | Inserta 6 artículos vacíos animados | UX: el usuario ve que algo está cargando |
| `sincronizarConANN()` | POST al endpoint Django que scrapa ANN | Evita BD vacía en primer arranque |
| `renderizarHero()` | Rellena título, imagen, etiqueta del hero | La noticia destacada tiene diseño propio |
| `crearTarjeta()` | Crea un `<article>` con imagen, título y pie | Reutilizable para cualquier noticia |
| `aplicarFiltroActual()` | Oculta/muestra tarjetas por categoría | Filtrado sin volver a pedir datos a la API |
| `cargarMas()` | Pide la siguiente página a DRF | Paginación lazy sin recargar la página |

### Patrón de datos ANN → categoría visual

```js
const TIPO_CATEGORIA = {
    manga:  { filtro: 'manga',      etiqueta: 'Manga',    clase: 'etiqueta--manga'   },
    anime:  { filtro: 'anime',      etiqueta: 'Anime',    clase: 'etiqueta--anime'   },
    novel:  { filtro: 'noticia',    etiqueta: 'Noticia',  clase: 'etiqueta--noticia' },
}
```

Si el tipo no está en el mapa → se usa `CATEGORIA_DEFECTO` (Lanzamiento).

---

## 2. Servicios back-end (`anime/services/`)

### Qué es

Una **capa de servicios** es código que se separa de las vistas y modelos.
Su única responsabilidad es hablar con APIs externas o hacer operaciones complejas.
Las vistas llaman a los servicios; los servicios no saben nada de HTTP.
back-end/
└── anime/
└── services/
├── _init_.py → registra el módulo Python
├── mangadex.py → cliente para la API pública de MangaDex
├── sincronizacion.py → lógica de sincronización manga ↔ BD
└── scrapear_portadas.py → descarga y guarda portadas localmente

text

### `mangadex.py` — ¿qué hace?

Habla con `https://api.mangadex.org`.  
Obtiene metadatos de manga (título, autor, géneros, estado, portada).  
Devuelve datos limpios que `sincronizacion.py` puede guardar en BD.

### `sincronizacion.py` — ¿qué hace?

Toma los datos de `mangadex.py` y los guarda en los modelos Django:
- `Manga` → título, descripción, autor, estado, géneros, portada_url
- `Capitulo` → número, volumen, fecha

Usa `update_or_create` para no duplicar registros si se sincroniza varias veces.

### `scrapear_portadas.py` — ¿qué hace?

Descarga la imagen de `portada_url` y la guarda en `media/Portadas/Manga/`.  
Rellena el campo `portada_local` del modelo Manga.  
Razón: si MangaDex cae o cambia la URL, la portada sigue disponible localmente.

---

## 3. Assets front-end

### Placeholders añadidos

| Archivo | Dónde se usa |
|---|---|
| `placeholder-noticia.jpg` | Tarjetas de noticias sin imagen propia |
| `placeholder-logo.png` | Logos de anime/manga sin imagen |
| `placeholder-portada.jpg` | Portadas de manga sin imagen en la cuadrícula |

Todos están en `front-end/assets/`.  
En el JS se usan como fallback con `onerror` en las etiquetas `<img>`:

```js
onerror="this.onerror=null; this.src='../../assets/img/placeholder-noticia.jpg';"
```

---

## 4. Página `manga` — estructura diseñada

### Qué se construyó hoy

La estructura HTML completa de la página de manga con tres zonas:

#### 4.1 Sección "Continuar leyendo"

Inspirada en la función **"Continue Watching"** de Crunchyroll.  
Muestra en horizontal los manga que el usuario ha empezado.  
El progreso se guarda en `localStorage` con la clave `anc_progreso_manga`.

```js
// Estructura guardada por manga
{
  "42": {
    capituloId: 318,
    capituloNumero: 7,
    capituloTitulo: "El despertar",
    fecha: "2026-05-14T02:15:00.000Z"
  }
}
```

Cada tarjeta de continuar muestra:
- Portada pequeña
- Título del manga
- Número del capítulo donde se quedó
- Barra de progreso estimada (capítulo leído / total capítulos)

#### 4.2 Cuadrícula de manga

Grid CSS `auto-fill` con tarjetas de aspecto `2/3` (proporción portada manga estándar).  
Cada tarjeta tiene:
- Portada con zoom suave al hover
- Badge de estado (ongoing / completed / hiatus / cancelled) con colores semánticos
- Barra de progreso en el borde inferior de la portada si hay lectura guardada
- Título, autor, número de capítulo leído

Al hacer click → se abre el modal (no navega).

#### 4.3 Modal de detalle

Ventana emergente con:
- Portada grande
- Etiquetas de estado y géneros
- Título, autor, descripción
- Botón **"▶ Continuar — Cap. X"** (aparece solo si hay progreso guardado)
- Botón **"Empezar a leer"** / "Empezar desde el principio"
- Lista de capítulos **agrupados por volumen**, colapsables
- Capítulos leídos marcados con ✓ y opacidad reducida
- Capítulo actual resaltado con borde dorado

#### 4.4 Flujo de navegación
Click en tarjeta
└── abrirModal(manga)
├── Rellena datos básicos (portada, título...)
├── Muestra overlay inmediatamente
└── fetch GET /api/manga/capitulos/?manga=ID&ordering=volumen,numero
└── renderizarCapitulosEnModal()
└── agruparPorVolumen()

Click en capítulo o botón continuar
└── guardarProgreso(mangaId, capitulo) → localStorage
└── cerrarModal()
└── irACapitulo(mangaId, capituloId)
└── window.location → /lector/lector.html?manga=ID&capitulo=ID

text

---

## 5. Modelos Django relevantes

### Manga

```python
class Manga(models.Model):
    mangadex_id      # UUID de MangaDex
    titulo
    titulo_original
    descripcion
    autor
    anio_publicacion
    estado           # ongoing / completed / hiatus / cancelled
    portada_url      # URL externa (MangaDex)
    portada_local    # ImageField → media/Portadas/Manga/
    generos          # ManyToMany → Genero
    destacado        # BooleanField
    created_at / updated_at

    @property
    def portada():
        # Devuelve local si existe, sino URL externa
```

### Capitulo

```python
class Capitulo(models.Model):
    manga            # FK → Manga (CASCADE)
    numero           # DecimalField (permite 7.5, capítulos especiales)
    titulo
    volumen          # PositiveIntegerField, nullable
    ruta_imagenes    # Ruta al directorio de páginas
    fecha_publicacion
```

### Progreso

```python
class Progreso(models.Model):
    usuario          # FK → User
    capitulo         # FK → Capitulo
    fecha_lectura    # auto_now
    completado       # BooleanField
    pagina_actual    # PositiveIntegerField
    # Unique: (usuario, capitulo)
```

> **Nota**: el progreso del front se guarda en `localStorage` (sin login).  
> Cuando se implemente autenticación, se migrará a sincronizar con el modelo `Progreso` de Django.

---

## 6. Archivos de soporte

| Archivo | Qué es |
|---|---|
| `structure.txt` | Árbol de carpetas del proyecto actualizado |
| `tr.ps1` | Script PowerShell para tareas rápidas en Windows |
| `listadoComandos.txt` | Referencia de comandos Git, Django y Python usados |
| `.gitignore` | Exclusiones actualizadas (venv, __pycache__, .env, media/) |
| `Comentarios_MEMORIA.md` | Notas de la sesión para el documento de memoria del TFC |

---

## 7. Pendiente (próxima sesión)

- [ ] Crear página `lector.html` (recibe `?manga=ID&capitulo=ID`)
- [ ] Implementar visor de páginas del capítulo
- [ ] Sincronizar progreso `localStorage` ↔ modelo `Progreso` Django (requiere auth)
- [ ] Crear carpeta `front-end/assets/logos/` para logos de anime/manga
- [ ] Rellenar `manga.css` y `manga.js` con el diseño definitivo