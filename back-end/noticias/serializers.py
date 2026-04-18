"""
anime'n'chill — Serializers de la app noticias
"""

from rest_framework import serializers
from .models import Noticia


# ------------------- NOTICIA SERIALIZER -------------------
class NoticiaSerializer(serializers.ModelSerializer):

    class Meta:
        model  = Noticia
        fields = [
            "id",
            "ann_id",
            "titulo",
            "tipo",
            "descripcion",
            "imagen_url",
            "url_externa",
            "fecha_ann",
            "sincronizado_en",
            "created_at",
        ]
        read_only_fields = ["id", "sincronizado_en", "created_at"]