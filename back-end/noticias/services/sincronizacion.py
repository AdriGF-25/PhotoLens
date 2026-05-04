"""
anime'n'chill — Lógica de sincronización de noticias desde RSS de ANN
"""

import requests
from noticias.models import Noticia
from noticias.services.ann import obtener_noticias_recientes, obtener_detalle_articulo


# ------------------- CLIENTE MYMEMORY -------------------

def _peticion_mymemory(texto: str) -> str:
    try:
        respuesta = requests.get(
            "https://api.mymemory.translated.net/get",
            params={
                "q":        texto,
                "langpair": "en|es",
            },
            timeout=10,
        )
        datos      = respuesta.json()
        traduccion = datos.get("responseData", {}).get("translatedText", "")

        # MyMemory devuelve este mensaje como "traducción" cuando supera el límite
        if not traduccion or "QUERY LENGTH LIMIT" in traduccion.upper():
            print(f"[MyMemory] Fragmento rechazado ({len(texto)} chars): {traduccion}")
            return ""

        return traduccion

    except Exception as e:
        print(f"[MyMemory] Error al traducir: {e}")
        return ""

def _traducir_con_mymemory(texto: str) -> str:
    """
    Traduce inglés → español con MyMemory.
    Trocea el texto en fragmentos de 4500 chars para no superar el límite.
    No requiere API key ni registro.
    """
    if not texto.strip():
        return ""

    LIMITE = 450

    if len(texto) <= LIMITE:
        return _peticion_mymemory(texto)

    # Troceamos por párrafos
    parrafos   = texto.split('\n')
    fragmentos = []
    fragmento  = ""

    for parrafo in parrafos:
        if len(fragmento) + len(parrafo) + 1 <= LIMITE:
            fragmento += parrafo + '\n'
        else:
            if fragmento:
                fragmentos.append(fragmento.strip())
            fragmento = parrafo + '\n'

    if fragmento:
        fragmentos.append(fragmento.strip())

    traducidos = [_peticion_mymemory(f) for f in fragmentos if f]
    return '\n'.join(traducidos)


# ------------------- SINCRONIZAR NOTICIAS ANN -------------------

def sincronizar_noticias_ann(limite: int = 20) -> dict:
    """
    Descarga las últimas noticias del RSS de ANN y las guarda en la BD.
    - Noticias nuevas: guarda todo + extrae imagen y contenido + traduce.
    - Noticias existentes: actualiza título, descripción y fecha.
    """
    noticias_rss = obtener_noticias_recientes(limite=limite)

    if not noticias_rss:
        return {
            "ok":           False,
            "error":        "No se pudo obtener el RSS de ANN.",
            "creadas":      0,
            "actualizadas": 0,
            "total":        0,
        }

    creadas      = 0
    actualizadas = 0

    for item in noticias_rss:
        ann_id = item.get("ann_id")
        if not ann_id:
            continue

        noticia_obj, creada = Noticia.objects.get_or_create(
            ann_id=ann_id,
            defaults={
                "titulo":       item.get("titulo"),
                "tipo":         item.get("tipo"),
                "descripcion":  item.get("descripcion"),
                "contenido":    "",
                "contenido_es": "",
                "url_externa":  item.get("url_externa"),
                "fecha_ann":    item.get("fecha_ann", ""),
                "imagen_url":   "",
            }
        )

        # Si ya existía → actualizamos campos básicos
        if not creada:
            noticia_obj.titulo      = item.get("titulo")
            noticia_obj.descripcion = item.get("descripcion")
            noticia_obj.fecha_ann   = item.get("fecha_ann", "")
            noticia_obj.save()

        # Imagen y contenido solo si no los tiene
        if not noticia_obj.imagen_url or not noticia_obj.contenido:
            detalle = obtener_detalle_articulo(item.get("url_externa", ""))

            if detalle["imagen_url"] and not noticia_obj.imagen_url:
                noticia_obj.imagen_url = detalle["imagen_url"]

            if detalle["contenido"] and not noticia_obj.contenido:
                noticia_obj.contenido = detalle["contenido"]

            noticia_obj.save()

        # Traducimos solo si hay contenido y aún no hay traducción
        if noticia_obj.contenido and not noticia_obj.contenido_es:
            traduccion = _traducir_con_mymemory(noticia_obj.contenido)
            if traduccion:
                noticia_obj.contenido_es = traduccion
                noticia_obj.save()

        if creada:
            creadas += 1
        else:
            actualizadas += 1

    return {
        "ok":           True,
        "error":        None,
        "creadas":      creadas,
        "actualizadas": actualizadas,
        "total":        creadas + actualizadas,
    }