"""
anime'n'chill — Lógica compartida de sincronización de noticias ANN
"""

from noticias.models import Noticia
from noticias.services import ann


# ------------------- SINCRONIZAR NOTICIAS ANN -------------------
def sincronizar_noticias_ann(limite=15):
    noticias_basicas = ann.obtener_noticias_recientes(limite=limite)

    if not noticias_basicas:
        return {
            "ok": False,
            "error": "No se pudo obtener la lista inicial de ANN.",
            "creadas": 0,
            "actualizadas": 0,
            "total": 0,
        }

    creadas = 0
    actualizadas = 0

    for item in noticias_basicas:
        ann_id = item.get("ann_id")

        if not ann_id:
            continue

        noticia_obj, creada = Noticia.objects.get_or_create(
            ann_id=ann_id,
            defaults={
                "titulo": item.get("titulo"),
                "tipo": item.get("tipo"),
                "url_externa": item.get("url_externa"),
                "descripcion": item.get("descripcion"),
            }
        )

        if not creada:
            noticia_obj.titulo = item.get("titulo")
            noticia_obj.tipo = item.get("tipo")
            noticia_obj.url_externa = item.get("url_externa")
            noticia_obj.descripcion = item.get("descripcion")
            noticia_obj.save()

        if creada or not noticia_obj.imagen_url or not noticia_obj.fecha_ann:
            detalle = ann.obtener_detalle(ann_id=ann_id)

            if detalle:
                noticia_obj.descripcion = detalle.get("descripcion") or noticia_obj.descripcion
                noticia_obj.imagen_url = detalle.get("imagen_url", "") or noticia_obj.imagen_url

                if detalle.get("anio"):
                    noticia_obj.fecha_ann = str(detalle.get("anio"))

                noticia_obj.save()

        if creada:
            creadas += 1
        else:
            actualizadas += 1

    return {
        "ok": True,
        "error": None,
        "creadas": creadas,
        "actualizadas": actualizadas,
        "total": creadas + actualizadas,
    }
