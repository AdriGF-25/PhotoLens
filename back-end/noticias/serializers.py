"""
anime'n'chill — Serializers de la app noticias
"""

from rest_framework import serializers
from .models import Noticia


# ------------------- NOTICIA LIST SERIALIZER -------------------
# Serializer ligero para el listado de novedades
class NoticiaSerializer(serializers.ModelSerializer):

    class Meta:
        model  = Noticia
        fields = [
            "id",
            "ann_id",
            "titulo",
            "slug",
            "tipo",
            "descripcion",
            "imagen_url",
            "url_externa",
            "fecha_ann",
            "sincronizado_en",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "sincronizado_en", "created_at"]


# ------------------- NOTICIA DETALLE SERIALIZER -------------------
# Serializer completo para la página de detalle individual
class NoticiaDetalleSerializer(serializers.ModelSerializer):

    # tipo_display: devuelve el texto legible del tipo (ej: "Anime" en vez de "anime")
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)

    class Meta:
        model  = Noticia
        fields = [
            "id",
            "ann_id",
            "titulo",
            "slug",
            "tipo",
            "tipo_display",
            "descripcion",
            "imagen_url",
            "url_externa",
            "fecha_ann",
            "sincronizado_en",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "sincronizado_en", "created_at"]