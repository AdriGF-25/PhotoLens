"""
anime'n'chill — Serializers (solo Manga)
"""

from rest_framework import serializers
from .models import Genero, Manga, Capitulo, Favorito, Progreso


# ------------------- GÉNERO ------------------- #
class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Genero
        fields = ["id", "nombre", "slug"]


# ------------------- MANGA LIST ------------------- #
class MangaListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados."""
    portada         = serializers.SerializerMethodField()
    categoria       = serializers.SerializerMethodField()
    generos         = GeneroSerializer(many=True, read_only=True)
    total_capitulos = serializers.SerializerMethodField()

    class Meta:
        model  = Manga
        fields = [
            "id", "titulo", "autor", "estado",
            "anio_publicacion", "portada", "destacado",
            "categoria", "generos", "total_capitulos",
        ]

    def get_portada(self, obj):
        return obj.portada

    def get_total_capitulos(self, obj):
        return obj.capitulos.count()

    def get_categoria(self, obj):
        genero = obj.generos.first()
        if not genero:
            return "sin-categoria"
        slug = (genero.slug or "").lower()
        mapa = {
            "accion":           "accion",
            "acción":           "accion",
            "aventura":         "aventura",
            "romance":          "romance",
            "terror":           "terror",
            "comedia":          "comedia",
            "fantasia":         "fantasia",
            "fantasía":         "fantasia",
            "sci-fi":           "sci-fi",
            "scifi":            "sci-fi",
            "ciencia-ficcion":  "sci-fi",
            "ciencia-ficción":  "sci-fi",
        }
        return mapa.get(slug, "sin-categoria")


# ------------------- MANGA DETAIL ------------------- #
class MangaDetailSerializer(serializers.ModelSerializer):
    """
    Patrón mixto lectura/escritura:
    - generos_detalle → lectura (objeto completo)
    - generos         → escritura (lista de IDs)
    """
    generos_detalle = GeneroSerializer(source="generos", many=True, read_only=True)
    generos         = serializers.PrimaryKeyRelatedField(
        queryset=Genero.objects.all(), many=True, required=False
    )
    portada         = serializers.SerializerMethodField()
    total_capitulos = serializers.SerializerMethodField()
    categoria       = serializers.SerializerMethodField()

    class Meta:
        model  = Manga
        fields = [
            "id", "mangadex_id", "titulo", "titulo_original", "descripcion",
            "autor", "anio_publicacion", "estado", "portada", "portada_url",
            "portada_local", "generos", "generos_detalle", "categoria",
            "destacado", "total_capitulos", "created_at", "updated_at",
        ]
        extra_kwargs = {
            "created_at":   {"read_only": True},
            "updated_at":   {"read_only": True},
            "portada_local": {"write_only": True},
        }

    def get_portada(self, obj):
        return obj.portada

    def get_total_capitulos(self, obj):
        return obj.capitulos.count()

    def get_categoria(self, obj):
        genero = obj.generos.first()
        if not genero:
            return "sin-categoria"
        slug = (genero.slug or "").lower()
        mapa = {
            "accion":           "accion",
            "acción":           "accion",
            "aventura":         "aventura",
            "romance":          "romance",
            "terror":           "terror",
            "comedia":          "comedia",
            "fantasia":         "fantasia",
            "fantasía":         "fantasia",
            "sci-fi":           "sci-fi",
            "scifi":            "sci-fi",
            "ciencia-ficcion":  "sci-fi",
            "ciencia-ficción":  "sci-fi",
        }
        return mapa.get(slug, "sin-categoria")


# ------------------- CAPÍTULO ------------------- #
class CapituloSerializer(serializers.ModelSerializer):
    manga_titulo = serializers.CharField(source="manga.titulo", read_only=True)

    class Meta:
        model  = Capitulo
        fields = ["id", "manga", "manga_titulo", "numero", "titulo",
                  "volumen", "ruta_imagenes", "fecha_publicacion", "created_at"]
        extra_kwargs = {"created_at": {"read_only": True}}

    def validate_numero(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "El número de capítulo no puede ser negativo."
            )
        return value


# ------------------- FAVORITO ------------------- #
class FavoritoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Favorito
        fields = ["id", "usuario", "manga", "fecha_guardado", "nota_personal"]
        extra_kwargs = {
            "usuario":        {"read_only": True},
            "fecha_guardado": {"read_only": True},
        }


# ------------------- PROGRESO ------------------- #
class ProgresoSerializer(serializers.ModelSerializer):
    capitulo_info = CapituloSerializer(source="capitulo", read_only=True)

    class Meta:
        model  = Progreso
        fields = ["id", "usuario", "capitulo", "capitulo_info",
                  "fecha_lectura", "completado", "pagina_actual"]
        extra_kwargs = {
            "usuario":        {"read_only": True},
            "fecha_lectura":  {"read_only": True},
        }


# ------------------- INPUT SERIALIZER (@action) ------------------- #
class GuardarFavoritoInputSerializer(serializers.Serializer):
    nota_personal = serializers.CharField(required=False, allow_blank=True)