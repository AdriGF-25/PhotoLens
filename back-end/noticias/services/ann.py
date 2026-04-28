"""
anime'n'chill — Servicio RSS de Anime News Network
Fuente: https://www.animenewsnetwork.com/all/rss.xml

TÉRMINOS DE USO:
  - Acreditar ANN como fuente en cada página que muestre datos
  - Incluir enlace al artículo original
  - No saturar el servidor (sleep entre peticiones)
"""

import time
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup


# ------------------- URLS -------------------

RSS_URL = "https://www.animenewsnetwork.com/all/rss.xml?ann-edition=us"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; animeNchill/1.0; TFC DAW)"
}


# ------------------- OBTENER NOTICIAS DESDE RSS -------------------

def obtener_noticias_recientes(limite: int = 30) -> list:
    """
    Obtiene las últimas noticias reales del RSS de ANN.
    Cada entrada incluye título, descripción, enlace, fecha y categoría.
    """
    try:
        response = requests.get(RSS_URL, headers=HEADERS, timeout=15)
        response.raise_for_status()

        root    = ET.fromstring(response.content)
        channel = root.find("channel")

        if channel is None:
            print("[ANN RSS] No se encontró el canal RSS.")
            return []

        noticias = []

        for item in channel.findall("item")[:limite]:
            titulo      = (item.findtext("title") or "Sin título").strip()
            descripcion = (item.findtext("description") or "").strip()
            url_externa = (item.findtext("link") or "").strip()
            pub_date    = (item.findtext("pubDate") or "").strip()
            categoria   = (item.findtext("category") or "anime").strip().lower()

            ann_id = _generar_id_desde_url(url_externa)

            if not ann_id or not titulo:
                continue

            tipo = _normalizar_tipo(categoria)

            noticias.append({
                "ann_id":      ann_id,
                "titulo":      titulo,
                "descripcion": descripcion,
                "url_externa": url_externa,
                "fecha_ann":   pub_date,
                "tipo":        tipo,
                "imagen_url":  "",
                "contenido":   "",
            })

        return noticias

    except requests.RequestException as e:
        print(f"[ANN RSS] Error al obtener el feed: {e}")
        return []
    except ET.ParseError as e:
        print(f"[ANN RSS] Error al parsear XML: {e}")
        return []


# ------------------- OBTENER IMAGEN Y CONTENIDO DEL ARTÍCULO -------------------

def obtener_detalle_articulo(url: str) -> dict:
    """
    Visita la URL del artículo de ANN y extrae:
      - og:image   → imagen principal del artículo
      - div.meat   → cuerpo completo del artículo

    Devuelve un dict con 'imagen_url' y 'contenido'.
    Respeta el servidor con un sleep de 1 segundo entre peticiones.
    """
    resultado = {"imagen_url": "", "contenido": ""}

    if not url:
        return resultado

    time.sleep(1)

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # ---- Imagen (og:image) ----
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            resultado["imagen_url"] = og_image["content"].strip()
        else:
            tw_image = soup.find("meta", attrs={"name": "twitter:image"})
            if tw_image and tw_image.get("content"):
                resultado["imagen_url"] = tw_image["content"].strip()

        # ---- Contenido del artículo (div.meat) ----
        meat = soup.find("div", class_="meat")
        if meat:
            # Eliminamos scripts, estilos y elementos de navegación que pueda tener
            for tag in meat.find_all(["script", "style", "nav", "aside"]):
                tag.decompose()

            # Extraemos el texto limpio párrafo a párrafo
            parrafos = []
            for elemento in meat.find_all(["p", "h2", "h3", "ul", "ol"]):
                texto = elemento.get_text(separator=" ", strip=True)
                if texto:
                    parrafos.append(texto)

            resultado["contenido"] = "\n\n".join(parrafos)

        return resultado

    except requests.RequestException as e:
        print(f"[ANN RSS] Error al obtener artículo de {url}: {e}")
        return resultado
    except Exception as e:
        print(f"[ANN RSS] Error inesperado al parsear {url}: {e}")
        return resultado


# ------------------- UTILIDADES PRIVADAS -------------------

def _generar_id_desde_url(url: str) -> str:
    """
    Genera un ID único a partir de la URL del artículo.
    Ejemplo:
      https://www.animenewsnetwork.com/news/2026-04-27/chainsaw-man.nn12345
      → news-2026-04-27-chainsaw-man-nn12345
    """
    if not url:
        return ""
    path = url.replace("https://www.animenewsnetwork.com/", "")
    return path.replace("/", "-").replace(".", "-")[:150]


def _normalizar_tipo(categoria: str) -> str:
    """
    Mapea las categorías del RSS al tipo del modelo Noticia.
    """
    if "manga" in categoria:
        return "manga"
    return "anime"