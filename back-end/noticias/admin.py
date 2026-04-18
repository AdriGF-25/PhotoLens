"""
anime'n'chill — Admin de la app noticias
"""

from django.contrib import admin
from .models import Noticia


# ------------------- NOTICIA ADMIN -------------------
@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):

    # ← CORREGIDO: fecha_publicacion → created_at
    list_display  = ("titulo", "tipo", "created_at", "sincronizado_en")
    list_filter   = ("tipo",)
    search_fields = ("titulo", "ann_id")
    readonly_fields = ("ann_id", "created_at", "sincronizado_en")
    ordering      = ("-created_at",)