"""
anime'n'chill — Serializers de la app noticias
"""

from rest_framework import serializers
from .models import Noticia


# ------------------- NOTICIA LIST SERIALIZER -------------------
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
class NoticiaDetalleSerializer(serializers.ModelSerializer):

    tipo_display     = serializers.CharField(source="get_tipo_display", read_only=True)

    # Si contenido_es está vacío → devuelve contenido (inglés) como fallback
    contenido_mostrar = serializers.SerializerMethodField()

    def get_contenido_mostrar(self, obj):
        return obj.contenido_es if obj.contenido_es.strip() else obj.contenido

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
            "contenido",
            "contenido_es",
            "contenido_mostrar",   # ← campo inteligente para el frontend
            "imagen_url",
            "url_externa",
            "fecha_ann",
            "sincronizado_en",
            "created_at",
        ]
        read_only_fields = ["id", "slug", "sincronizado_en", "created_at"]