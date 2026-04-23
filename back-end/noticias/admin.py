from django.contrib import admin
from .models import Noticia


# ------------------- NOTICIA ADMIN -------------------
@admin.register(Noticia)
class NoticiaAdmin(admin.ModelAdmin):
    list_display  = ("titulo", "tipo", "slug", "fecha_ann", "sincronizado_en")
    list_filter   = ("tipo",)
    search_fields = ("titulo", "slug", "ann_id")

    # El slug se genera solo, pero lo mostramos como solo lectura en el admin
    readonly_fields = ("slug", "sincronizado_en", "created_at")