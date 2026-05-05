## 📅 05/05/2026

# 🔐 Login — Resumen explicativo

## `login.html`

Página de inicio de sesión **aislada** (sin header ni footer). El usuario llega, se autentica y vuelve al sitio.

### 📐 Estructura

```
body  
├── .login-fondo → imagen de fondo fija en toda la pantalla  
├── main.login-pagina → contenedor centrado verticalmente  
├── a.login-logo → "anime'n'chill" flotando encima del form  
└── div.login-caja → tarjeta de cristal con todo el contenido  
    ├── header → título "Bienvenido de nuevo"  
    ├── boton-google → OAuth con SVG del logo de Google  
    ├── separador → línea + texto "o con tu correo"  
    ├── form → email, contraseña (con ojo), recuérdame, submit  
    └── footer → "¿Primera vez?" + "Seguir sin cuenta"
```

### ⚙️ Decisiones clave

- `novalidate` en `<form>` → desactiva validación nativa del navegador, la controlamos desde JS
    
- `autocomplete="email"` y `autocomplete="current-password"` → el navegador ofrece autocompletado correctamente
    
- `type="button"` en el botón ojo → si fuera `submit` enviaría el formulario al hacer clic
    
- `id="botonGoogle"` → el JS lo captura para conectar Google Identity Services en Fase 3
    

---

## 🎨 `login.css`

Construye el diseño en tres capas.

### 🖼️ Capa 1 — Fondo de pantalla completa

```css
.login-fondo {
    position: fixed; /* se queda fijo aunque haya scroll */
    inset: 0;        /* top/right/bottom/left: 0 de golpe */
}

.login-fondo__imagen {
    filter: brightness(0.55) saturate(0.75); /* oscurece y desatura la imagen */
}

.login-fondo__overlay {
    background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.6));
    /* degradado encima de la imagen para que el texto sea legible */
}
```

### 📦 Capa 2 — Layout centrado

```css
.login-pagina {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center; /* centra logo + caja en la pantalla */
    min-height: 100vh;
    gap: 1.5rem; /* espacio entre el logo y la caja */
}
```

### 🧊 Capa 3 — Glassmorphism

```css
.login-caja {
    background-color: rgba(12, 12, 12, 0.82); /* negro semitransparente */
    backdrop-filter: blur(18px);              /* desenfoca lo que hay detrás */
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

### 📏 Por qué `box-sizing: border-box`

Sin esto, `width: 100%` + `padding` desborda el contenedor.  
Con `border-box`, el padding se descuenta del ancho total.

```css
/* SIN border-box: input 400px + padding 16px = 432px → desbordamiento */
/* CON border-box: input 400px incluye el padding   → ajuste perfecto  */

.campo__input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.7rem 0.9rem;
}
```

### 👁️ Botón ojo con `position: absolute`

```css
.campo__input-contenedor { 
    position: relative; 
}

.campo__boton-ojo {
    position: absolute;
    top: 50%;
    right: 0.7rem;
    transform: translateY(-50%); /* centrado vertical exacto */
}

/* El input tiene padding-right para que el texto no quede bajo el ojo */
#loginPassword { 
    padding-right: 2.75rem; 
}
```

---

## ⚙️ `login.js`

### 1 — Toggle del ojo

```js
function togglePassword() {
    const estaOculta = INPUT_PASS.type === "password";
    INPUT_PASS.type = estaOculta ? "text" : "password";

    // Actualiza accesibilidad (lectores de pantalla)
    BOTON_OJO.setAttribute("aria-pressed", estaOculta ? "true" : "false");

    // Alterna qué SVG se ve
    document.querySelector(".ojo-icono--cerrado").classList.toggle("oculto", estaOculta);
    document.querySelector(".ojo-icono--abierto").classList.toggle("oculto", !estaOculta);
}
```

### 2 — Submit con validación mínima

```js
async function manejarSubmit(evento) {
    evento.preventDefault(); // evita que la página recargue

    if (!email || !pass) {
        ERROR_GLOBAL_TEXTO.textContent = "Por favor, rellena todos los campos.";
        ERROR_GLOBAL.classList.remove("oculto");
        return;
    }

    boton.disabled    = true;
    boton.textContent = "Entrando..."; // feedback visual al usuario

    try {
        await iniciarSesion(email, pass, recordar);
    } catch (error) {
        // muestra el error que venga del backend
    } finally {
        boton.disabled    = false;
        boton.textContent = "Iniciar sesión"; // restaura siempre
    }
}
```

### 3 — Stubs para fases futuras

```js
// FASE 3 — Google OAuth (prioritaria, Client ID ya disponible)
function manejarGoogle() {
    // google.accounts.id.initialize({ client_id: "TU_ID", callback: onGoogleLogin });
    // google.accounts.id.prompt();
}

// FASE 4 — localStorage vs sessionStorage según "Recuérdame"
function guardarSesion(accessToken, refreshToken, recordar) {
    // const storage = recordar ? localStorage : sessionStorage;
    // storage.setItem("access_token", accessToken);
}

// FASE 5 — JWT con Django REST Framework
async function iniciarSesion(email, password, recordar) {
    // const res = await fetch("/api/token/", { method: "POST", ... });
    // guardarSesion(datos.access, datos.refresh, recordar);
    // window.location.href = ".../novedades.html";
}
```

---

## ⚠️ Pendiente anotado

Los **errores inline por campo** (email inválido, contraseña corta, etc.) se implementarán al finalizar el proyecto, junto con la conexión JWT en Fase 5.