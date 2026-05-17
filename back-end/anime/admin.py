"""
anime'n'chill — Panel de administración (solo Manga)
"""

from django.contrib import admin
from .models import Genero, Manga, Capitulo, Favorito, Progreso


# ------------------- GÉNERO ------------------- #
@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display        = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}
    search_fields       = ("nombre",)


# ------------------- MANGA ------------------- #
@admin.register(Manga)
class MangaAdmin(admin.ModelAdmin):
    list_display      = ("titulo", "autor", "estado", "anio_publicacion", "destacado")
    list_filter       = ("estado", "destacado")
    search_fields     = ("titulo", "autor", "mangadex_id")
    filter_horizontal = ("generos",)
    list_editable     = ("destacado",)


# ------------------- CAPÍTULO ------------------- #
@admin.register(Capitulo)
class CapituloAdmin(admin.ModelAdmin):
    list_display  = ("manga", "numero", "titulo", "volumen", "fecha_publicacion")
    list_filter   = ("manga",)
    search_fields = ("manga__titulo", "titulo")
    ordering      = ("manga", "numero")


# ------------------- FAVORITO ------------------- #
@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "manga", "fecha_guardado")


# ------------------- PROGRESO ------------------- #
@admin.register(Progreso)
class ProgresoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "capitulo", "pagina_actual", "completado", "fecha_lectura")
    list_filter  = ("completado",)