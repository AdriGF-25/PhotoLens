from django.contrib import admin
from .models import Perfil


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display  = ("usuario", "pais", "fecha_nacimiento", "created_at")
    search_fields = ("usuario__username", "usuario__email")