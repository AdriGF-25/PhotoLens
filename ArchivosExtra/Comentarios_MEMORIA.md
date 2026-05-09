# 📄 MEMORIA DEL PROYECTO

---

## 📅 01/04/2026

**Trabajo realizado:**
Se preparó un catálogo inicial completo de productos para el mercado de PhotoLens, usando los nombres, descripciones y archivos de imagen disponibles en la carpeta local del proyecto.

**Resultado obtenido:**
Cada producto quedó definido con datos listos para cargar en la base de datos Django, incluyendo URL directa de imagen, precio y categoría normalizada.

**Observaciones técnicas:**
Las imágenes deben guardarse como URL limpia servida desde el frontend local, y las categorías se mantienen simples para facilitar el filtrado posterior en la interfaz.

---

## 📅 01/04/2026

**Trabajo realizado:**
Se realizó commit de todos los cambios del backend Django, documentando la configuración completa de API REST con modelos, serializers, vistas y datos de prueba.

**Resultado obtenido:**
El proyecto queda en estado estable y versionado, listo para desarrollo frontend dinámico sin riesgo de pérdida de trabajo backend.

**Observaciones técnicas:**
Git permite rollback instantáneo a este punto si algo falla en el frontend; el mensaje de commit sirve como resumen técnico para la memoria del proyecto.

**Siguiente paso:**
Implementar fetch() en mercado/index.html para mostrar productos dinámicamente desde la API.

<br><br>
****
<br><br>

## 📅 01/04/2026 22:24

Se completó backend Django con API `/productos/` (13 productos reales) y se preparó mercado dinámico modular (mercado.js + CSS simple + HTML limpio). El fetch da error de conexión (probable CORS Django-LiveServer) pero la estructura está lista para conexión frontend-backend completa del Tipo 2.

<br><br>
****
<br><br>

## 📅 02/04/2026 00:17

Se dejó guardado el estado actual del proyecto con un commit y se continuó con la conexión entre el frontend y la API de Django. Como el endpoint `/productos/` ya devuelve JSON correctamente, el siguiente paso es configurar CORS para permitir que Live Server en el puerto 5500 pueda hacer peticiones al backend en el puerto 8000.

<br><br>
****
<br><br>

## 📅 07/04/2026 10:46

Se preparó un texto de comandos organizado por procesos para usarlo como guía rápida del proyecto en otro dispositivo o en tareas de mantenimiento. El contenido se simplificó para dejar solo los comandos realmente usados, con títulos en una sola línea y sin explicaciones extra para que quede limpio y fácil de copiar.

<br><br>
<br><br>

# 🚧 CAMBIO DE PROYECTO

### 🕐 17/04/2026 - 1:56

<br><br>
<br><br>

## 📅 17/04/2026

Primera página del front-end: novedades con sistema de temas visuales (claro/tarde/oscuro/noche) mediante variables CSS controladas por JS, grid responsive de tarjetas y filtro de categorías sin frameworks externos.

---

## 📅 17/04/2026

En esta parte del proyecto se reorganizó el front-end para que la cabecera, el pie de página y los temas visuales estuviesen separados en archivos propios. La idea principal fue evitar repetir el mismo código en cada página y dejar una estructura más limpia y reutilizable.

También se preparó un sistema común para cargar estos componentes desde JavaScript, de forma que las páginas solo tengan su contenido propio y compartan automáticamente los elementos generales de la web. Además, se mejoró el comportamiento de la cabecera, añadiendo navegación responsive para móvil y un selector de tema con varias opciones visuales.

Esta reorganización facilita el mantenimiento del proyecto, hace más clara la arquitectura del front-end y deja una base mejor preparada para integrar más adelante la parte dinámica con Django y Django REST Framework.

---

## 📅 17/04/2026

Se actualizó la documentación auxiliar del proyecto y el script encargado de generar el árbol de archivos. En concreto, se revisó `tr.ps1` para mantener sincronizada la estructura del repositorio con el estado real del trabajo, se regeneró `structure.txt` y se organizaron los archivos de apoyo de `ArchivosExtra` para facilitar la consulta de comandos, la explicación de la estructura y la redacción de la memoria.

Este ajuste no afecta a la funcionalidad principal de la aplicación, pero sí mejora la organización general del proyecto y ayuda a mantener un control más claro de los archivos, algo importante para la entrega y para la defensa del TFC.

---

## 📅 17/04/2026

### 🧠 Estructura base del backend Django completada

Se ha creado desde cero el backend de anime'n'chill usando Django 4.2 + Django REST Framework. El proyecto se organiza en tres apps (anime, noticias, usuarios) más la carpeta de configuración `config/`. Se han implementado todos los modelos con sus relaciones, los serializers con patrón mixto, los ViewSets con acciones personalizadas, los filtros avanzados y la autenticación JWT. Se han conectado las APIs externas de MangaDex y AnimeNewsNetwork en settings.

<br><br>
****
<br><br>

## 📅 18/04/2026 4:05

# 🔌 Integración backend Django + API Anime News Network

## 1. Descripción

Se ha implementado la primera integración de una API externa en el backend de anime'n'chill. Se conecta la API pública de Anime News Network (ANN) para obtener títulos de anime/manga recientes y almacenarlos en la base de datos local, evitando depender de la API en cada petición del frontend.

## 2. Temporalización

* Sesión única — 18/04/2026 madrugada
* Duración estimada: ~2 horas

## 3. Implementación

**App noticias completa:**

* `models.py` → Modelo Noticia con 9 campos, `unique=True` en `ann_id`
* `services/ann.py` → Comunicación con ANN
* `serializers.py` → NoticiaSerializer
* `views.py` → ViewSet con acciones
* `admin.py` → Panel admin
* `migrations/0002` → Cambios de estructura

**Errores resueltos:**

| Error           | Causa               | Solución             |
| --------------- | ------------------- | -------------------- |
| FieldError      | Campo inexistente   | Cambiar a created_at |
| admin.E033/E108 | Campo inexistente   | Ajustar admin        |
| admin.E031      | ordering mal        | Añadir coma          |
| 503             | XML mal parseado    | Usar .findtext       |
| 500 noticias    | Campo en serializer | Eliminar             |
| 500 sincronizar | Migración           | migrate              |

## 4. API utilizada

* URL: https://www.animenewsnetwork.com/encyclopedia/reports.xml
* Formato: XML
* Sin autenticación
* Límite: 1 req/s

## 5. Endpoints

```
GET  /api/noticias/noticias/
POST /api/noticias/noticias/sincronizar/
GET  /api/noticias/{id}/detalle-ann/
```

---

## Resumen para memoria — 18/04/2026

**Conexión dinámica de la página Novedades con la API REST de Django**

---

## 1. Descripción

Se ha conectado la página `novedades.html` con el backend Django para que las noticias dejen de ser contenido estático y se carguen en tiempo real desde la base de datos. El HTML pasa a ser una estructura vacía que JavaScript rellena al cargar la página.

---

## 2. Qué se ha implementado

### 🔄 Carga automática

Al entrar en la página, se hace:

* `GET /api/noticias/noticias/`
* Si la base de datos está vacía:

  * `POST /api/noticias/noticias/sincronizar/`
  * Se vuelve a solicitar la lista de noticias

### ⭐ Hero dinámico

La primera noticia devuelta por la API ocupa la sección destacada, actualizando:

* Imagen
* Título
* Descripción
* Fecha
* Etiqueta
* Enlace externo

### 📰 Tarjetas dinámicas

El resto de noticias se renderizan como tarjetas `<article>` construidas por JavaScript con `crearTarjeta()`.
Incluyen:

* Imagen
* Etiqueta
* Título
* Resumen
* Fecha
* Fuente (ANN)

### 📄 Paginación

El botón **"Cargar más"**:

* Llama a páginas sucesivas de la API
* Añade nuevas tarjetas sin borrar las anteriores

### 🎭 Estados de UI

* Mientras se carga: se muestran **6 tarjetas skeleton** con animación *shimmer*
* Si falla la petición: aparece un mensaje de error con botón de reintento

### 🎯 Filtros adaptativos

Los filtros de categoría:

* Todo
* Manga
* Anime
* Noticias
* Lanzamientos

Funcionan sobre el array `todasLasTarjetas` en memoria, sin nuevas llamadas a la API.

### 🖼️ Fallback de imagen

Si la noticia no tiene `imagen_url`:

* Se usa `https://picsum.photos`
* Con el ID de la noticia como *seed*
* Garantizando imágenes distintas por noticia

---

## 3. Archivos modificados

* `front-end/pages/novedades/novedades.js` → Reescrito completamente
* `front-end/pages/novedades/novedades.html` → Eliminadas las 8 tarjetas hardcodeadas

---

## 4. Dependencias

* Backend Django corriendo en: `http://127.0.0.1:8000`

### Endpoints activos

* `GET /api/noticias/noticias/`
* `POST /api/noticias/noticias/sincronizar/`


---

# 🧠 Bloque para la memoria

## Resumen para memoria — 18/04/2026

**Implementación del scraper de novedades e integración inicial de imágenes desde Anime News Network**

---

## 📄 Descripción

Se ha desarrollado un sistema de sincronización de novedades para la sección de noticias de *anime'n'chill*, consumiendo la API XML de Anime News Network para obtener títulos recientes, metadatos básicos e imagen asociada cuando está disponible.

La lógica se ha separado en:

* Un servicio específico (`ann.py`) para la comunicación con la API
* Un comando de gestión de Django para la importación y actualización de datos en base de datos

---

## ⏱️ Temporalización

Esta tarea se sitúa en la fase de:

* Desarrollo backend
* Conexión con fuentes externas

Dentro del bloque de trabajo relacionado con:

* Consumo de APIs
* Persistencia de datos
* Automatización de procesos del proyecto

---

## ✅ Requisitos

La solución contribuye al cumplimiento de requisitos clave del módulo **DWES**, especialmente en:

* Uso de servicios externos
* Tratamiento de datos estructurados
* Aplicación de lógica de negocio desacoplada del controlador principal

Además, mejora la experiencia de usuario al dotar a la sección de novedades de contenido actualizado automáticamente.

---

## 🏗️ Arquitectura

Se ha aplicado una separación clara de responsabilidades:

* `services/ann.py` → Cliente de la fuente externa
* Management command → Orquestación de:

  * Sincronización
  * Validación de duplicados
  * Actualización de noticias

Esta organización facilita:

* Mantenimiento
* Reutilización
* Futuras ampliaciones

Ejemplo de mejoras futuras:

* Mejor tratamiento de imágenes
* Nuevas estrategias de enriquecimiento visual

---

## 🗂️ Datos

El modelo **Noticia**:

* Almacena la URL remota de la imagen (`imagen_url`)
* No descarga el archivo físicamente

Ventajas:

* Menor complejidad
* Menor consumo de almacenamiento

Además:

* Se ha planteado un sistema de **fallback en frontend**
* Se muestra una imagen *placeholder* cuando ANN no devuelve recurso gráfico

Esto mantiene la coherencia visual en el listado de novedades.

---

# 🧠 Bloque para la memoria

## Resumen para memoria — 18/04/2026

**Unificación de la sincronización de noticias y mejora del tratamiento visual de imágenes en la página de novedades**

---

## 📄 Descripción

Se ha refactorizado la funcionalidad de sincronización de noticias procedentes de Anime News Network para evitar duplicación entre el comando de gestión de Django y el endpoint personalizado de la API REST.

Paralelamente, se ha mejorado la presentación visual de las imágenes en la página de novedades:

* Eliminación de imágenes aleatorias
* Implementación de placeholder automático en frontend cuando la fuente no devuelve imagen o esta falla al cargar

---

## ⏱️ Temporalización

Esta mejora se realiza tras:

* La integración inicial del scraper
* La primera conexión entre backend y frontend de la sección de noticias

Dentro de la fase de:

* Estabilización
* Mejora funcional del módulo de novedades

---

## ✅ Requisitos

La solución refuerza requisitos importantes del módulo **DWES**, como:

* Reutilización de lógica de negocio
* Separación de responsabilidades
* Implementación de acciones personalizadas en DRF para tareas específicas fuera de un CRUD estándar

Además, mejora la experiencia de usuario al asegurar una visualización consistente de las noticias incluso cuando la fuente externa no proporciona imágenes válidas.

---

## 🏗️ Arquitectura

Se ha introducido una capa de servicio compartida para la sincronización con ANN:

* Utilizada tanto por:

  * Management command
  * Acción `@action` del ViewSet

Esto evita comportamientos distintos según el punto de ejecución.

En frontend:

* La lógica de presentación se mantiene desacoplada de los datos persistidos
* La base de datos solo almacena URLs reales
* El placeholder se resuelve en la interfaz mediante JavaScript

---

## 🗂️ Datos

La base de datos:

* Conserva únicamente información real obtenida desde Anime News Network
* No guarda imágenes de relleno ni URLs artificiales

En frontend:

* `novedades.js` implementa un fallback automático hacia una imagen local cuando `imagen_url` está vacía o falla la carga
* `novedades.css` ajusta la representación con:

  * `object-fit`
  * `object-position`

Objetivo:

* Mejorar el encuadre
* Evitar deformaciones de imagen

---
## 📅 05/05/2026 — Corrección del sistema de navegación entre páginas

## 1. Descripción

El header y el footer son componentes compartidos cargados dinámicamente con `fetch()` desde `componentes.js`. Los `href` usaban rutas relativas que se resolvían desde la página cargadora, no desde el componente, duplicando segmentos de ruta (`/paginas/paginas/...`). Se corrigió usando rutas absolutas desde la raíz del servidor en `header.html`, `footer.html` y `novedades.js`. Adicionalmente se implementó marcado dinámico del enlace activo del nav mediante la función `marcarEnlaceActivo()` en `header.js`.

## 2. Temporalización

Sesión única — 05/05/2026.

## 3. Requisitos

- Servidor activo (Live Server / Django) para que las rutas absolutas funcionen correctamente.
    
- Estructura: `front-end/componentes/` + `front-end/paginas/`.
    

## 4. Arquitectura

Componentes inyectados via `fetch()` en `contenedor-header` y `contenedor-footer`. `header.js` se carga dinámicamente tras inyectar el componente. Páginas existentes en el momento de la corrección: `novedades`, `detalle-noticia`.

**Archivos modificados:**

|Archivo|Cambio|
|---|---|
|`header.html`|Rutas relativas → absolutas `/front-end/paginas/...`|
|`header.html`|Clase `cabecera__enlace--activo` eliminada del HTML|
|`header.html`|Atributo `data-pagina` añadido a cada enlace del nav|
|`footer.html`|Rutas relativas → absolutas donde existe página|
|`header.js`|Añadida `marcarEnlaceActivo()` para enlace activo dinámico|
|`novedades.js`|Enlace a `detalle-noticia` cambiado a ruta absoluta|

> **Regla aprendida:** en componentes inyectados con `fetch()`, siempre usar rutas absolutas desde la raíz del servidor. Las rutas relativas se resuelven desde la página que carga el componente, no desde el componente mismo.

## 5. Datos

No aplica — cambio exclusivamente de rutas y lógica de navegación.

---
# 📄 Resumen para memoria — 05/05/2026

## 1. Descripción

Se corrige el sistema completo de scraping y traducción automática de noticias de Anime News Network.

El sistema fallaba por dos motivos independientes:

- El cliente **MyMemory** tenía un límite aproximado de ~5.000 caracteres/día por IP, lo que provocaba que se agotase rápidamente y dejase el campo `contenido_es` vacío.
    
- El RSS de ANN incluía fichas de enciclopedia (`/encyclopedia/`) que no son artículos reales, por lo que nunca generan contenido traducible y terminaban contaminando la base de datos con registros vacíos.
    

---

## 2. Temporalización

- Corrección aplicada en una única sesión.
    
- No se requieren migraciones.
    
- Las noticias existentes con contenido pero sin `contenido_es` se retraducen mediante el nuevo comando:
    

```bash
python manage.py retraducir_noticias
```

---

## 3. Requisitos

Dependencias necesarias:

```txt
deep-translator==1.11.4
requests
```

Otros requisitos:

- Acceso a internet (Google Translate + MyMemory)
    

---

## 4. Arquitectura

### 📌 ann.py

Se añade filtro para evitar entradas inválidas:

```python
if "/encyclopedia/" in url_externa:
    continue
```

---

### 📌 sincronizacion.py

Cambios principales:

- Sustitución de `_traducir_con_mymemory`
    
- Nuevo método `_traducir_texto` con:
    
    - `GoogleTranslator` como principal
        
    - `MyMemoryTranslator` como fallback
        
- Reescritura de `_trocear_texto`
    

---

### 📌 management command

Ruta:

```
noticias/management/commands/retraducir_noticias.py
```

Función:

- Retraduce noticias pendientes automáticamente
    

---

## 5. Datos

- El modelo **Noticia** no sufre cambios.
    
- Eliminación manual de fichas de enciclopedia desde shell.
    

Condición clave del sistema:

```python
if not noticia_obj.contenido_es:
```

Esto garantiza que:

- Solo se procesan noticias no traducidas
    
- No se sobrescriben traducciones existentes
    

---

## ✅ Resultado

- Sistema de scraping limpio (sin entradas basura)
    
- Traducción estable sin bloqueos por límite de API
    
- Proceso de recuperación automática para noticias antiguas

---
## 📅 Resumen para memoria - 05/05/2026

Corrección de error crítico en arranque del servidor Django.

### 1. Descripción
`python manage.py runserver` fallaba con `ModuleNotFoundError: No module named 'deep_translator'` porque el import de la librería estaba en la cabecera de `noticias/services/sincronizacion.py`, cargándose en el arranque de la app.

### 2. Cambio realizado
- Se movió `from deep_translator import GoogleTranslator, MyMemoryTranslator` al interior de la función `_traducir_fragmento`.
- Se instruyó instalar `deep-translator==1.11.4` en el entorno activo.

### 3. Archivos modificados
- `noticias/services/sincronizacion.py`

---
# 📅 Resumen para memoria — 05/05/2026

## 🔐 Página de login — Fases 1 y 2 completadas

### 1. Descripción

Creación de la página de inicio de sesión de anime'n'chill.  
Página aislada sin header/footer con diseño glassmorphism sobre fondo fotográfico.

Implementa los elementos visuales completos y la lógica de UI,  
con stubs documentados para las integraciones pendientes  
(Google OAuth, localStorage, JWT).

---

### 2. Temporalización

**Sesión única — 05/05/2026**

---

### 3. Requisitos cubiertos

- HTML semántico con `<main>`, `<header>`, `<form>`, `<footer>`
    
- CSS sin framework, colores directos, fuente Inter
    
- Responsive en 4 breakpoints:
    
    - `> 1100px` → base
        
    - `1100px – 701px` → caja más estrecha
        
    - `700px – 501px` → layout en columna, padding reducido
        
    - `≤ 500px` → tamaños de fuente y padding mínimos
        
- JS vanilla sin librerías:
    
    - Toggle de contraseña con accesibilidad (`aria-pressed`)
        
    - Validación mínima de campos vacíos
        
    - Manejo de estado del botón submit (disabled + texto "Entrando...")
        

---

### 4. Arquitectura

Archivos propios en `front-end/paginas/login/`:

```text
login/  
├── login.html  
├── login.css  
└── login.js
```

CSS independiente que no afecta al resto del proyecto.  
JS sin efectos secundarios sobre otras páginas.

---

### 5. Fases pendientes

|Fase|Descripción|Estado|
|---|---|---|
|Fase 3|Google OAuth — Client ID ya configurado en Google Cloud Console|🔲 Stub listo|
|Fase 4|`localStorage` (recordar=true) / `sessionStorage` (recordar=false)|🔲 Stub listo|
|Fase 5|Conexión con `POST /api/token/` — Django REST Framework + SimpleJWT|🔲 Stub listo|
|Final|Errores inline por campo (validación detallada en cliente)|⚠️ Pendiente anotado|

---
#   📄 Resumen para memoria — 06/05/2026

## Implementación del sistema de login — anime'n'chill

---

## 1. Descripción

Se implementó el sistema de login completo partiendo de cero. Se diseñó el formulario visual, se intentó integrar Google OAuth y finalmente se optó por autenticación clásica con JWT al ser la solución viable en entorno local.

---

## 2. Temporalización

Sesión completa del 06/05/2026. Fases:

- Diseño HTML/CSS
    
- JS básico
    
- Intento Google OAuth (FedCM → popup → redirección)
    
- Descarte Google
    
- JWT funcional
    

---

## 3. Requisitos cubiertos

- Autenticación de usuarios con email y contraseña
    
- Tokens JWT (access 60 min + refresh 7 días) con SimpleJWT
    
- Persistencia de sesión con localStorage o sessionStorage según "Recuérdame"
    
- Validación de formulario con feedback visual al usuario
    
- CORS configurado con orígenes específicos
    

---

## 4. Arquitectura

```
login.html → login.js
                 ↓
        POST /api/token/  (Django SimpleJWT)
                 ↓
        { access, refresh }
                 ↓
        localStorage / sessionStorage
                 ↓
        Redirección a novedades.html
```

---

## 5. Datos

- Endpoint login: POST [http://127.0.0.1:8000/api/token/](http://127.0.0.1:8000/api/token/)
    
- Endpoint refresh: POST [http://127.0.0.1:8000/api/token/refresh/](http://127.0.0.1:8000/api/token/refresh/)
    
- Access token: 60 minutos
    
- Refresh token: 7 días con rotación activada
    
- Google OAuth descartado: Chrome bloquea FedCM en localhost sin HTTPS
  

---
Resumen para memoria - 07/05/2026

README.md creado para anime'n'chill.

1. Descripción: plataforma manga + noticiero anime, TFC DAW 2025/2026
2. Temporalización: creado en fase de primera entrega parcial (viernes 08/05)
3. Requisitos: badges de stack, tabla de estado, comandos de instalación y gestión
4. Arquitectura: estructura de carpetas documentada, endpoints principales listados
5. Datos: sin variables de entorno sensibles expuestas, SECRET_KEY marcada como insegura en dev

---
## Resumen para memoria — 07/05/2026

#### Primera entrega parcial del TFC — anime'n'chill.

Descripción: redacción del punto 1 (descripción del proyecto y ámbito de implantación) y punto 2 (temporalización y fases del desarrollo) de la memoria oficial del TFC

Temporalización: sesión del 07/05/2026, día previo a la entrega parcial del viernes 09/05

Requisitos: memoria con los dos puntos obligatorios para la primera entrega según el enunciado del proyecto intermodular DAW

Arquitectura: 1raEntrega/MEMORIA.md como versión de entrega + Diagrama_Gant_anime'n'chill.drawio.svg con el diagrama de Gantt

Datos: sin datos sensibles — documentación pura del proyecto


---
## Resumen para memoria — 09/05/2026

### Página de Registro

#### Descripción
Se ha creado la página `registro/` con tres archivos (HTML, CSS, JS). El formulario llama a `POST /api/usuarios/registro/` con los campos `username`, `email`, `first_name`, `last_name`, `password` y `password2`. Tras un `201 Created` redirige al login con el parámetro `?registro=ok`.

## Requisitos
Backend `RegistroView` + `RegistroSerializer` ya existentes. Ninguna dependencia nueva.

## Arquitectura
Mismo patrón visual que el login: fondo con imagen + overlay, caja sólida (`opacity: 0.96`), sin logo. Fila de dos columnas para nombre/apellido, colapsable a una columna en `≤500px`.

## Datos
Validación doble: cliente (campos vacíos, mínimo 6 caracteres, passwords coinciden) y servidor (respuesta de error extraída del primer campo del JSON de error de DRF).