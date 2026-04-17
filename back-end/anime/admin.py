"""
anime'n'chill — Panel de administración
"""

from django.contrib import admin
from .models import Genero, Manga, Anime, Capitulo, Episodio, Favorito, Progreso


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display       = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}
    search_fields      = ("nombre",)


@admin.register(Manga)
class MangaAdmin(admin.ModelAdmin):
    list_display   = ("titulo", "autor", "estado", "anio_publicacion", "destacado")
    list_filter    = ("estado", "destacado")
    search_fields  = ("titulo", "autor", "mangadex_id")
    filter_horizontal = ("generos",)
    list_editable  = ("destacado",)


@admin.register(Anime)
class AnimeAdmin(admin.ModelAdmin):
    list_display   = ("titulo", "estudio", "tipo", "estado", "anio_emision", "destacado")
    list_filter    = ("estado", "tipo", "destacado")
    search_fields  = ("titulo", "estudio")
    filter_horizontal = ("generos",)
    list_editable  = ("destacado",)


@admin.register(Capitulo)
class CapituloAdmin(admin.ModelAdmin):
    list_display  = ("manga", "numero", "titulo", "volumen", "fecha_publicacion")
    list_filter   = ("manga",)
    search_fields = ("manga__titulo", "titulo")
    ordering      = ("manga", "numero")


@admin.register(Episodio)
class EpisodioAdmin(admin.ModelAdmin):
    list_display  = ("anime", "numero", "titulo", "duracion_min", "fecha_emision")
    list_filter   = ("anime",)
    search_fields = ("anime__titulo", "titulo")


@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "tipo", "manga", "anime", "fecha_guardado")
    list_filter  = ("tipo",)


@admin.register(Progreso)
class ProgresoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "capitulo", "pagina_actual", "completado", "fecha_lectura")
    list_filter  = ("completado",)