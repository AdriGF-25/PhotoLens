## Explicación completa — Página de perfil

---

### `perfil.html`
**Función:** Estructura visual completa de la página de perfil.

Está dividida en 4 bloques principales:
1. **Banner de perfil** — muestra avatar, nombre, email, estadísticas (capítulos,
   mangas, días activo) y los botones "Editar perfil" / "Cerrar sesión".
2. **Sección recientes** — cuadrícula de mangas leídos recientemente, generada
   desde JS con datos del `localStorage`.
3. **Sección recomendados** — cuadrícula de mangas recomendados, generada desde
   JS con datos de la API. Incluye botón "Actualizar".
4. **Modal editar perfil** — formulario flotante con campos para cambiar username,
   avatar y contraseña actual como confirmación. Se abre/cierra con JS sin
   recargar la página.

Los IDs de los elementos (`perfilNombre`, `statCapitulos`, etc.) son los puntos
de anclaje que usa `perfil.js` para inyectar los datos reales del usuario.

---

### `perfil.css`
**Función:** Estilos visuales de la página de perfil usando las variables de
`temas.css` (`--fondo`, `--acento`, `--borde`, etc.).

Bloques destacados:
- **`.perfil-banner`** — layout flex horizontal con avatar, info y acciones.
  En móvil pasa a wrap vertical.
- **`.cuadricula-recientes`** — CSS Grid de 5 columnas que se reduce a 2 en
  móvil. Las tarjetas usan `aspect-ratio: 2/3` para mantener proporción de
  portada manga sin importar el tamaño del contenedor.
- **`.modal-fondo`** — overlay de posición `fixed` que cubre toda la pantalla.
  Se muestra/oculta añadiendo/quitando la clase `.modal-fondo--visible` que
  cambia `display: none` a `display: flex`.
- **`.oculto`** — clase utilitaria con `display: none !important` usada por JS
  para mostrar/ocultar el estado vacío y el feedback del modal.

---

### `perfil.js`
**Función:** Toda la lógica de la página de perfil. Se divide en estos bloques:

#### `obtenerToken()`
Busca el JWT de acceso primero en `localStorage` (sesión persistente, cuando
el usuario marcó "Recordarme") y luego en `sessionStorage` (sesión temporal).
Usa el operador `??` (nullish coalescing) para devolver el primero que encuentre.
```js
return localStorage.getItem('access_token')
    ?? sessionStorage.getItem('access_token');
```

#### `redirigirLogin()`
Redirige al usuario a la página de login. Se llama cuando no hay token o cuando
la API devuelve 401 (token expirado o inválido).

#### `calcularDiasActivo(fechaISO)`
Recibe la fecha `date_joined` del usuario en formato ISO (`"2026-05-10T17:25:59Z"`)
y calcula cuántos días han pasado desde entonces hasta hoy. Devuelve `0` si la
fecha no existe o si el resultado es negativo.

#### `renderizarPerfil(datos)`
Recibe el objeto JSON del usuario devuelto por la API y lo "pinta" en el DOM:
inyecta nombre, email, avatar y estadísticas en los elementos identificados por
ID. También precarga los campos del formulario modal para que al abrirlo ya
tenga los valores actuales del usuario.

#### `cargarPerfil()`
Función `async` principal del arranque. Obtiene el token, hace `fetch` a
`GET /api/usuarios/perfil/` con cabecera `Authorization: Bearer <token>`, y
llama a `renderizarPerfil()` con la respuesta. Si la API devuelve 401, redirige
al login.

#### `obtenerRecientes()` / `renderizarRecientes()`
Lee del `localStorage` la clave `anc_recientes` (array JSON de mangas leídos).
Si está vacío, muestra el estado vacío con el botón "Explorar mangas". Si tiene
datos, genera tarjetas con `crearTarjetaManga()`.

#### `cargarRecomendados()`
Hace `fetch` a `GET /api/anime/mangas/?page=1` (público, sin token). Filtra los
mangas que el usuario ya tiene en su historial de recientes y muestra hasta 5
candidatos como recomendados. Si falla la petición, muestra el estado vacío.

#### `crearTarjetaManga(manga, esRecomendado)`
Crea un elemento `<article>` con la estructura HTML de una tarjeta de manga.
El parámetro `esRecomendado` controla si se muestra la etiqueta "Nuevo" (para
recomendados) o el badge de progreso (para recientes).

#### `abrirModal()` / `cerrarModal()`
Añaden/quitan la clase `.modal-fondo--visible` para mostrar u ocultar el modal.
Al cerrar, limpian el campo de contraseña por seguridad.

#### `validarFormulario()`
Valida los campos del formulario modal antes de enviarlo al servidor:
- Nombre de usuario: mínimo 3 caracteres.
- Contraseña actual: obligatoria.
- Avatar: si se selecciona, no puede superar 2 MB.
Devuelve `true` si todo es válido, `false` si hay algún error (y muestra el
mensaje debajo del campo correspondiente).

#### `guardarCambios(e)`
Función `async` del submit del formulario modal. Si la validación pasa,
construye un `FormData` con `username`, `password_actual` y opcionalmente
`avatar`, y hace `PATCH /api/usuarios/perfil/editar/`. Si la respuesta es `ok`,
llama a `renderizarPerfil()` para actualizar la UI sin recargar. Si hay error
(contraseña incorrecta, username duplicado), muestra el mensaje en el feedback
del modal.

#### `cerrarSesion()`
Borra `access_token` y `refresh_token` de **ambos** storages (`localStorage`
y `sessionStorage`) y redirige al login.

---

### `usuarios/models.py`
**Función:** Define el modelo `Perfil`, que extiende el `User` de Django con
una relación `OneToOneField`. Añade campos extra: `avatar` (imagen),
`bio` (texto libre), `fecha_nacimiento`, `pais`, y timestamps automáticos
`created_at` / `updated_at`.

La relación `OneToOne` significa que cada `User` tiene exactamente un `Perfil`
y cada `Perfil` pertenece a exactamente un `User`. Se accede desde el User como
`user.perfil`.

---

### `usuarios/serializers.py`
**Función:** Traduce entre objetos Python (modelos Django) y JSON (para la API).

#### `UsuarioSerializer`
Serializer de **solo lectura**. Usa `SerializerMethodField` para añadir a la
raíz del JSON campos que en el modelo están en sitios distintos:
- `avatar` → viene de `user.perfil.avatar`, se convierte en URL absoluta.
- `capitulos_leidos` / `mangas_leidos` → devuelven `0` por ahora.

Sin estos campos en la raíz, el JS tendría que buscar `datos.perfil_detalle.avatar`
en lugar de simplemente `datos.avatar`.

#### `UsuarioEditarSerializer`
Serializer de **escritura parcial**. Acepta `username`, `password_actual` y
`avatar`. En `validate()` usa `authenticate()` de Django para comprobar que la
contraseña introducida es correcta antes de guardar nada. En `update()` guarda
el `username` en el `User` y el `avatar` en el `Perfil` asociado.

#### `RegistroSerializer`
Crea un `User` nuevo + su `Perfil` en un solo paso. Valida que las dos
contraseñas coincidan y que el email no esté ya registrado.

---

### `usuarios/views.py`
**Función:** Define los endpoints de la API de usuarios.

#### `RegistroView`
Vista pública (`AllowAny`) que expone `POST /api/usuarios/registro/`.

#### `UsuarioViewSet`
ViewSet protegido (`IsAuthenticated`). Siempre opera sobre `request.user`
(el usuario autenticado por el token JWT), nunca acepta un ID externo.

- **`perfil()`** → `GET /api/usuarios/perfil/` — devuelve los datos del usuario
  usando `UsuarioSerializer` con `context={"request": request}` para que el
  serializer pueda construir URLs absolutas del avatar.
- **`editar_usuario()`** → `PATCH /api/usuarios/perfil/editar/` — edita username
  y avatar, requiere `password_actual`. Devuelve el perfil completo actualizado.
- **`editar_perfil()`** → `PATCH /api/usuarios/perfil/editar/extra/` — edita
  datos extra del `Perfil` (bio, país, fecha de nacimiento).
- **`mis_favoritos()`** → `GET /api/usuarios/mis-favoritos/` — reservado para
  implementación futura.

---

### `usuarios/urls.py`
**Función:** Registra las rutas de la app de usuarios.

El router usa prefijo vacío `""` porque `config/urls.py` ya monta esta app en
`/api/usuarios/`. Si el prefijo fuera `"usuarios"`, la URL resultante sería
`/api/usuarios/usuarios/perfil/` (duplicado). Con `""`, queda limpio:
`/api/usuarios/perfil/`.

---

### `componentes/componentes.js`
**Función:** Carga dinámica del header y footer en todas las páginas.

Inyecta los archivos HTML del header y footer en los contenedores
`#contenedor-header` y `#contenedor-footer`, y carga sus CSS desde JS para
no tener que repetir los `<link>` en cada página. También carga `header.js`
dinámicamente una vez que el header está en el DOM.

---

### `componentes/header/header.js`
**Función:** Lógica interactiva del header.

- **Menú hamburguesa** — en móvil, alterna la clase `.cabecera__nav--visible`
  para mostrar/ocultar la navegación.
- **Selector de tema** — combina hover y clic para abrir/cerrar el menú de temas.
  El hover abre con un delay de 200ms al salir para evitar cierres accidentales.
  El clic "fija" el menú abierto aunque el ratón salga.
- **Enlace activo** — lee `window.location.pathname`, extrae el nombre del archivo
  y añade `.cabecera__enlace--activo` al enlace de navegación correspondiente.
- **Persistencia de tema** — lee `localStorage.getItem('tema')` al arrancar y
  aplica el tema guardado.