## Funcion del archivo

Script de diagnostico interactivo para el modulo de manga de anime'n'chill.
Se ejecuta dentro del shell de Django y permite inspeccionar el estado de los
archivos de manga en `media/Manga/` y cruzarlo con la base de datos, sin
necesidad de hacer comandos manuales de sistema de archivos.

---

## Como ejecutarlo

```powershell
cd back-end
python manage.py shell -c "exec(open('diagnostico_manga.py', encoding='utf-8').read())"
```

---

## Menu de opciones

| Opcion | Nombre              | Que hace                                                                 |
|--------|---------------------|--------------------------------------------------------------------------|
| 1      | Resumen general     | Muestra conteos rapidos: total mangas, en BD, con caps, por estructura   |
| 2      | Estructura detallada| Tabla con patron de carpetas detectado, formato de imagen y nº imagenes  |
| 3      | Explorar manga      | Submenu para seleccionar un manga y ver sus subcarpetas con conteo imgs  |
| 4      | Estado en BD        | Que mangas estan/no estan registrados y cuantos capitulos tienen         |
| 5      | Reporte completo    | Ejecuta resumen + estructura + BD encadenados con pausa entre secciones  |
| 0      | Salir               | Cierra el script                                                         |

---

## Funciones internas

### `detectar_formato(ruta)`
- **Que hace:** Recorre recursivamente una carpeta contando archivos por extension
  (jpg, jpeg, png, webp). Une jpg+jpeg. Devuelve el formato dominante y el total.
- **Por que:** Cada manga usa un formato distinto segun su origen. Necesitamos
  saberlo para el management command de poblado.
- **Devuelve:** `(formato: str, total_imagenes: int)`

---

### `analizar_estructura(ruta_dir)`
- **Que hace:** Lista el contenido de la carpeta raiz de un manga y clasifica
  su estructura en uno de tres tipos segun lo que encuentre:

| Tipo        | Condicion                                     | Ejemplo                        |
|-------------|-----------------------------------------------|--------------------------------|
| `volumenes` | Hay subcarpetas dentro                        | `Vol 10_Chap 79_Titulo/`       |
| `directo`   | Hay imagenes directamente en la raiz          | `001.jpg`, `002.jpg`...        |
| `vacio`     | No hay ni subcarpetas ni imagenes             | Carpeta vacia                  |

- Dentro de `volumenes`, detecta el patron del nombre:
  - `Vol XX_Chap YY_Titulo` → contiene `_Chap` en el nombre
  - `Numero (caps directos)` → el nombre es un digito puro (`"1"`, `"12"`)
  - `Libre: "..."` → cualquier otro formato (muestra los primeros 20 chars)
- **Devuelve:** `(tipo: str, patron: str, subcarpetas: list)`

---

### `bd_estado(titulo)`
- **Que hace:** Busca en la BD un `Manga` cuyo `titulo` coincida exactamente
  con el nombre de la carpeta. Devuelve el objeto y el numero de capitulos.
- **Por que:** El nombre de la carpeta en `media/Manga/` se usa como clave
  de busqueda para cruzar con el modelo `Manga`.
- **Devuelve:** `(manga: Manga | None, num_capitulos: int)`

---

### `vista_resumen()`
- Llama a `analizar_estructura` y `bd_estado` para cada carpeta.
- Acumula contadores y los imprime formateados con colores ANSI.

---

### `vista_estructura()`
- Tabla completa con todos los mangas: tipo de estructura, patron detectado,
  formato de imagen, total de imagenes y numero de subcarpetas.

---

### `vista_explorar()`
- Muestra un submenu numerado con todos los mangas.
- Al seleccionar uno, muestra:
  - Ruta absoluta en disco
  - Tipo de estructura y patron
  - Formato e imagenes totales
  - Lista de hasta 15 subcarpetas con cuantas imagenes tiene cada una
  - Estado en BD (ID, numero de capitulos)

---

### `vista_bd()`
- Tabla de todos los mangas con tres posibles estados:

| Color  | Estado                        |
|--------|-------------------------------|
| Verde  | Registrado con capitulos en BD|
| Amarillo| Registrado pero sin capitulos|
| Rojo   | No registrado en BD           |

---

### `vista_completa()`
- Encadena `vista_resumen` → `vista_estructura` → `vista_bd` con una pausa
  entre cada seccion para no saturar la consola.

---

## Modelos de Django que usa

| Modelo     | Uso                                                        |
|------------|------------------------------------------------------------|
| `Manga`    | Busqueda por `titulo` para comprobar si esta registrado    |
| `Capitulo` | Cuenta cuantos capitulos tiene cada manga via `.capitulos` |

Ambos importados desde `anime.models`.

---

## Patrones de estructura detectados en el proyecto

| Manga                              | Patron real                        | Formato |
|------------------------------------|------------------------------------|---------|
| BLAME!, Chainsaw Man, Fire Force   | `Vol XX_Chap YY_Titulo`            | jpg     |
| One Piece, SPY x FAMILY            | `Vol XX_Chap YY_Titulo`            | jpg     |
| Solo Leveling (x3)                 | `Capitulo X`                       | webp    |
| Horimiya                           | `Last Heaven Fansub_VXX_...`       | jpg     |
| Gachiakuta                         | Numerico hebreo/mixto              | png     |
| Zero kara, Kimetsu, Misuto's       | `Capitulo X` / unico               | jpg     |

---

## Notas

- El script **no modifica nada** en disco ni en BD. Es solo lectura.
- Si un manga esta en BD pero su carpeta tiene un nombre diferente,
  `bd_estado` no lo encontrara (busqueda exacta por titulo).
- Los colores ANSI funcionan en PowerShell de Windows 10+ y en terminales Linux/Mac.