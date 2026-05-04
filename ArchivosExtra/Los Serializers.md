# Serializers en Django REST Framework

## ¿Qué es un Serializer?

Un Serializer es el **traductor** entre tu modelo Python y el mundo exterior (JSON).

```
Base de datos → Modelo Python → Serializer → JSON (API)
↑ ↓
└───────────────────────────────────┘
(también en sentido inverso)
```

Sin serializer, Django no sabe cómo convertir un objeto `Noticia` en el JSON que el frontend espera, ni validar los datos que llegan del cliente.

---

## Los dos serializers de `noticias`

### `NoticiaSerializer` — Listado ligero

Se usa en el endpoint de listado:

```
GET /api/noticias/
```

**Devuelve solo lo necesario para pintar una tarjeta:**

- id, ann_id, titulo, slug, tipo
    
- descripcion (intro corta)
    
- imagen_url, url_externa
    
- fechas
    

**No incluye:**

- `contenido` (texto completo del artículo)
    
- `contenido_es` (traducción completa)
    
- `tipo_display` (no necesario en tarjeta)
    

> **Por qué:** Si tienes 20 noticias en el listado y cada una devuelve el artículo completo, la respuesta puede pesar varios MB. El listado debe ser rápido y ligero.

---

### `NoticiaDetalleSerializer` — Detalle completo

Se usa en el endpoint de detalle:

```
GET /api/noticias/{slug}/
```

**Añade sobre el anterior:**

|Campo|Qué es|
|---|---|
|`contenido`|Texto completo del artículo en inglés|
|`contenido_es`|Texto completo traducido al español|
|`tipo_display`|Texto legible del tipo ("Anime" en vez de "anime")|

---

## `tipo_display` — campo calculado

```python
tipo_display = serializers.CharField(
    source="get_tipo_display",
    read_only=True
)
```

**Qué hace paso a paso:**

1. `source="get_tipo_display"` le dice al serializer que llame al método `get_tipo_display()` del modelo
    
2. Django genera ese método automáticamente en campos con `choices` (como `tipo = CharField(choices=Tipo.choices)`)
    
3. Convierte el valor interno `"anime"` → texto legible `"Anime"`
    
4. `read_only=True` porque es un valor calculado, no se puede escribir desde fuera
    

---

## `read_only_fields`

```python
read_only_fields = ["id", "slug", "sincronizado_en", "created_at"]
```

Estos campos **no se pueden modificar desde la API**:

|Campo|Por qué es read_only|
|---|---|
|`id`|Lo asigna la BD automáticamente|
|`slug`|Lo genera el método `save()` del modelo|
|`sincronizado_en`|`auto_now=True` → Django lo actualiza solo|
|`created_at`|`auto_now_add=True` → se asigna al crear, nunca cambia|

---

## Flujo completo en tu proyecto

### Listado

```
Frontend pide GET /api/noticias/
↓
NoticiaViewSet llama a NoticiaSerializer(queryset, many=True)
↓
Serializer convierte cada objeto Noticia → dict Python
↓
DRF convierte los dicts → JSON
↓
Frontend recibe la lista de tarjetas
```

---

### Detalle

```
Frontend pide GET /api/noticias/titulo-del-articulo/
↓
NoticiaViewSet llama a NoticiaDetalleSerializer(noticia)
↓
Serializer incluye contenido + contenido_es + tipo_display
↓
Frontend recibe el artículo completo con la traducción
```