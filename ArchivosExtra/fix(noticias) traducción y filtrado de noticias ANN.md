
## ¿Qué archivos cambian y para qué sirven?

### `noticias/services/ann.py`
Es el scraper. Se encarga de conectarse al RSS de ANN, parsear el XML
y devolver una lista de noticias limpias para guardar en BD.

**Cambio:** Se añade un filtro que ignora las URLs de tipo `/encyclopedia/`.
Estas URLs son fichas de base de datos (nombre del anime, fechas, estudio...),
no artículos con texto. No tienen `div.meat`, así que nunca generan `contenido`,
y por tanto nunca se traducen. Solo ocupaban espacio en la BD.

---

### `noticias/services/sincronizacion.py`
Es el cerebro del proceso. Coordina: obtener noticias → extraer detalle → traducir → guardar.

**Funciones eliminadas:**
- `_peticion_mymemory(texto)` → cliente directo a MyMemory, límite ~5.000 chars/día por IP
- `_traducir_con_mymemory(texto)` → troceo con `LIMITE=450`, demasiado pequeño,
  generaba decenas de peticiones por noticia y agotaba el límite rápido

**Funciones añadidas:**
- `_traducir_fragmento(texto)` → intenta con `GoogleTranslator`, si falla usa
  `MyMemoryTranslator`, si ambos fallan devuelve el texto original (nunca vacío)
- `_trocear_texto(texto, limite)` → divide el texto respetando `\n\n` entre párrafos;
  si un párrafo supera el límite lo subdivide por oraciones (`. `);
  corte duro solo si una oración es gigante
- `_traducir_texto(texto)` → función principal: trocea + traduce fragmento a fragmento

**Por qué Google Translate y no MyMemory solo:**
MyMemory tiene un límite gratuito de ~5.000 chars/día por IP sin API key.
Un solo artículo largo puede consumirlo entero. Google Translate (vía `deep-translator`,
uso no oficial igual que el navegador) acepta ~500.000 chars/día sin key y es
significativamente más estable para textos cortos y largos.

---

### `noticias/management/commands/retraducir_noticias.py` ← NUEVO
Comando puntual para retraducir noticias que ya están en BD con `contenido`
pero sin `contenido_es` (víctimas del bug anterior).

Solo se ejecuta manualmente cuando hace falta:
`python manage.py retraducir_noticias`

No afecta a noticias ya traducidas (filtra por `contenido_es=""`).