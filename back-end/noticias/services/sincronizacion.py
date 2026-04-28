"""
anime'n'chill — Lógica de sincronización de noticias desde RSS de ANN
"""

from noticias.models import Noticia
from noticias.services.ann import obtener_noticias_recientes, obtener_detalle_articulo


# ------------------- SINCRONIZAR NOTICIAS ANN -------------------

def sincronizar_noticias_ann(limite: int = 20) -> dict:
    """
    Descarga las últimas noticias del RSS de ANN y las guarda en la BD.
    Por cada noticia nueva extrae imagen y contenido completo del artículo.
    Las noticias ya existentes solo actualizan título, descripción y fecha.
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
                "titulo":      item.get("titulo"),
                "tipo":        item.get("tipo"),
                "descripcion": item.get("descripcion"),
                "contenido":   "",
                "url_externa": item.get("url_externa"),
                "fecha_ann":   item.get("fecha_ann", ""),
                "imagen_url":  "",
            }
        )

        # Si ya existía actualizamos los campos que pueden cambiar
        if not creada:
            noticia_obj.titulo      = item.get("titulo")
            noticia_obj.descripcion = item.get("descripcion")
            noticia_obj.fecha_ann   = item.get("fecha_ann", "")
            noticia_obj.save()

        # Obtenemos imagen y contenido solo si no los tiene ya
        if not noticia_obj.imagen_url or not noticia_obj.contenido:
            detalle = obtener_detalle_articulo(item.get("url_externa", ""))

            if detalle["imagen_url"] and not noticia_obj.imagen_url:
                noticia_obj.imagen_url = detalle["imagen_url"]

            if detalle["contenido"] and not noticia_obj.contenido:
                noticia_obj.contenido = detalle["contenido"]

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