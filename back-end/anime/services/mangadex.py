"""
anime'n'chill — Consulta a la API pública de MangaDex v5
Responsabilidad: solo hablar con la API y leer el sistema de archivos.
Nunca toca la base de datos.
"""

import os
import requests
from django.conf import settings


# ------------------- CONSTANTES ------------------- #

BASE_URL   = "https://api.mangadex.org"
CDN_URL    = "https://uploads.mangadex.org/covers"
COVER_SIZE = "512"  # Opciones: 256 | 512 | sin sufijo = original

# Solo añade aquí mangas cuyo nombre de carpeta NO funcione en MangaDex tal cual
# Prueba primero con la opción [4] del menú antes de añadir un término custom
TERMINOS_CUSTOM = {
    "Kimetsu no Yaiba Rengoku Kyojuro Gaiden" : "Kimetsu no Yaiba: Rengoku Kyojuro Gaiden",
    "Solo Leveling Hunter Origin"             : "Solo Leveling: Hunter's Origin",
    "Solo Leveling Ragnarok"                  : "Solo Leveling: Ragnarok",
    "Misuto's Anatomy Records"                : "Mitsutoshi Shimabukuro Anatomy Records",
}


# ------------------- CATÁLOGO DINÁMICO ------------------- #

def get_catalogo_local() -> dict:
    """
    Lee las carpetas de media/Manga/ y construye el catálogo dinámicamente.
    Cada vez que se añade una carpeta nueva, aparece aquí sin tocar código.

    Retorna:
        { "Nombre carpeta": "Término búsqueda MangaDex", ... }
    """
    ruta_manga = os.path.join(settings.MEDIA_ROOT, "Manga")

    if not os.path.exists(ruta_manga):
        return {}

    carpetas = [
        nombre for nombre in os.listdir(ruta_manga)
        if os.path.isdir(os.path.join(ruta_manga, nombre))
    ]

    return {
        titulo: TERMINOS_CUSTOM.get(titulo, titulo)
        for titulo in sorted(carpetas)
    }


# ------------------- HELPERS PRIVADOS ------------------- #

def _construir_url_portada(manga_id: str, filename: str) -> str:
    return f"{CDN_URL}/{manga_id}/{filename}.{COVER_SIZE}.jpg"


def _extraer_portada_filename(relationships: list) -> str | None:
    for rel in relationships:
        if rel.get("type") == "cover_art":
            return rel.get("attributes", {}).get("fileName")
    return None


def _extraer_generos(attributes: dict) -> list[str]:
    tags = attributes.get("tags", [])
    return [
        t["attributes"]["name"].get("es") or t["attributes"]["name"].get("en", "")
        for t in tags
        if t.get("attributes", {}).get("name")
    ]


def _extraer_descripcion(attributes: dict) -> str:
    desc = attributes.get("description", {})
    return desc.get("es") or desc.get("en") or ""


def _extraer_autor(relationships: list) -> str:
    for rel in relationships:
        if rel.get("type") == "author":
            return rel.get("attributes", {}).get("name", "")
    return ""


# ------------------- FUNCIÓN PÚBLICA ------------------- #

def consultar_manga(termino: str) -> dict | None:
    """
    Busca un manga en MangaDex por título y devuelve sus datos en crudo.
    NO toca la base de datos. Devuelve None si no lo encuentra o hay error.

    Retorna:
        {
          "mangadex_id":  "uuid...",
          "portada_url":  "https://uploads.mangadex.org/...",
          "descripcion":  "...",
          "generos":      ["Acción", "Fantasía", ...],
          "autor":        "Nombre autor",
          "estado_raw":   "completed" | "ongoing" | "hiatus" | "cancelled"
        }
    """
    try:
        resp = requests.get(
            f"{BASE_URL}/manga",
            params={
                "title"           : termino,
                "limit"           : 1,
                "includes[]"      : ["cover_art", "author"],
                "contentRating[]" : ["safe", "suggestive", "erotica"],
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("data", [])

    except requests.RequestException as e:
        print(f"[MangaDex] Error en petición para '{termino}': {e}")
        return None

    if not data:
        return None

    manga_data     = data[0]
    manga_id       = manga_data["id"]
    attributes     = manga_data.get("attributes", {})
    relationships  = manga_data.get("relationships", [])
    cover_filename = _extraer_portada_filename(relationships)

    if not cover_filename:
        return None

    return {
        "mangadex_id" : manga_id,
        "portada_url" : _construir_url_portada(manga_id, cover_filename),
        "descripcion" : _extraer_descripcion(attributes),
        "generos"     : _extraer_generos(attributes),
        "autor"       : _extraer_autor(relationships),
        "estado_raw"  : attributes.get("status", ""),
    }