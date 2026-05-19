"""
anime'n'chill — Filtros (solo Manga)
"""

import django_filters
from .models import Manga


# ------------------- FILTRO MANGA ------------------- #
class MangaFilter(django_filters.FilterSet):
    anio_min    = django_filters.NumberFilter(field_name="anio_publicacion",
                    lookup_expr="gte", label="Año desde")
    anio_max    = django_filters.NumberFilter(field_name="anio_publicacion",
                    lookup_expr="lte", label="Año hasta")
    genero      = django_filters.NumberFilter(field_name="generos__id",
                    label="ID de género")
    genero_slug = django_filters.CharFilter(field_name="generos__slug",
                    lookup_expr="iexact", label="Slug de género")   # ← AÑADIDO

    class Meta:
        model  = Manga
        fields = ["estado", "destacado", "anio_min", "anio_max", "genero", "genero_slug"]