"""
anime'n'chill — Servicio para la API de Anime News Network
Documentación: https://www.animenewsnetwork.com/encyclopedia/api.php

TÉRMINOS DE USO OBLIGATORIOS:
  - Acreditar Anime News Network como fuente
  - Incluir enlace a la entrada de la enciclopedia en cada página que muestre datos
  - Límite: 1 petición por segundo
"""

import time
import requests
import xml.etree.ElementTree as ET

# ------------------- URLs BASE -------------------
REPORTS_URL = "https://www.animenewsnetwork.com/encyclopedia/reports.xml"
DETAILS_URL = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml"

HEADERS = {
    "User-Agent": "animeNchill/1.0 (TFC DAW)"
}

# ------------------- OBTENER NOTICIAS RECIENTES -------------------
def obtener_noticias_recientes(limite: int = 50) -> list:
    """
    Obtiene los últimos títulos (anime/manga) añadidos a ANN.
    Usa el report id=155 que devuelve títulos ordenados por fecha.
    """
    try:
        response = requests.get(
            REPORTS_URL,
            headers=HEADERS,
            params={
                "id":    155,
                "type":  "anime",
                "nlist": limite,
                "nskip": 0,
            },
            timeout=15
        )
        response.raise_for_status()

        root = ET.fromstring(response.content)
        noticias = []

        for item in root.findall(".//item"):
            ann_id = item.get("id", "") or item.findtext("id", default="").strip()
            titulo = item.findtext("name", default="Sin título").strip()
            tipo   = item.findtext("type", default="anime").strip().lower()

            tipo_normalizado = "manga" if "manga" in tipo else "anime"
            descripcion = f"Nuevo título añadido a Anime News Network: {titulo}"
            url_externa = f"https://www.animenewsnetwork.com/encyclopedia/anime.php?id={ann_id}"

            if ann_id:
                noticias.append({
                    "ann_id":      ann_id,
                    "titulo":      titulo,
                    "tipo":        tipo_normalizado,
                    "descripcion": descripcion,
                    "url_externa": url_externa,
                })

        return noticias

    except requests.RequestException as e:
        print(f"[ANN] Error al obtener noticias: {e}")
        return []
    except ET.ParseError as e:
        print(f"[ANN] Error al parsear XML: {e}")
        return []

# ------------------- OBTENER DETALLES DE UN TÍTULO (CON IMAGEN) -------------------
def obtener_detalle(ann_id: str, tipo: str = "title") -> dict | None:
    """
    Obtiene la información detallada de un título, incluyendo la URL de la imagen.
    """
    time.sleep(1) # Respeta el límite de 1 req/s

    try:
        response = requests.get(
            DETAILS_URL,
            headers=HEADERS,
            params={tipo: ann_id},
            timeout=15
        )
        response.raise_for_status()

        root  = ET.fromstring(response.content)
        anime = root.find("anime") or root.find("manga")

        if anime is None:
            return None

        titulo      = anime.get("name", "Sin título")
        url_externa = f"https://www.animenewsnetwork.com/encyclopedia/anime.php?id={ann_id}"
        
        descripcion = ""
        generos = []
        anio = None
        imagen_url = ""

        # Recorremos todos los nodos info
        for info in anime.findall("info"):
            tipo_info = info.get("type")
            
            if tipo_info == "Plot Summary" and not descripcion:
                descripcion = info.text or ""
            
            elif tipo_info == "Genres":
                generos.append(info.text or "")
                
            elif tipo_info == "Vintage" and anio is None:
                try:
                    anio = int((info.text or "")[:4])
                except (ValueError, IndexError):
                    pass
            
            # --- LÓGICA DE EXTRACCIÓN DE IMAGEN ---
            elif tipo_info == "Picture" and not imagen_url:
                if "src" in info.attrib:
                    imagen_url = info.get("src")
                elif info.find("img") is not None:
                    imagen_url = info.find("img").get("src", "")

        return {
            "ann_id":      ann_id,
            "titulo":      titulo,
            "descripcion": descripcion,
            "generos":     generos,
            "anio":        anio,
            "imagen_url":  imagen_url,
            "url_externa": url_externa,
        }

    except requests.RequestException as e:
        print(f"[ANN] Error al obtener detalle {ann_id}: {e}")
        return None
    except ET.ParseError as e:
        print(f"[ANN] Error al parsear XML del detalle: {e}")
        return None

# ------------------- OBTENER DETALLES EN LOTE (CON IMAGEN) -------------------
def obtener_detalles_lote(ann_ids: list, tipo: str = "title") -> list:
    """
    Pide detalles de hasta 50 títulos en una sola petición.
    """
    if not ann_ids:
        return []

    ids_str = "/".join(str(i) for i in ann_ids[:50])
    time.sleep(1)

    try:
        response = requests.get(
            DETAILS_URL,
            headers=HEADERS,
            params={tipo: ids_str},
            timeout=15
        )
        response.raise_for_status()

        root       = ET.fromstring(response.content)
        resultados = []

        for elem in root:
            ann_id      = elem.get("id", "")
            titulo      = elem.get("name", "Sin título")
            descripcion = ""
            generos     = []
            anio        = None
            imagen_url  = ""

            for info in elem.findall("info"):
                tipo_info = info.get("type", "")
                
                if tipo_info == "Plot Summary" and not descripcion:
                    descripcion = info.text or ""
                elif tipo_info == "Genres":
                    generos.append(info.text or "")
                elif tipo_info == "Vintage" and anio is None:
                    try:
                        anio = int((info.text or "")[:4])
                    except (ValueError, IndexError):
                        pass
                # --- LÓGICA DE EXTRACCIÓN DE IMAGEN ---
                elif tipo_info == "Picture" and not imagen_url:
                    if "src" in info.attrib:
                        imagen_url = info.get("src")
                    elif info.find("img") is not None:
                        imagen_url = info.find("img").get("src", "")

            resultados.append({
                "ann_id":      ann_id,
                "titulo":      titulo,
                "descripcion": descripcion,
                "generos":     generos,
                "anio":        anio,
                "imagen_url":  imagen_url,
                "url_externa": f"https://www.animenewsnetwork.com/encyclopedia/anime.php?id={ann_id}",
            })

        return resultados

    except (requests.RequestException, ET.ParseError) as e:
        print(f"[ANN] Error en lote: {e}")
        return []