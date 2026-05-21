"""
anime'n'chill — Panel de administración (solo Manga)
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Genero, Manga, Portada, Capitulo, Favorito, Progreso

@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug")
    prepopulated_fields = {"slug": ("nombre",)}
    search_fields = ("nombre",)

@admin.register(Portada)
class PortadaAdmin(admin.ModelAdmin):
    list_display = ("manga", "es_principal", "vista_previa", "creada_at")
    list_filter = ("es_principal", "manga")
    search_fields = ("manga__titulo", "titulo_busqueda")
    readonly_fields = ("vista_previa",)

    def vista_previa(self, obj):
        if obj.imagen:
            return format_html('<img src="{}" width="70" />', obj.imagen.url)
        return "-"
    vista_previa.short_description = "Vista previa"

@admin.register(Manga)
class MangaAdmin(admin.ModelAdmin):
    list_display = ("titulo", "autor", "estado", "anio_publicacion", "destacado")
    list_filter = ("estado", "destacado")
    search_fields = ("titulo", "autor", "mangadex_id")
    filter_horizontal = ("generos",)
    list_editable = ("destacado",)

@admin.register(Capitulo)
class CapituloAdmin(admin.ModelAdmin):
    list_display = ("manga", "numero", "titulo", "volumen", "fecha_publicacion")
    list_filter = ("manga",)
    search_fields = ("manga__titulo", "titulo")
    ordering = ("manga", "numero")

@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "manga", "fecha_guardado")

@admin.register(Progreso)
class ProgresoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "capitulo", "pagina_actual", "completado", "fecha_lectura")
    list_filter = ("completado",)