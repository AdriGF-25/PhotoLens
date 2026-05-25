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


---

## Resumen para memoria — 11/05/2026

---

## `login.js` — Cambios

**Función del archivo:** Gestiona toda la lógica del formulario de inicio de sesión: validación de campos, comunicación con la API JWT, almacenamiento de tokens y redirección según estado de sesión.

---

## Funciones eliminadas / modificadas

|Función|Qué cambió|Por qué|
|---|---|---|
|`redirigirSiLogueado()`|Movida al **principio** del archivo|Antes se ejecutaba al final, después de montar eventos. Ahora corta la ejecución inmediatamente si hay token, evitando montar listeners innecesarios|
|`mostrarBannerRegistro()`|Ahora usa `document.getElementById("bannerExito")` en vez de crear un `div` nuevo|El HTML ya tenía el elemento `#bannerExito`. Crear uno nuevo duplicaba el banner y generaba inconsistencias visuales|
|`iniciarSesion()`|Parámetro `email` renombrado a `username`|El campo del formulario es nombre de usuario, no email. Se corrige la coherencia semántica|

## Funciones añadidas

Ninguna nueva. Solo correcciones sobre las existentes.

---

## `registro.js` — Cambios

**Función del archivo:** Gestiona el formulario de creación de cuenta: validación en cliente, envío a la API de registro, manejo de errores del servidor y redirección al login tras registro exitoso.

---

## Funciones añadidas

|Función|Qué hace|Por qué|
|---|---|---|
|`redirigirSiLogueado()` (IIFE)|Comprueba si existe `access_token` en localStorage o sessionStorage. Si existe, redirige a novedades|Sin esta guarda, un usuario logueado podía acceder a `/registro.html` escribiendo la URL directamente, lo cual no tiene sentido funcionalmente|

---

## Flujo completo de autenticación (resultado final)

text

`Usuario no logueado     │    ├─ Entra en login.html      → ve el formulario    ├─ Entra en registro.html   → ve el formulario    │ Usuario logueado     │    ├─ Entra en login.html      → redirige a novedades (redirigirSiLogueado)    ├─ Entra en registro.html   → redirige a novedades (redirigirSiLogueado)    │ Registro exitoso     │    └─ registro.js → redirige a login.html?registro=ok                          │                          └─ login.js mostrarBannerRegistro()                                │                                └─ muestra #bannerExito del HTML`

---

## Decisiones técnicas relevantes

**¿Por qué `sessionStorage` por defecto y no `localStorage`?**  
Por seguridad. Si el usuario no marca "Recuérdame", los tokens se borran al cerrar el navegador. Así se evita que una sesión quede abierta en un dispositivo compartido.

**¿Por qué `??` en vez de `||` para leer el token?**

js

`const token = localStorage.getItem("access_token")             ?? sessionStorage.getItem("access_token");`

El operador `??` (nullish coalescing) solo evalúa el lado derecho si el izquierdo es `null` o `undefined`, no si es `""` (cadena vacía). Es más preciso que `||` para este caso.



---

# Resumen para memoria - 11/05/2026

Refactorización completa del componente `header` y homogeneización visual
del componente `detalle-noticia` dentro del proyecto **anime'n'chill**.

---

## 1. Descripción

Se han aplicado dos tipos de cambios sobre el front-end del proyecto:

### Correcciones sobre lo existente (header)

- Eliminado el ítem de navegación "Anime" del menú principal (`header.html`)
- El botón de selección de tema pasa de texto plano a **icono SVG dinámico**
  que cambia según el tema activo:
  - ☀️ Claro → icono sol
  - 🌙 Oscuro → icono luna
  - 🌅 Tarde → icono atardecer
  - ✨ Noche → icono estrella
- El desplegable de temas ahora se activa con **hover** (no con clic),
  manteniendo el clic como fallback en dispositivos táctiles (`header.js`)

### Nuevo diseño — estética más agresiva (header + detalle-noticia)

- `border-radius` reducido en todos los componentes:
  contenedores `4px`, botones `3px`, etiquetas/badges `2px`
- Botones con `text-transform: uppercase`, `letter-spacing: 0.07em`
  y `font-size: 0.82rem` para mayor contundencia tipográfica
- Logo con `letter-spacing: -0.03em` — más compacto y estructurado

---

## 2. Temporalización

| Tarea | Fecha |
|---|---|
| Análisis y planificación de cambios | 11/05/2026 |
| Corrección header (HTML + JS + CSS) | 11/05/2026 |
| Refactorización detalle-noticia.css | 11/05/2026 |
| Commit y documentación | 11/05/2026 |

---

## 3. Requisitos

- Coherencia visual entre componentes del front-end
- Mantenimiento del sistema de temas (oscuro / claro / tarde / noche)
- Responsive obligatorio: >1100px / 1100–701px / 700–501px / ≤500px
- Accesibilidad: `aria-label` en todos los botones icono

---

## Resumen para memoria — 12/05/2026

**Página de perfil de usuario creada (`front-end/paginas/perfil/`)**

## 1. Descripción

Se ha implementado la página de perfil completa del proyecto **anime'n'chill**. Permite al usuario autenticado consultar sus datos, ver su historial de lectura, descubrir mangas recomendados y editar su información personal desde un modal.

## 2. Temporalización

Desarrollada en una sesión el **11–12 de mayo de 2026**, como parte del bloque de front-end tras tener operativas las páginas de novedades, detalle de noticia, login y registro.

## 3. Requisitos implementados

- Visualización de datos del usuario (nombre, email, avatar, estadísticas)
    
- Historial de lectura reciente leído desde `localStorage` (`anc_recientes`)
    
- Sección de recomendados filtrada contra el historial, con botón de refresco
    
- Modal de edición con: subida de avatar por archivo (PNG/JPG/WEBP, máx. 2 MB), cambio de nombre de usuario, confirmación con contraseña actual y enlace a cambio de contraseña
    
- Campo de email deshabilitado con badge **"Verificación pendiente"** (funcionalidad futura)
    
- Cierre de sesión con limpieza de `localStorage` y redirección al login
    
- Protección de ruta: si no hay `access_token`, redirige automáticamente al login
    

## 4. Arquitectura

|Archivo|Responsabilidad|
|---|---|
|`perfil.html`|Estructura semántica: banner, recientes, recomendados, modal|
|`perfil.css`|Estilos con variables CSS de temas, responsive en 4 breakpoints|
|`perfil.js`|Lógica: fetch JWT, render, localStorage, FormData, validación|

## 5. Pendiente

- **Backend**: los endpoints `GET /api/usuarios/perfil/` y `PATCH /api/usuarios/perfil/editar/` aún no están verificados — la carga de datos iniciales y el guardado del modal no funcionan hasta revisar `usuarios/views.py` y `usuarios/urls.py`
    
- **Verificación de email**: flujo completo pendiente de implementar
    
- Los **recomendados** son actualmente mangas de la API filtrados por historial; en el futuro se puede sustituir por un endpoint dedicado
  
  
  
  ---

## Resumen para memoria — 12/05/2026
### Corrección y funcionalidad completa de la página de perfil

#### 1. Descripción
Se desarrolla y corrige la página de perfil de usuario (`/paginas/perfil/`).
Los problemas encontrados y resueltos fueron:
- `redirigirLogin()` estaba comentada, rompiendo el flujo de autenticación.
- `obtenerToken()` solo miraba `localStorage`, ignorando `sessionStorage`.
- `cerrarSesion()` no borraba tokens de `sessionStorage`.
- `UsuarioSerializer` no exponía `avatar`, `capitulos_leidos` ni `mangas_leidos`
  en la raíz del JSON — el JS los buscaba donde no estaban.
- El router de DRF duplicaba el prefijo `/api/usuarios/usuarios/perfil/` en lugar
  de generar `/api/usuarios/perfil/`.
- `UsuarioEditarSerializer` no validaba `password_actual`.

#### 2. Temporalización
Sprint perfil — sesiones 1 y 2 (11–12 mayo 2026)

#### 3. Requisitos
- JWT activo (SimpleJWT)
- Backend corriendo en `http://127.0.0.1:8000`
- Frontend servido desde Live Server (`127.0.0.1:5500` o `:5501`)

#### 4. Arquitectura
- `UsuarioSerializer` usa `SerializerMethodField` para aplanar `avatar`,
  `capitulos_leidos` y `mangas_leidos` a la raíz del JSON.
- `UsuarioEditarSerializer` incluye `password_actual` con validación mediante
  `django.contrib.auth.authenticate()`.
- `usuarios/urls.py` registra el ViewSet con prefijo vacío `""` para evitar
  la duplicación del segmento en la URL.
- `perfil.js` usa el operador `??` para buscar el token en ambos storages.

#### 5. Datos
- `capitulos_leidos` y `mangas_leidos` devuelven `0` como placeholder hasta
  implementar el modelo de progreso de lectura.
- El avatar se sirve como URL absoluta construida con `request.build_absolute_uri()`.

---

## Resumen para memoria — 13/05/2026

fix(perfil): renovación automática de token JWT caducado

### Descripción
El access token JWT caducaba (5 min por defecto) y redirigía al login
aunque el usuario tuviera sesión activa.

### Solución
- Nueva función `obtenerTokenValido()` en perfil.js: lee el payload JWT,
  detecta si ha caducado y llama a `renovarToken()` antes de redirigir.
- `renovarToken()` hace POST a `/api/token/refresh/` con el refresh token
  guardado en localStorage/sessionStorage.
- Si el refresh también ha caducado, entonces sí redirige al login.
- `settings.py`: ACCESS 60min, REFRESH 7 días.

### Archivos modificados
- `front-end/paginas/perfil/perfil.js`
- `back-end/config/settings.py`

---

# Resumen para memoria — 14 mayo 2026

---

## 1. Descripción

Durante esta sesión se avanzó en el módulo de **manga y servicios externos** del proyecto anime'n'chill.
Se analizó en profundidad la página de novedades como referencia de patrón de código,
y se diseñó la arquitectura completa de la página de manga con sus tres componentes principales:
cuadrícula de portadas, sección "continuar leyendo" y modal de detalle con capítulos por volumen.
También se creó la capa de servicios back-end para integración con la API de MangaDex.

---

## 2. Temporalización

| Bloque | Tarea |
|---|---|
| Revisión | Análisis del código de novedades como base visual y lógica |
| Back-end | Creación de `services/`: mangadex.py, sincronizacion.py, scrapear_portadas.py |
| Front-end assets | Añadir placeholders para noticia, logo y portada |
| Front-end manga | Estructura HTML de manga.html, manga.css y manga.js (pendiente de contenido) |
| Documentación | Commits separados por responsabilidad, memoria y explicación técnica |

---

## 3. Requisitos trabajados

- **DWES**: capa de servicios desacoplada de las vistas · integración con API externa (MangaDex)
- **DWES**: modelo `Progreso` como relación N:M con datos extra (usuario ↔ capítulo)
- **DWES**: modelo `Favorito` como segunda relación N:M con datos extra (usuario ↔ manga/anime)
- **DWEC**: persistencia de estado de lectura en `localStorage`
- **DWEC**: modal accesible (`role="dialog"`, `aria-modal`, cierre con Escape)
- **DWEC**: agrupación y renderizado dinámico de capítulos por volumen
- **DIW**: diseño responsive en 4 breakpoints · dark mode · animaciones de carga skeleton

---

## 4. Arquitectura
front-end/
├── paginas/
│ ├── novedades/ → noticiero (base de referencia visual)
│ └── manga/ → listado de manga (en desarrollo)
│ ├── manga.html → estructura: continuar + cuadrícula + modal
│ ├── manga.css → (pendiente)
│ └── manga.js → (pendiente)
└── assets/
├── placeholder-noticia.jpg
├── placeholder-logo.png
└── placeholder-portada.jpg

back-end/
└── anime/
├── models.py → Manga, Capitulo, Progreso, Favorito, Genero
├── serializers.py → MangaListSerializer, MangaDetailSerializer, CapituloSerializer
└── services/
├── _init_.py
├── mangadex.py → cliente API MangaDex
├── sincronizacion.py → sync datos → BD
└── scrapear_portadas.py → descarga portadas a media/

text

---

## 5. Datos

### Modelos principales trabajados

| Modelo | Campos clave | Relaciones |
|---|---|---|
| `Manga` | titulo, estado, portada_url, portada_local, destacado | ManyToMany → Genero |
| `Capitulo` | numero (Decimal), volumen, ruta_imagenes | FK → Manga |
| `Progreso` | pagina_actual, completado, fecha_lectura | FK → User · FK → Capitulo |
| `Favorito` | tipo, nota_personal, fecha_guardado | FK → User · FK → Manga · FK → Anime |

### Endpoints usados desde el front

| Endpoint | Método | Para qué |
|---|---|---|
| `/api/manga/mangas/` | GET | Listado de manga para la cuadrícula |
| `/api/manga/capitulos/?manga=ID` | GET | Capítulos de un manga para el modal |
| `/api/noticias/noticias/` | GET | Noticias para novedades |
| `/api/noticias/sincronizar/` | POST | Forzar sync con ANN |

### Progreso en localStorage

```json
{
  "anc_progreso_manga": {
    "42": {
      "capituloId": 318,
      "capituloNumero": 7,
      "capituloTitulo": "El despertar",
      "fecha": "2026-05-14T02:15:00.000Z"
    }
  }
}
```


---

## 🧠 Resumen para memoria — [[17/05/2026]]

## Página de Manga — Primera versión estática

---

## 1. Descripción

Se ha construido la página de manga (`front-end/paginas/manga/`) completa en tres archivos. La página muestra una biblioteca organizada por categorías con un grid de tarjetas de portada. Al hacer clic en cualquier manga se abre un modal de detalle que muestra la portada, un botón de continuar lectura y los capítulos agrupados por volúmenes en desplegables. Los datos son completamente **hardcodeados** en JS a la espera de conectar con la API.

---

## 2. Temporalización

Sprint actual (semana frontend). Próximo paso: conectar con `/api/mangas/` y MangaDex para portadas reales.

---

## 3. Archivos modificados

|Archivo|Estado|
|---|---|
|`front-end/paginas/manga/manga.html`|✅ Creado|
|`front-end/paginas/manga/manga.css`|✅ Creado|
|`front-end/paginas/manga/manga.js`|✅ Creado|

---

## 4. Arquitectura

**HTML** — Estructura semántica con `<section>` por categoría, `<article>` por tarjeta, `<details>/<summary>` para volúmenes y `role="dialog"` en el modal. Sigue exactamente el patrón de `novedades.html` (inyección de header/footer via `componentes.js`).

**CSS** — Variables de tema (`--fondo`, `--acento`, `--borde`, `--texto`, `--sombra`) del sistema de 4 temas existente. Grid con `auto-fill + minmax` para que se adapte solo. Botones 3D con `box-shadow` inferior + `translateY` en hover/active. Modal con entrada animada `translateY + scale`. Responsive en 4 breakpoints (`>1100`, `1100-701`, `700-501`, `≤500`).

**JS** — Módulo sin frameworks. Patrón: constantes → datos → estado → utilidades → lógica → eventos → init. Funciones pequeñas y con responsabilidad única. El array `DATOS_MANGA` es el origen de verdad temporal, sustituible por `fetch` al backend sin cambiar el resto del código.

---

## 5. Datos

text

`DATOS_MANGA (hardcodeado, temporal) ├── id, titulo, categoria, genero ├── portada → placeholder local ├── ultimoCapitulo → número hardcodeado └── volumenes → [{ nombre, rango, caps: [array de números] }]`

**Estados de capítulo implementados:**

- `manga-cap-btn--leido` → cap < ultimoCapitulo
    
- `manga-cap-btn--actual` → cap === ultimoCapitulo
    
- Sin clase → cap > ultimoCapitulo (no leído)
    

---

## 🔗 Plan de conexión con MangaDex

Con los archivos del backend revisados, ya sé exactamente qué hay que hacer. El backend **ya está preparado**, tiene todo lo necesario:

## Lo que ya existe y funciona

|Endpoint|Qué devuelve|
|---|---|
|`GET /api/mangas/`|Lista con `id, titulo, autor, estado, portada, destacado`|
|`GET /api/mangas/{id}/`|Detalle completo con géneros, total_capitulos, etc.|
|`GET /api/mangas/{id}/capitulos/`|Todos los caps ordenados por número|
|`GET /api/mangas/{id}/portada-mangadex/`|Dispara fetch a MangaDex, guarda y devuelve la URL|

## Lo que necesita el JS para funcionar

El `manga.js` actual usa `DATOS_MANGA` hardcodeado. Hay que sustituirlo por 3 peticiones:

1. **`GET /api/mangas/?page_size=100`** → para construir el grid
    
2. **`GET /api/mangas/{id}/capitulos/`** → al abrir el modal
    
3. **`GET /api/mangas/{id}/portada-mangadex/`** → si `portada` viene vacío
    

## Un detalle importante a verificar

El serializer devuelve `portada` que usa la property del modelo:

python

`@property def portada(self):     if self.portada_local:        return self.portada_local.url    return self.portada_url or ""`

Si `portada_url` está vacío en DB, el JS tiene que llamar a `/portada-mangadex/` para obtenerla y cachearla. Eso ya lo gestiona el backend automáticamente.

## Un problema a resolver antes

El `CORS_ALLOWED_ORIGINS` en `settings.py` solo tiene:

python

`CORS_ALLOWED_ORIGINS = [     "http://127.0.0.1:5500",    "http://localhost:5500", ]`

# Resumen para memoria — 17/18 mayo 2026

Sesión de refactorización completa del backend de la app anime,
eliminación de modelos innecesarios y automatización de la gestión
de mangas mediante commands y servicios.

---

## 1. Descripción

Se ha realizado un refactor profundo de la app `anime` del backend,
eliminando todo lo relacionado con Anime/Episodio al ser contenido
fuera del alcance actual del proyecto. Se han limpiado modelos,
serializers, views, filters, admin y urls. Se han creado tres
management commands para automatizar la gestión de mangas y se ha
renombrado el command de portadas para reflejar correctamente su
función (consumo de API oficial, no scraping).

---

## 2. Temporalización

17/18 mayo 2026

---

## 3. Lo que se ha hecho

### 3.1 Refactor de modelos (models.py)
- Eliminados: modelo Anime, modelo Episodio
- Simplificado: Favorito ahora solo apunta a Manga
  (eliminados campos anime y tipo)
- Renombradas todas las tablas con Meta.db_table:
  mangas, capitulos, generos, favoritos, progresos
- Migración limpia: migrate anime zero → makemigrations → migrate
- Durante makemigrations Django detectó campo manga nullable en
  Favorito — resuelto con opción 1 + valor por defecto 1
  (BD limpia, sin datos reales afectados)

### 3.2 Limpieza en cascada
- serializers.py → eliminados AnimeListSerializer,
  AnimeDetailSerializer, EpisodioSerializer
  FavoritoSerializer simplificado (solo manga)
  GuardarFavoritoInputSerializer eliminado campo tipo
- filters.py → eliminado AnimeFilter completo
- admin.py → eliminados AnimeAdmin, EpisodioAdmin
- views.py → eliminados AnimeViewSet, EpisodioViewSet
  @action guardar_favorito reescrito simplificado
- urls.py → desregistrados routers de anime y episodio
  Solo queda registrado el router de manga

### 3.3 Management commands creados

| Command            | Función                                          |
|--------------------|--------------------------------------------------|
| registrar_mangas   | Lee media/Manga/ y crea objetos Manga en BD      |
| poblar_capitulos   | Crea objetos Capitulo desde subcarpetas          |
| metadatos_manga    | Menú interactivo — portadas y metadatos MangaDex |

Todos los commands incluyen flag --dry-run para simular
sin escribir en BD.

### 3.4 Servicios (services/)
- mangadex.py: consulta API MangaDex v5, construye URL de
  portada CDN, extrae autor/géneros/descripción/estado.
  TERMINOS_CUSTOM para títulos cuyo nombre de carpeta no
  coincide exactamente con MangaDex
- sincronizacion.py: compara BD vs API y decide
  crear / actualizar / omitir según si portada_url cambió.
  Acepta flag forzar=True para actualizar siempre.

### 3.5 Renombrado
- scrapear_portadas.py → metadatos_manga.py
  El término "scrapear" era semánticamente incorrecto —
  se consume una API REST oficial y pública de MangaDex

### 3.6 Herramienta auxiliar de desarrollo
- diagnostico_manga.py: script interactivo de diagnóstico
  ejecutable desde Django shell. Muestra estado de BD,
  estructura de carpetas, formato de imágenes y capítulos
  por manga. No es parte del sistema productivo.

---

## 4. Flujo completo de gestión de mangas

python manage.py registrar_mangas    # 1. Registra en BD
python manage.py poblar_capitulos    # 2. Crea capítulos
python manage.py metadatos_manga     # 3. Portadas y metadatos

---

## 5. Arquitectura de datos resultante

Manga ──< Capitulo
  │
  └──< Favorito >── User
  │
  └──< Progreso >── Capitulo
  │
  └──>< Genero

Tablas BD: mangas, capitulos, generos, favoritos, progresos


---

# Resumen para memoria - 18/05/2026

## 1. Descripción

Se corrigió el sistema de paginación de la página de novedades para evitar que el frontend generase páginas inexistentes que terminaban provocando errores 404. Además, se mantuvo la persistencia de estado con `sessionStorage` para conservar la página actual y el filtro activo durante la sesión del usuario.

## 2. Temporalización

Trabajo realizado en una única sesión el 18/05/2026.

## 3. Requisitos

- Limitar la navegación únicamente a las páginas reales existentes en la base de datos.
- Evitar que el usuario pueda acceder a páginas fantasma generadas por un cálculo incorrecto.
- Mantener la persistencia de `paginaActual` y `filtroActivo` dentro de la misma pestaña.
- Conservar el sistema de hero, cuadrícula de tarjetas y filtros ya implementado.

## 4. Arquitectura

- `novedades.html`: estructura base de la página, contenedor del hero, filtros, grid de noticias y paginación.
- `novedades.css`: estilos visuales del hero, tarjetas, filtros, skeletons y paginador responsive.
- `novedades.js`: lógica completa de carga de noticias, renderizado, filtros, paginación y persistencia de sesión.

## 5. Datos

- Endpoint principal: `GET /api/noticias/noticias/?page=n`
- Endpoint de sincronización: `POST /api/noticias/noticias/sincronizar/`
- Claves de sesión utilizadas:
  - `anc_noticias_pagina`
  - `anc_noticias_filtro`

## 6. Problema detectado

El cálculo anterior del número total de páginas utilizaba `datos.results.length` como divisor sin tener en cuenta si la página actual era la última. Esto provocaba que, al llegar a una página con menos elementos, el total calculado creciera artificialmente y el paginador mostrara páginas que realmente no existían en el backend.

## 7. Solución aplicada

Se implementó una nueva lógica para calcular el total de páginas basada en la respuesta real de Django REST Framework:

- Si `datos.next` es `null`, la página actual se considera la última.
- Si `datos.next` existe, se calcula el total solo desde una página válida.
- Se añadió además una comprobación de seguridad para corregir `paginaActual` si el valor restaurado desde `sessionStorage` supera el número real de páginas disponibles.

## 8. Resultado

El paginador ahora solo permite navegar hasta la última página real existente en la base de datos. Se evita el error 404 por navegación a páginas inexistentes y se mejora la experiencia de usuario al mantener la posición y el filtro activo al volver atrás.

---

**Resumen para memoria - 2026-05-18**  
Se ha simplificado la vista de manga eliminando iconos decorativos y dejando una interfaz más limpia y coherente con el estilo oscuro del proyecto. Además, se ha mantenido la interacción del modal con tarjetas, capítulos y progreso, preparando la pantalla para integrar datos de MangaDex mediante portadas y feed de capítulos.

## 1. Descripción

Se ha trabajado sobre la página de manga del proyecto `anime'n'chill` para mejorar la presentación visual y la interacción del catálogo. El objetivo ha sido reducir elementos decorativos innecesarios y mantener una estructura clara para lectura y navegación. El modal sigue siendo el punto principal de detalle para cada manga, con acceso a capítulos y continuidad de lectura.

## 2. Temporalización

La tarea se ha realizado en una fase de refactorización de la interfaz, después de tener montada la estructura base de HTML, CSS y JavaScript. En este momento se ha priorizado la limpieza visual y la cohesión del componente antes de continuar con la integración completa de datos externos. Esta secuencia ayuda a evitar duplicidades y facilita futuras mejoras.

## 3. Requisitos

La página mantiene filtros por categoría, buscador por título y apertura del modal al clicar en una tarjeta. También conserva el sistema de progreso local para identificar el último capítulo leído. Para la conexión con datos reales, MangaDex ofrece la portada mediante la relación `cover_art` y los capítulos mediante el endpoint de feed del manga.

## 4. Arquitectura

La solución se apoya en HTML semántico, CSS con nomenclatura BEM y JavaScript modular con funciones pequeñas. El catálogo usa tarjetas por categoría y un modal reutilizable para mostrar información detallada. La futura integración con MangaDex encaja bien con esta estructura porque permite cargar portada y capítulos sin cambiar el flujo principal de la interfaz.

## 5. Datos

De momento se mantiene una base de datos temporal en JavaScript para asociar cada tarjeta con su información y su progreso local. MangaDex permite obtener la portada usando el identificador del manga y el nombre del archivo de cover, y permite consultar los capítulos con `/manga/{id}/feed`. Esto hace posible sustituir los datos estáticos por datos reales en una fase posterior sin rediseñar toda la pantalla.

## **Resumen para memoria — 19/05/2026**
El lector de manga no mostraba contenido y lanzaba "No se pudo cargar el capítulo".

1. Descripción
Se corrigieron tres bugs encadenados que impedían que el lector cargase las páginas de un capítulo.

2. Cambios realizados
front-end/paginas/lector/lector.js

API_BASE cambiado de http://localhost:8000/api → http://localhost:8000/api/anime para coincidir con el prefijo definido en config/urls.py

back-end/anime/views.py

Añadido @action paginas en CapituloViewSet → genera el endpoint GET /api/anime/capitulos/{id}/paginas/ que lee la carpeta ruta_imagenes, lista los archivos de imagen y devuelve { paginas: [...urls], total: N }

Añadido permission_classes = [IsAuthenticated] a nivel de clase para forzar que get_permissions() sobreescriba el permiso global de REST_FRAMEWORK en settings.py

Añadido "paginas" a la condición AllowAny en get_permissions() para que el endpoint sea público sin autenticación

3. Causa raíz
El DEFAULT_PERMISSION_CLASSES global en settings.py estaba configurado como IsAuthenticated, lo que sobreescribía el permission_classes=[AllowAny] del @action. Declarar permission_classes explícitamente a nivel de clase fuerza a DRF a usar get_permissions() siempre.


## Resumen para memoria — 20/05/2026

### Corrección de "Leídos recientemente" en perfil de usuario

---

### 1. Descripción

Se ha corregido y desarrollado la sección **"Leídos recientemente"** de la página de perfil,
que anteriormente mostraba siempre el estado vacío ("Aún no has leído ningún manga")
independientemente del estado real del catálogo.

---

### 2. Problema detectado

La implementación original leía de `localStorage` bajo la clave `anc_recientes`,
que nunca era escrita por ninguna parte del sistema. Al estar siempre vacía,
la sección mostraba permanentemente el estado vacío.

---

### 3. Solución implementada

Se sustituyó la lógica de `localStorage` por una **llamada directa a la API REST**
del backend Django (`/api/anime/mangas/`), replicando en `perfil.js` las mismas
funciones que usa `manga.js` para renderizar tarjetas y gestionar el modal de detalle.

---

### 4. Archivos modificados

| Archivo | Cambios |
|---|---|
| `perfil.js` | Nuevas constantes, funciones `rec_*`, `renderizarRecientes()` async con fetch, modal completo |
| `perfil.html` | Añadido HTML del modal de detalle de manga (`#mangaModal`) |
| `perfil.css` | Añadidos estilos del modal manga, tarjetas manga, volúmenes y botones de capítulo |

---

### 5. Funcionalidades resultantes

- La sección muestra hasta 5 mangas del catálogo con portada, título y número de capítulos
- Al hacer clic en una tarjeta se abre un modal con los dos paneles (portada + lista de capítulos)
- Los capítulos se cargan desde la API y se agrupan en bloques de 20
- El progreso de lectura se lee desde `localStorage` (`anc_progreso_<id>`) igual que en la página de manga
- El modal se cierra con el botón ✕, haciendo clic en el fondo, o pulsando Escape
- Diseño y comportamiento idéntico al de la página de manga, responsive en todos los breakpoints



# Resumen para memoria - 2026-05-21

## 1. Descripción

Durante esta fase del proyecto se corrigió el sistema de gestión y visualización de portadas de manga en la aplicación `anime'n'chill`. El problema detectado era que algunas imágenes no se mostraban correctamente en la página de manga ni en el perfil de usuario, a pesar de estar subidas en Django y almacenadas dentro de la carpeta `media`.

Tras el análisis del flujo completo, se comprobó que el origen del error no estaba únicamente en el frontend, sino en la forma en la que el backend resolvía la portada principal de cada manga. En varios registros se estaba utilizando el campo `portada_url` con rutas manuales antiguas, como `/media/Portada_one_piece.png`, que ya no coincidían con la ubicación real del archivo.

La solución aplicada consistió en hacer que el sistema priorizara siempre imágenes reales gestionadas por Django, ya fuera mediante `portada_local` o mediante el modelo relacionado `Portada`. De este modo, tanto `manga.html` como `perfil` pasaron a consumir una misma fuente válida de imagen desde la API.

## 2. Temporalización

La incidencia se abordó dentro de la fase de integración entre backend y frontend, cuando se realizaron pruebas reales de carga de portadas desde la base de datos. El error se detectó inicialmente al comprobar que algunas imágenes devolvían un `404` al intentar acceder a la ruta servida por Django.

En una primera revisión se analizó el modelo `Manga`, su propiedad `portada` y la relación con el modelo `Portada`. Después se comprobó mediante consola interactiva (`manage.py shell`) qué valores reales estaban almacenados en `portada_local`, `portada_url` y en las portadas relacionadas.

Una vez identificado el problema, se corrigió la prioridad lógica de resolución de la portada, se añadieron imágenes reales desde el panel de administración de Django y se limpiaron datos antiguos que mantenían rutas incorrectas. Finalmente, se verificó que tanto la página de manga como el perfil mostraban correctamente la misma imagen.

## 3. Requisitos

Esta mejora responde directamente a la necesidad de mantener consistencia entre los datos servidos por la API REST y los elementos visualizados en el frontend. Dentro del proyecto, era imprescindible que las portadas de los mangas pudieran cargarse correctamente desde Django y que dichas imágenes estuvieran disponibles en todas las vistas que las consumen.

También se cubre un requisito importante de diseño backend en DAW: evitar soluciones manuales o frágiles cuando existe una estructura de datos ya definida en el modelo. En lugar de depender de rutas escritas manualmente, se reforzó el uso del ORM, de los `ImageField` y de la relación entre modelos para garantizar un comportamiento estable.

Además, esta corrección mejora la mantenibilidad del proyecto, ya que deja una única lógica clara para obtener la portada principal de cada manga, reduciendo incoherencias entre backend, panel de administración y frontend.

## 4. Arquitectura

La solución se apoyó en la estructura existente de modelos del backend Django. El modelo `Manga` mantiene una propiedad calculada llamada `portada`, cuya función es determinar qué imagen debe enviarse como portada principal al frontend. Esta propiedad fue ajustada para seguir un orden de prioridad más robusto:

1. Usar `portada_local` si existe.
2. Usar la `Portada` marcada como principal.
3. Usar la primera `Portada` relacionada disponible.
4. Usar `portada_url` solo como último recurso.

Este cambio fue importante porque `portada_url` contenía en algunos casos rutas antiguas que no apuntaban a archivos reales dentro de `MEDIA_ROOT`. En cambio, las imágenes almacenadas en `ImageField` sí generan URLs válidas a partir del sistema de archivos gestionado por Django.

A nivel de integración, el frontend no tuvo que construir rutas manuales nuevas, sino que pasó a consumir la información ya resuelta por el backend. Esto permitió que las vistas `manga.html` y `perfil` utilizaran la misma fuente de datos para la portada, evitando diferencias visuales entre ambas.

## 5. Datos

Durante la revisión de datos se detectó que algunos mangas tenían valores vacíos en `portada_local`, otros no tenían ninguna `Portada` relacionada y algunos seguían dependiendo de `portada_url` con rutas manuales ya obsoletas. Este era el caso, por ejemplo, de `SPY x FAMILY`, que mantenía una URL antigua aunque ya disponía de una portada válida asociada desde Django.

Para solucionar esta inconsistencia, se subieron imágenes reales a través del panel de administración en el modelo `Portada` para mangas como `One Piece` y `SPY x FAMILY`. Después se comprobó desde `manage.py shell` que la propiedad `portada` devolvía correctamente una ruta válida dentro de `/media/portadas/...`.

Por último, se limpiaron registros antiguos como `portada_url` cuando ya no eran necesarios. Esta limpieza dejó el sistema más consistente y preparado para futuras ampliaciones, ya que las portadas ahora dependen de archivos reales gestionados por Django y no de textos manuales guardados en la base de datos.


# Explicación completa - Restyling de login y registro

## 1. Qué se ha cambiado

Se han actualizado los archivos `login.html`, `login.css`, `registro.html` y `registro.css` para que las páginas de autenticación mantengan su estructura original, pero adopten una estética mucho más cercana a la página `novedades`.

Los cambios principales han sido:

- Mantener la estructura base del formulario.
- Añadir una estética más editorial y oscura.
- Reforzar el uso del color de acento dorado de la web.
- Mejorar la visibilidad del fondo.
- Hacer que login y registro tengan coherencia visual entre sí.

---

## 2. Por qué se ha cambiado

Antes, login y registro funcionaban, pero visualmente parecían pantallas separadas del resto del proyecto.

La página de `novedades` ya tiene una identidad visual bastante clara:
- fondo oscuro,
- contrastes fuertes,
- títulos con peso visual,
- acento dorado,
- tarjetas con apariencia sólida,
- sensación de página moderna de contenido.

En cambio, login y registro tenían:
- una caja demasiado genérica,
- inputs con menos personalidad,
- fondos demasiado apagados,
- menos relación visual con el resto del proyecto.

Por eso se ha hecho este restyling: para unificar la identidad del proyecto.

---

## 3. Para qué sirve este cambio

Este cambio sirve para:

- Dar una imagen más profesional al proyecto.
- Hacer que el usuario perciba que todas las páginas pertenecen a la misma aplicación.
- Mejorar la experiencia visual al entrar en login y registro.
- Preparar una base visual reutilizable para futuras pantallas del proyecto.

---

## 4. Cambios en HTML

### Login
En `login.html` no se ha roto la estructura del formulario.  
Solo se han añadido y ajustado algunos elementos visuales:

- Se mantiene el logo superior.
- Se añade una etiqueta visual tipo `Acceso`.
- Se añade un subtítulo bajo el título principal.
- Se añade una capa extra decorativa en el fondo: `login-fondo__detalle`.
- La caja principal pasa a estar dentro de una sección más semántica.

### Registro
En `registro.html` se ha seguido el mismo criterio:

- Se añade el logo superior para que tenga coherencia con login.
- Se añade una etiqueta visual tipo `Registro`.
- Se mantiene toda la estructura de campos.
- Se añade una capa decorativa en el fondo: `registro-fondo__detalle`.

---

## 5. Cambios en CSS

### Fondo
Antes el fondo estaba muy oscurecido y perdía fuerza.

Ahora:
- la imagen se sigue oscureciendo para mantener legibilidad,
- pero se le ha dado más brillo, contraste y saturación,
- se ha añadido una superposición más trabajada,
- se han añadido detalles radiales con el color de acento.

Esto hace que el fondo se vea más, pero sin molestar al formulario.

### Caja principal
Antes la caja parecía un bloque genérico con blur.

Ahora:
- tiene un fondo más parecido al de una tarjeta oscura de la web,
- usa bordes más finos y discretos,
- se ha reducido el redondeado para acercarlo al estilo de `novedades`,
- la sombra está más trabajada y da profundidad.

### Tipografía
Se ha reforzado el peso visual de los títulos:
- títulos más grandes,
- más negrita,
- espaciado más cercano al estilo editorial.

Las etiquetas de los campos también pasan a usar mayúsculas suaves y más peso visual.

### Inputs
Los inputs ahora:
- tienen un fondo más integrado con el modo oscuro,
- mejoran el hover,
- mejoran el focus,
- usan mejor el color de acento.

### Botones
Los botones de login y registro ahora siguen más claramente el estilo del botón principal de `novedades`:
- color dorado,
- texto en mayúsculas,
- más peso visual,
- pequeño desplazamiento al hacer hover.

---

## 6. Coherencia visual conseguida

Con estos cambios, login y registro comparten ahora:

- mismo lenguaje visual,
- mismo color de acento,
- misma línea de tarjetas oscuras,
- misma forma de resaltar títulos,
- misma forma de tratar el fondo.

Eso hace que, cuando el usuario pase de `novedades` a `login` o `registro`, no parezca que ha salido a otra web distinta.

---

## 7. Relación con el archivo `temas.css`

Se ha respetado el sistema de variables del proyecto:
- `--fondo`
- `--fondo-tarjeta`
- `--borde`
- `--texto`
- `--texto-suave`
- `--texto-muy-suave`
- `--acento`
- `--acento-hover`

Esto es importante porque permite:
- mantener compatibilidad con el sistema de temas,
- no duplicar colores innecesariamente,
- facilitar cambios futuros de estilo global.

---

## 8. Archivo y función

### `login.html` y `login.css`
Su función es permitir el acceso del usuario a la aplicación con una interfaz clara, visualmente coherente y alineada con el resto del proyecto.

### `registro.html` y `registro.css`
Su función es permitir el alta de nuevos usuarios con una interfaz visual consistente con login y con la identidad general de anime'n'chill.

---

## 9. Resultado final esperado

Después de aplicar estos cambios:

- el fondo se verá más,
- la caja destacará mejor,
- el formulario se sentirá más moderno,
- el diseño estará más conectado con `novedades`,
- login y registro parecerán parte del mismo sistema visual.




---
---

# Resumen para memoria - 2026-05-21

## **Quitar opción de cambiar contraseña en editar perfil**


## Qué se elimina
Se elimina únicamente el bloque visual dentro del modal de **Editar perfil** que mostraba el mensaje *“¿Quieres cambiar tu contraseña?”* junto con el enlace hacia la página de cambio de contraseña.

## Qué se mantiene
Se mantiene todo el resto del modal exactamente igual:
- Foto de perfil
- Nombre de usuario
- Email
- Campo de contraseña actual
- Feedback global
- Botones de cancelar y guardar cambios

## Por qué se hace así
Este cambio es el más seguro porque actúa solo sobre el bloque responsable de mostrar esa opción.  
No modifica la estructura general del formulario ni afecta al resto de campos.

## Para qué sirve
Sirve para que al pulsar **Editar perfil** ya no aparezca la opción de cambiar contraseña, dejando el modal centrado únicamente en la edición de datos del perfil.

## Funciones eliminadas vs añadidas

### Eliminadas
- La visualización del bloque `.campo-enlace-password`
- El texto informativo para cambiar contraseña
- El enlace a la página de recuperación/cambio de contraseña
- Los estilos CSS exclusivos de ese bloque
- El ajuste responsive de ese bloque en móvil

### Añadidas
- No se añade ninguna funcionalidad nueva

## Función del archivo modificado

### `perfil.html`
Contiene la estructura visual de la página de perfil y del modal de edición.  
Aquí se elimina el bloque HTML que mostraba la opción de cambiar contraseña.

### `perfil.css`
Contiene los estilos de la página de perfil y del modal.  
Aquí se eliminan únicamente las reglas CSS asociadas al bloque retirado para evitar dejar código muerto.


---

# Arreglo de leídos recientemente

## 1. Descripción

Se corrigió el bloque de **mangas leídos recientemente** de la página de perfil para que mostrase realmente los últimos mangas abiertos por el usuario, en lugar de una lista estática o desactualizada. [web:317]

El problema principal era que la información de progreso no se estaba relacionando de forma segura con el usuario autenticado y, además, la sección de perfil no se actualizaba correctamente al regresar desde el lector. [web:317][web:472]

La solución aplicada consistió en guardar el progreso de lectura en `localStorage` usando una clave compuesta por el identificador del usuario y el identificador del manga. De esta forma, cada usuario conserva su propio historial de lectura y el perfil puede recuperar únicamente sus datos. [web:317]

## 2. Temporalización

La corrección se realizó durante la fase de ajustes funcionales de la página de perfil, una vez detectado que la lógica visual estaba implementada pero no reflejaba el uso real del lector. [web:317]

Primero se revisó cómo se guardaba el progreso en el lector y después cómo se consumía ese progreso desde el perfil. A partir de ahí se unificó el formato de almacenamiento y se reorganizó la carga de mangas recientes. [web:317]

## 3. Requisitos

Para que la funcionalidad fuese correcta, se definieron tres requisitos principales:

- Guardar el progreso por usuario y por manga.
- Obtener los mangas recientes a partir de la fecha de última apertura.
- Mostrar únicamente los 5 últimos mangas abiertos. [web:317]

También fue necesario asegurar que la vista de perfil se refrescase al volver desde la página del lector, ya que el contenido podía estar restaurándose desde caché del navegador. El evento `pageshow` permite manejar este comportamiento de forma fiable. [web:472]

## 4. Arquitectura

La solución se apoyó en dos archivos del frontend:

- `lector.js`, encargado de guardar el progreso.
- `perfil.js`, encargado de leerlo, ordenarlo y mostrarlo. [web:317]

En `lector.js`, se añadió una clave de almacenamiento con este patrón:

`anc_progreso_{usuarioId}_{mangaId}`

Este enfoque evita mezclar datos entre usuarios distintos dentro del mismo navegador y mantiene el progreso asociado a cada manga de manera individual. `localStorage` almacena información por origen, por lo que esta estrategia permite organizar correctamente los datos sin necesidad de cambios en backend. [web:317]

En `perfil.js`, la lógica de recientes recorre las claves del usuario actual, extrae el campo `ultimaApertura`, ordena los resultados de más reciente a más antiguo y solicita a la API únicamente los mangas necesarios para pintarlos en el mismo orden. [web:317]

Además, se añadió una recarga de la sección al producirse `pageshow` y también al recuperar visibilidad de la pestaña. Esto asegura que el perfil vuelva a dibujar los recientes cuando el usuario regresa desde el lector. [web:472]

## 5. Datos

Cada manga leído almacena una estructura similar a la siguiente:

```json
{
  "ultimoCapitulo": 12,
  "capitulosLeidos":,[3][4][5][6][7]
  "ultimaApertura": "2026-05-22T18:30:00.000Z"
}
```

El campo más importante para esta mejora es `ultimaApertura`, ya que permite ordenar los mangas por uso real y mostrar los últimos abiertos. [web:317]

Gracias a este cambio, la página de perfil ya no depende de una lista fija ni del orden devuelto por la API general de mangas, sino del comportamiento real de lectura del usuario. [web:317]


# Explicación clara — arreglo de leídos recientemente

## Qué se cambió
Se modificó únicamente la lógica relacionada con los mangas leídos recientemente.

## Funciones eliminadas o que dejaron de ser útiles
- La lógica que mostraba mangas sin usar el historial real del usuario dejó de ser válida.
- El render que dependía de una lista genérica ya no servía para cumplir el requisito funcional.

## Funciones añadidas o ajustadas
- Se añadió una clave de progreso por usuario y manga.
- Se guardó la fecha de última apertura en cada lectura.
- Se leyó el historial desde perfil para ordenar los mangas recientes.
- Se refrescó el bloque al volver desde el lector.

## Función del archivo `lector.js`
Este archivo se encarga de gestionar la lectura de capítulos y guardar el progreso del usuario en el navegador.

## Función del archivo `perfil.js`
Este archivo se encarga de construir la vista de perfil, recuperar el historial de lectura y mostrar los últimos mangas abiertos en el orden correcto.

## Resultado
Ahora el perfil muestra los 5 últimos mangas abiertos reales del usuario y se actualiza al volver desde el lector.