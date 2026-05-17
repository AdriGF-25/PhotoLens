# poblar_capitulos.py — Explicacion completa

## Funcion del archivo

Management command de Django que lee la estructura de carpetas de `media/Manga/`
y crea registros `Capitulo` en la base de datos por cada subcarpeta encontrada.
No descarga nada de internet — trabaja 100% con los archivos locales.

---

## Como encaja en el proyecto
media/Manga/
└── Chainsaw Man/ ← carpeta del manga (debe existir en BD)
├── Vol 1_Chap 1_.../ ← cada subcarpeta = 1 capitulo
├── Vol 1_Chap 2_.../
└── ...

↓ el command lee esto

BD → tabla Capitulo
├── manga: Chainsaw Man
├── numero: 1.0
├── volumen: 1
├── titulo: "Motosierra..."
└── ruta_imagenes: "Manga/Chainsaw Man/Vol 1_Chap 1_..."

text

---

## Flujo de ejecucion paso a paso
python manage.py poblar_capitulos
│
▼

Lee argumentos (--manga, --dry-run, --limpiar)
│
▼

Busca mangas en BD
├── Si --manga → solo ese
└── Si no → todos
│
▼

Por cada manga:
└── Busca su carpeta en media/Manga/{titulo}/
│
▼

Lista las subcarpetas (= capitulos)
│
▼

Por cada subcarpeta:
└── _procesar_carpeta_capitulo()
│
├── Cuenta imagenes dentro
├── Detecta el patron del nombre
└── Devuelve datos del capitulo
│
▼

Capitulo.objects.get_or_create(...)
├── Si no existe → lo crea
└── Si ya existe → lo ignora (no duplica)
│
▼

Imprime resumen por manga y global

text

---

## Los 3 patrones de nombre de carpeta

El command detecta automaticamente el formato del nombre de cada subcarpeta:

### Patron 1 — `Vol XX_Chap YY_Titulo`
"Vol 10_Chap 79_ Antes De La Lucha"
│
▼
numero = 79.0
volumen = 10
titulo = "Antes De La Lucha"

text
Mangas que lo usan: BLAME!, Chainsaw Man, Fire Force, One Piece, SPY x FAMILY

---

### Patron 2 — `Capitulo X`
"Capitulo 1"
│
▼
numero = 1.0
volumen = None
titulo = "Capitulo 1"

text
Mangas que lo usan: Solo Leveling (x3), Zero kara, Horimiya (parcial)

---

### Patron 3 — Nombre libre / unico
"Parte 1" o "Capítulo 1 OneShot"
│
▼
numero = primer numero encontrado (o 0.0 si no hay)
volumen = None
titulo = nombre completo de la carpeta

text
Mangas que lo usan: Kimetsu, Misuto's, Gachiakuta

---

## Funciones internas

### `_es_imagen(nombre_archivo)`
- Recibe el nombre de un archivo
- Comprueba si su extension esta en `{.jpg, .jpeg, .png, .webp}`
- Se usa para no contar archivos raros (.txt, .DS_Store, etc.)

---

### `_extraer_numero(texto)`
- Busca el primer numero (entero o decimal) en un string
- Ejemplos:
  - `"Capitulo 7"` → `7.0`
  - `"Ch.007.5"` → `7.5`
  - `"Parte especial"` → `None`

---

### `_extraer_volumen_y_cap(nombre_carpeta)`
- Solo actua si el nombre sigue el patron `Vol X_Chap Y_`
- Usa una expresion regular para extraer:
  - Numero de volumen (entero)
  - Numero de capitulo (puede ser decimal: 7.5)
  - Titulo del capitulo (el texto despues del segundo `_`)
- Si el nombre no encaja devuelve `None` y se pasa al patron siguiente

---

### `_procesar_carpeta_capitulo(ruta, nombre, manga_titulo)`
- Funcion central que une todo lo anterior
- Primero cuenta las imagenes dentro de la carpeta
- Si no hay imagenes → devuelve `None` (la carpeta se ignora)
- Construye la `ruta_relativa` desde `MEDIA_ROOT` para guardar en BD
  - Normaliza `\` a `/` (compatibilidad Windows/Linux)
- Prueba los patrones en orden: Patron 1 → Patron 2/3
- Devuelve un dict con todos los datos listos para crear el `Capitulo`

---

## Los 3 flags del comando

| Flag | Que hace | Cuando usarlo |
|------|----------|---------------|
| `--manga "Titulo"` | Procesa solo ese manga | Para probar uno antes del resto |
| `--dry-run` | Simula sin tocar la BD | SIEMPRE antes de la primera ejecucion real |
| `--limpiar` | Borra caps existentes y repobla | Si renombraste carpetas o hay errores |

---

## Que guarda en BD por cada capitulo

| Campo | De donde viene | Ejemplo |
|-------|----------------|---------|
| `manga` | Objeto Manga de la BD | Chainsaw Man |
| `numero` | Extraido del nombre de carpeta | 79.0 |
| `titulo` | Extraido del nombre de carpeta | "Antes De La Lucha" |
| `volumen` | Extraido del nombre (o None) | 10 |
| `ruta_imagenes` | Ruta relativa a MEDIA_ROOT | "Manga/Chainsaw Man/Vol 10_Chap 79_..." |

---

## Por que usa `get_or_create`

```python
Capitulo.objects.get_or_create(
    manga  = manga,
    numero = datos["numero"],   # ← clave unica
    defaults={ ... }            # ← solo se usa al CREAR
)
```

- Busca si ya existe un `Capitulo` con ese `manga` + `numero`
- Si NO existe → lo crea con los `defaults`
- Si YA existe → lo deja como esta (no sobreescribe)
- Esto lo hace **idempotente**: puedes ejecutarlo 10 veces y el resultado
  es siempre el mismo, sin duplicados

---

## Requisito previo: el manga debe estar en BD

El command busca `Manga.objects.filter(titulo=manga_filtro)` usando el nombre
**exacto** de la carpeta. Si la carpeta se llama `"Chainsaw Man"` pero en BD
el titulo es `"Chainsaw man"` (minuscula) → no lo encuentra.

Ahora mismo solo `Fire Force` esta registrado en BD.
Para el resto necesitas registrarlos primero (via admin Django o command aparte).

---

## Flujo recomendado primera vez
python manage.py poblar_capitulos --manga "Fire Force" --dry-run
→ Comprueba que detecta bien los capitulos

python manage.py poblar_capitulos --manga "Fire Force"
→ Lo ejecuta de verdad para Fire Force

Registrar el resto de mangas en BD (admin o command registrar_mangas)

python manage.py poblar_capitulos --dry-run
→ Simula todos

python manage.py poblar_capitulos
→ Pobla todos

