"""
anime'n'chill — Filtros 
"""

import django_filters
from .models import Manga, Anime


# ------------------- FILTRO MANGA -------------------
class MangaFilter(django_filters.FilterSet):
    anio_min = django_filters.NumberFilter(field_name="anio_publicacion",
                 lookup_expr="gte", label="Año desde")
    anio_max = django_filters.NumberFilter(field_name="anio_publicacion",
                 lookup_expr="lte", label="Año hasta")
    genero   = django_filters.NumberFilter(field_name="generos__id",
                 label="ID de género")

    class Meta:
        model  = Manga
        fields = ["estado", "destacado", "anio_min", "anio_max", "genero"]


# ------------------- FILTRO ANIME -------------------
class AnimeFilter(django_filters.FilterSet):
    anio_min = django_filters.NumberFilter(field_name="anio_emision",
                 lookup_expr="gte")
    anio_max = django_filters.NumberFilter(field_name="anio_emision",
                 lookup_expr="lte")
    genero   = django_filters.NumberFilter(field_name="generos__id")

    class Meta:
        model  = Anime
        fields = ["estado", "tipo", "destacado", "anio_min", "anio_max", "genero"]