Checklist de pruebas — hazlas en orden
Registro
Casos correctos:

Nombre y apellido vacíos + resto correcto → se crea la cuenta igualmente

Todos los campos rellenos correctamente → redirige a /login?registro=ok

En Django admin (http://127.0.0.1:8000/admin) → el User y su Perfil aparecen creados

Casos de error (cada uno debe mostrar mensaje rojo):

username vacío → "Por favor, rellena todos los campos obligatorios"

email vacío → mismo mensaje

Contraseña de 5 caracteres → "La contraseña debe tener al menos 6 caracteres"

Las dos contraseñas distintas → "Las contraseñas no coinciden"

Username ya existente → mensaje del servidor

Email ya existente → mensaje del servidor

Botón queda deshabilitado mientras procesa y se reactiva después

DevTools → Network:

La petición a /api/usuarios/registro/ devuelve 201

Con datos incorrectos devuelve 400 con JSON de error

Login
Casos correctos:

Venir de registro → banner verde visible "✓ Cuenta creada correctamente"

Email y contraseña correctos → redirige a novedades

"Recuérdame" desmarcado → token en sessionStorage (DevTools → Application)

"Recuérdame" marcado → token en localStorage

Botón ojo alterna visibilidad de la contraseña

Casos de error (cada uno debe mostrar mensaje rojo):

Campos vacíos → "Por favor, rellena todos los campos"

Solo email sin contraseña → mismo mensaje

Credenciales incorrectas → mensaje del servidor

Botón queda deshabilitado mientras procesa y se reactiva después

Redirección si ya logueado:

Con token en storage → entrar a /login redirige directo a novedades sin ver el formulario