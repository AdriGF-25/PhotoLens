"""
anime'n'chill — Lógica de sincronización de noticias desde RSS de ANN
"""

import time
import requests
from noticias.models import Noticia
from noticias.services.ann import obtener_noticias_recientes, obtener_detalle_articulo


# ------------------- CONSTANTES -------------------

LIMITE_GOOGLE  = 4500   # Google acepta hasta ~5000 chars por petición
PAUSA_TRADUCTOR = 1     # Segundos entre peticiones para no saturar el servicio


# ------------------- TRADUCCIÓN DE FRAGMENTO -------------------

def _traducir_fragmento(texto: str) -> str:
    """
    Intenta traducir con Google Translate.
    Si falla, usa MyMemory como fallback.
    Si ambos fallan, devuelve el texto original.
    """
    # ✅ Import local: solo se carga cuando realmente se traduce
    from deep_translator import GoogleTranslator, MyMemoryTranslator

    texto = texto.strip()
    if not texto:
        return ""

    time.sleep(PAUSA_TRADUCTOR)

    try:
        return GoogleTranslator(source="en", target="es").translate(texto)

    except Exception as e:
        print(f"[Google] Fallo ({len(texto)} chars): {e} — intentando MyMemory...")

        try:
            return MyMemoryTranslator(source="en-US", target="es-ES").translate(texto)

        except Exception as e2:
            print(f"[MyMemory] También falló: {e2} — conservando original.")
            return texto


# ------------------- TROCEO INTELIGENTE -------------------

def _trocear_texto(texto: str, limite: int = LIMITE_GOOGLE) -> list:
    """
    Divide el texto en fragmentos que no superen el límite de caracteres.
    Respeta los saltos de párrafo (\n\n) y subdivide párrafos largos
    por punto si es necesario.
    """
    parrafos   = [p.strip() for p in texto.split("\n\n") if p.strip()]
    fragmentos = []
    fragmento  = ""

    for parrafo in parrafos:

        # El párrafo cabe en el fragmento actual → lo acumulamos
        if len(fragmento) + len(parrafo) + 2 <= limite:
            fragmento = (fragmento + "\n\n" + parrafo).strip()

        # No cabe pero el párrafo solo sí cabe → cerramos el fragmento actual
        elif len(parrafo) <= limite:
            if fragmento:
                fragmentos.append(fragmento)
            fragmento = parrafo

        # El párrafo supera el límite por sí solo → trocemos por oraciones
        else:
            if fragmento:
                fragmentos.append(fragmento)
                fragmento = ""

            oraciones = parrafo.replace(". ", ".|").split("|")
            sub = ""
            for oracion in oraciones:
                if len(sub) + len(oracion) + 1 <= limite:
                    sub = (sub + " " + oracion).strip()
                else:
                    if sub:
                        fragmentos.append(sub)
                    sub = oracion[:limite]  # Corte duro si la oración es enorme
            if sub:
                fragmentos.append(sub)

    if fragmento:
        fragmentos.append(fragmento)

    return fragmentos


# ------------------- TRADUCCIÓN PRINCIPAL -------------------

def _traducir_texto(texto: str) -> str:
    """
    Traduce inglés → español usando Google Translate con MyMemory como fallback.
    Trocea el texto inteligentemente si supera el límite por petición.
    """
    if not texto.strip():
        return ""

    fragmentos = _trocear_texto(texto)
    traducidos = [_traducir_fragmento(f) for f in fragmentos]
    return "\n\n".join(traducidos)


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
            traduccion = _traducir_texto(noticia_obj.contenido)
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