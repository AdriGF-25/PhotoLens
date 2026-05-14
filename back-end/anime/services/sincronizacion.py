"""
anime'n'chill — Sincronización de portadas y metadatos desde MangaDex
Responsabilidad: comparar BD vs API y decidir qué guardar y cuándo.
"""

from anime.services.mangadex import consultar_manga, get_catalogo_local


# ------------------- ESTADOS ------------------- #

CREADO      = "creado"
ACTUALIZADO = "actualizado"
SIN_CAMBIOS = "sin_cambios"
ERROR       = "error"

ESTADO_MAP = {
    "ongoing"   : "ongoing",
    "completed" : "completed",
    "hiatus"    : "hiatus",
    "cancelled" : "cancelled",
}


# ------------------- SINCRONIZAR TODO ------------------- #

def sincronizar_portadas(forzar: bool = False) -> dict:
    """
    Recorre el catálogo detectado en media/Manga/ y sincroniza cada manga.

    Lógica por manga:
      - No existe en BD             → crea el registro
      - Existe y portada_url cambió → actualiza
      - Existe y no cambió          → omite (sin_cambios)
      - forzar=True                 → actualiza siempre
    """
    catalogo     = get_catalogo_local()
    resultados   = []
    creados      = 0
    actualizados = 0
    sin_cambios  = 0
    errores      = 0

    for titulo_local, termino_busqueda in catalogo.items():
        r = _sincronizar_uno(titulo_local, termino_busqueda, forzar=forzar)
        resultados.append(r)

        if r["estado"] == CREADO:        creados      += 1
        elif r["estado"] == ACTUALIZADO: actualizados += 1
        elif r["estado"] == SIN_CAMBIOS: sin_cambios  += 1
        elif r["estado"] == ERROR:       errores      += 1

    return {
        "ok"          : True,
        "resultados"  : resultados,
        "creados"     : creados,
        "actualizados": actualizados,
        "sin_cambios" : sin_cambios,
        "errores"     : errores,
    }


# ------------------- SINCRONIZAR UNO ------------------- #

def sincronizar_uno_por_titulo(titulo_local: str, forzar: bool = False) -> dict:
    """
    Sincroniza un único manga buscándolo por su título local.
    Busca el término de búsqueda en el catálogo dinámico.

    Retorna el mismo dict de resultado que _sincronizar_uno().
    """
    catalogo = get_catalogo_local()

    if titulo_local not in catalogo:
        return {
            "titulo_local": titulo_local,
            "estado"      : ERROR,
            "error"       : f'"{titulo_local}" no existe en media/Manga/.',
        }

    termino = catalogo[titulo_local]
    return _sincronizar_uno(titulo_local, termino, forzar=forzar)


# ------------------- LÓGICA INTERNA ------------------- #

def _sincronizar_uno(titulo_local: str, termino: str, forzar: bool = False) -> dict:
    """Consulta API, compara con BD y actúa. Función interna."""
    from anime.models import Manga

    datos = consultar_manga(termino)
    if not datos:
        return {
            "titulo_local": titulo_local,
            "estado"      : ERROR,
            "error"       : "Sin resultados en MangaDex",
        }

    manga_obj = Manga.objects.filter(titulo=titulo_local).first()

    # ---- No existe → crear ---- #
    if not manga_obj:
        manga_obj = Manga.objects.create(
            titulo      = titulo_local,
            mangadex_id = datos["mangadex_id"],
            portada_url = datos["portada_url"],
            descripcion = datos["descripcion"],
            autor       = datos["autor"],
            estado      = ESTADO_MAP.get(datos["estado_raw"], "ongoing"),
        )
        _asignar_generos(manga_obj, datos["generos"])
        return {
            "titulo_local": titulo_local,
            "portada_url" : datos["portada_url"],
            "estado"      : CREADO,
        }

    # ---- Existe y no cambió ---- #
    if manga_obj.portada_url == datos["portada_url"] and not forzar:
        return {
            "titulo_local": titulo_local,
            "portada_url" : datos["portada_url"],
            "estado"      : SIN_CAMBIOS,
        }

    # ---- Existe y cambió o forzar → actualizar ---- #
    manga_obj.mangadex_id = datos["mangadex_id"]
    manga_obj.portada_url = datos["portada_url"]
    manga_obj.descripcion = datos["descripcion"]
    manga_obj.autor       = datos["autor"]
    manga_obj.estado      = ESTADO_MAP.get(datos["estado_raw"], "ongoing")
    manga_obj.save()
    _asignar_generos(manga_obj, datos["generos"])

    return {
        "titulo_local": titulo_local,
        "portada_url" : datos["portada_url"],
        "estado"      : ACTUALIZADO,
    }


# ------------------- HELPER ------------------- #

def _asignar_generos(manga_obj, nombres_generos: list):
    """Crea los géneros que no existan y los asigna al manga."""
    from anime.models import Genero
    from django.utils.text import slugify

    genero_objs = []
    for nombre in nombres_generos:
        if not nombre:
            continue
        g, _ = Genero.objects.get_or_create(
            slug     = slugify(nombre),
            defaults = {"nombre": nombre}
        )
        genero_objs.append(g)

    manga_obj.generos.set(genero_objs)