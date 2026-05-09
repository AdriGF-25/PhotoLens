# 🔐 Login — anime'n'chill

**Fecha:** 06/05/2026

---

## ¿Qué hace este módulo?

Página aislada (sin header ni footer) que autentica al usuario  
con email y contraseña, obtiene tokens JWT del backend Django  
y los persiste en el navegador para mantener la sesión activa.

---

## 📐 login.html — Estructura

```
body  
├── .login-fondo → imagen de fondo fija en pantalla completa  
├── main.login-pagina → contenedor centrado verticalmente  
├── a.login-logo → "anime'n'chill" flotando encima del form  
└── div.login-caja → tarjeta glassmorphism con todo el contenido  
    ├── header → título "Bienvenido de nuevo"  
    ├── form → email, contraseña (con ojo), recuérdame, submit  
    └── footer → "¿Primera vez?" + "Seguir sin cuenta"
```

### Decisiones clave

|Decisión|Motivo|
|---|---|
|`novalidate` en `<form>`|Desactiva validación nativa, la controlamos desde JS|
|`autocomplete="email"` y `"current-password"`|El navegador ofrece autocompletado correcto|
|`type="button"` en el ojo|Si fuera `submit` enviaría el formulario al hacer clic|
|`role="alert"` en el error|Los lectores de pantalla anuncian el error automáticamente|

> ⚠️ El botón Google fue eliminado — ver sección Google OAuth.

---

## 🎨 login.css — Las tres capas

### Capa 1 — Fondo pantalla completa

```css
.login-fondo {
    position: fixed; /* fijo aunque haya scroll */
    inset: 0;        /* top/right/bottom/left: 0 de golpe */
}

.login-fondo__imagen {
    filter: brightness(0.55) saturate(0.75); /* oscurece y desatura */
}

.login-fondo__overlay {
    background: linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.6));
}
```

### Capa 2 — Layout centrado

```css
.login-pagina {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1.5rem;
}
```

### Capa 3 — Glassmorphism

```css
.login-caja {
    background-color: rgba(12, 12, 12, 0.82);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
```

### Botón ojo con `position: absolute`

```css
.campo__input-contenedor { position: relative; }

.campo__boton-ojo {
    position: absolute;
    top: 50%;
    right: 0.7rem;
    transform: translateY(-50%); /* centrado vertical exacto */
}

#loginPassword { padding-right: 2.75rem; } /* evita que el texto tape el ojo */
```

### Responsive — 4 breakpoints

|Breakpoint|Ajuste|
|---|---|
|> 1100px|Layout completo|
|1100 – 701px|Márgenes y fuentes reducidos|
|700 – 501px|Caja a ancho completo|
|≤ 500px|Vista móvil compacta|

---

## ⚙️ login.js — Funciones

### 1 — Toggle del ojo

```js
function togglePassword() {
    const estaOculta = INPUT_PASS.type === "password";

    INPUT_PASS.type = estaOculta ? "text" : "password";

    BOTON_OJO.setAttribute("aria-pressed", estaOculta ? "true" : "false");

    document.querySelector(".ojo-icono--cerrado").classList.toggle("oculto", estaOculta);
    document.querySelector(".ojo-icono--abierto").classList.toggle("oculto", !estaOculta);
}
```

### 2 — Guardar sesión

```js
function guardarSesion(accessToken, refreshToken, recordar) {
    const storage = recordar ? localStorage : sessionStorage;

    storage.setItem("access_token",  accessToken);
    storage.setItem("refresh_token", refreshToken);
}
```

- **`localStorage`** → persiste aunque cierres el navegador
    
- **`sessionStorage`** → se borra al cerrar la pestaña
    

### 3 — Login real contra Django

```js
async function iniciarSesion(email, password, recordar) {
    const res = await fetch("http://127.0.0.1:8000/api/token/", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: email, password })
    });

    const datos = await res.json();

    if (!res.ok) throw new Error(datos.detail || "Credenciales incorrectas.");

    guardarSesion(datos.access, datos.refresh, recordar);

    window.location.href = "/front-end/paginas/novedades/novedades.html";
}
```

### 4 — Submit con feedback visual

```js
async function manejarSubmit(evento) {
    evento.preventDefault();

    if (!email || !pass) {
        /* muestra error y para */
        return;
    }

    boton.disabled    = true;
    boton.textContent = "Entrando...";   // feedback inmediato

    try {
        await iniciarSesion(email, pass, recordar);
    } catch (error) {
        ERROR_GLOBAL_TEXTO.textContent = error.message;
        ERROR_GLOBAL.classList.remove("oculto");
    } finally {
        boton.disabled    = false;       // restaura siempre
        boton.textContent = "Iniciar sesión";
    }
}
```

---

## 🔄 Flujo completo

```
Usuario rellena email + contraseña  
↓  
manejarSubmit() — valida campos  
↓  
iniciarSesion() → POST /api/token/  
↓  
Django SimpleJWT devuelve { access, refresh }  
↓  
guardarSesion() → localStorage / sessionStorage  
↓  
Redirección a novedades.html
```

---

## 🔑 Tokens JWT

|Token|Duración|Dónde|
|---|---|---|
|Access|60 minutos|`localStorage` o `sessionStorage`|
|Refresh|7 días (con rotación)|`localStorage` o `sessionStorage`|

---

## 🔴 Google OAuth — Por qué se descartó

Se implementaron tres enfoques en orden:

1. **FedCM / One Tap** → Chrome lo bloquea en localhost sin HTTPS
    
2. **`renderButton()` con SDK** → error `Missing client_id` al recargar
    
3. **Redirección OAuth 2.0** → `callback.html` no podía comunicarse con Django por CORS en localhost
    

**Conclusión:** Google OAuth requiere HTTPS. Se implementará cuando el proyecto esté desplegado en producción.

---

## ⏳ Pendiente

- Registro → conectar "Crea una cuenta gratis"
    
- Recuperación de contraseña
    
- Navbar → leer token para mostrar nombre del usuario
    
- Protección de rutas → redirigir a login si no hay token
    
- Google OAuth → retomar en producción con HTTPS


---

