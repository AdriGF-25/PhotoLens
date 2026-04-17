from rest_framework import serializers
from .models import Noticia


# ------------------- NOTICIA -------------------
class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Noticia
        fields = [
            "id", "ann_id", "titulo", "descripcion", "url_externa",
            "imagen_url", "tipo", "fecha_publicacion", "created_at",
        ]
        extra_kwargs = {
            "created_at": {"read_only": True},
            "ann_id":     {"read_only": True},
        }