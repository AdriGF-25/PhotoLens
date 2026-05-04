# ¿Para qué sirven las migraciones en Django?

## El problema que resuelven

La base de datos (SQLite, PostgreSQL...) no sabe nada de Python.
Tú defines tus modelos en `models.py`, pero alguien tiene que
**traducir esos cambios a SQL** y aplicarlos a la BD real.

Ese "alguien" son las migraciones.

---

## La analogía simple

Piensa en tu BD como una hoja de cálculo en la nube:

- `models.py` → el diseño que tú tienes en tu cabeza
- `makemigrations` → escribir los cambios en un papel
- `migrate` → aplicar esos cambios a la hoja real

---

## Los dos comandos y qué hace cada uno

### `python manage.py makemigrations`
- **Qué hace:** Lee tus `models.py` y detecta qué ha cambiado
  respecto a la última migración.
- **Resultado:** Genera un archivo Python en `migrations/`
  (ej: `0005_noticia_contenido_es.py`) que describe el cambio.
- **Modifica la BD:** ❌ NO. Solo crea el archivo, no toca nada.

### `python manage.py migrate`
- **Qué hace:** Lee los archivos de `migrations/` que aún no se
  han aplicado y ejecuta el SQL correspondiente en la BD.
- **Resultado:** La BD queda sincronizada con tus modelos.
- **Modifica la BD:** ✅ SÍ. Este es el que realmente actúa.

`## Flujo completo cada vez que cambias un modelo`

1. Editas models.py → añades/cambias/borras un campo  
    ↓
    
2. makemigrations → Django genera el archivo de cambios  
    ↓
    
3. migrate → Django aplica los cambios a la BD  
    ↓
    
4. runserver → Todo funciona
    
---
## ¿Por qué dos pasos y no uno? 
Porque el archivo generado por `makemigrations` se **guarda en el repo de Git**. Así, cualquier otro desarrollador (o el servidor de producción) puede ejecutar solo `migrate` y obtener exactamente la misma BD sin tener tu código de models.py delante. Es el **historial de versiones de tu base de datos**. --- ## Ejemplo con tu proyecto Añadiste `contenido_es` a `Noticia` →

makemigrations → creó 0005_noticia_contenido_es.py  
migrate → añadió la columna contenido_es a la tabla  
noticias_noticia en db.sqlite3