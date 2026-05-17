## Funcion del archivo

Management command de Django que lee las carpetas de `media/Manga/` y crea
un objeto `Manga` en la BD por cada una que encuentre.
Es el paso previo obligatorio antes de ejecutar `poblar_capitulos`,
ya que ese command necesita que el manga exista en BD para poder
asignarle capitulos.

---

## Por que existe este command

Sin el, habria que registrar cada manga a mano desde el admin de Django
o escribir un shell one-liner por cada uno. Con 13 mangas actuales
(y posibles nuevos en el futuro) eso es inviable. Este command
lo automatiza completamente — si manana añades una carpeta nueva
a `media/Manga/`, ejecutas el command y ya esta registrado.

---

## Como usarlo

```powershell
# Simular sin tocar la BD (recomendado primero)
python manage.py registrar_mangas --dry-run

# Ejecutar de verdad
python manage.py registrar_mangas
```

---

## Flujo interno paso a paso
python manage.py registrar_mangas
│
▼

Comprueba que existe media/Manga/
│
▼

Lista todas las subcarpetas de media/Manga/
(cada carpeta = un manga)
│
▼

Por cada carpeta:
└── Manga.objects.get_or_create(titulo=nombre_carpeta)
├── Si NO existe → lo crea con estado "ongoing"
└── Si YA existe → lo deja como esta
│
▼

Imprime resultado por manga y resumen final

text

---

## La clave: `get_or_create`

```python
Manga.objects.get_or_create(
    titulo=titulo,           # ← campo de busqueda
    defaults={               # ← solo se usa si hay que CREAR
        "estado": "ongoing"
    }
)
```

- Busca en BD un `Manga` con ese `titulo` exacto
- Si NO existe → lo crea con `estado = "ongoing"` como valor inicial
- Si YA existe → no hace nada, devuelve el existente
- Esto lo hace **seguro de ejecutar N veces** sin duplicar datos

### Por que solo guarda el titulo y el estado

El resto de campos (`autor`, `descripcion`, `portada_url`, `mangadex_id`...)
los rellena `scrapear_portadas` consultando la API de MangaDex.
Este command solo hace el registro minimo necesario para que
`poblar_capitulos` pueda funcionar.

---

## El flag `--dry-run`

Cuando se ejecuta con `--dry-run`:
- No llama a `get_or_create`
- Solo comprueba con `filter().exists()` si el manga ya esta en BD
- Imprime lo que HARIA sin hacer nada

| Color    | Significado en dry-run         |
|----------|-------------------------------|
| Verde    | Se crearia (no existe en BD)  |
| Amarillo | Ya existe, se saltaria        |

---

## Relacion con los otros commands
registrar_mangas → crea objetos Manga en BD
↓
poblar_capitulos → crea objetos Capitulo por cada subcarpeta
↓
scrapear_portadas → rellena portada_url, autor, descripcion
consultando MangaDex por mangadex_id

text

Orden obligatorio: primero `registrar_mangas`, luego los otros dos
(en cualquier orden entre ellos).

---

## Que pasa si añades un manga nuevo
Crear carpeta en media/Manga/Nuevo Manga/

Meter las subcarpetas de capitulos dentro

python manage.py registrar_mangas → crea el registro en BD

python manage.py poblar_capitulos --manga "Nuevo Manga"
→ crea los capitulos

text

Sin tocar nada de codigo.

---

## Tabla de nombres — carpeta vs BD

El command usa el nombre de carpeta **exactamente igual** como `titulo`
en la BD. Esto es importante porque `poblar_capitulos` y
`scrapear_portadas` tambien buscan por ese titulo exacto.

| Carpeta en disco                         | titulo en BD                             |
|------------------------------------------|------------------------------------------|
| `Chainsaw Man`                           | `Chainsaw Man`                           |
| `Solo Leveling Hunter Origin`            | `Solo Leveling Hunter Origin`            |
| `Kimetsu no Yaiba Rengoku Kyojuro Gaiden`| `Kimetsu no Yaiba Rengoku Kyojuro Gaiden`|

Si renombras una carpeta, el manga en BD queda huerfano
(sus capitulos siguen apuntando a la ruta antigua).
En ese caso usa `--limpiar` en `poblar_capitulos` tras actualizar el titulo.