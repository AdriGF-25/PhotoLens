from django.contrib import admin
from .models import Noticia


@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display  = ("titulo", "tipo", "fecha_publicacion", "ann_id")
    list_filter   = ("tipo",)
    search_fields = ("titulo", "descripcion")
    ordering      = ("-fecha_publicacion",)