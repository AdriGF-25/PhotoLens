"""
anime'n'chill — Vistas (solo Manga)
"""

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .filters import MangaFilter
from .models import Genero, Manga, Capitulo, Favorito, Progreso
from .serializers import (
    GeneroSerializer,
    MangaListSerializer, MangaDetailSerializer,
    CapituloSerializer,
    FavoritoSerializer, ProgresoSerializer,
    GuardarFavoritoInputSerializer,
)


# ------------------- GÉNERO ------------------- #
class GeneroViewSet(ModelViewSet):
    queryset         = Genero.objects.all()
    serializer_class = GeneroSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]


# ------------------- MANGA ------------------- #
class MangaViewSet(ModelViewSet):
    queryset        = Manga.objects.prefetch_related("generos").all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MangaFilter
    search_fields   = ["titulo", "titulo_original", "autor", "descripcion"]
    ordering_fields = ["anio_publicacion", "titulo", "created_at"]
    ordering        = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return MangaListSerializer
        return MangaDetailSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "capitulos", "portada_mangadex"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── @action: capítulos del manga ── #
    @action(detail=True, methods=["get"], url_path="capitulos")
    def capitulos(self, request, pk=None):
        """GET /api/mangas/{id}/capitulos/"""
        manga      = self.get_object()
        capitulos  = manga.capitulos.all().order_by("numero")
        serializer = CapituloSerializer(capitulos, many=True)
        return Response(serializer.data)

    # ── @action: portada desde MangaDex ── #
    @action(detail=True, methods=["get"], url_path="portada-mangadex")
    def portada_mangadex(self, request, pk=None):
        """GET /api/mangas/{id}/portada-mangadex/"""
        manga = self.get_object()

        if not manga.mangadex_id:
            return Response(
                {"error": "Este manga no tiene ID de MangaDex configurado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            url      = f"{settings.MANGADEX_API_URL}/cover"
            params   = {"manga[]": manga.mangadex_id, "limit": 1}
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data     = response.json()

            if data.get("data"):
                cover       = data["data"][0]
                filename    = cover["attributes"]["fileName"]
                portada_url = (
                    f"https://uploads.mangadex.org/covers/"
                    f"{manga.mangadex_id}/{filename}"
                )
                manga.portada_url = portada_url
                manga.save(update_fields=["portada_url"])
                return Response({"portada_url": portada_url})

            return Response(
                {"error": "No se encontró portada en MangaDex."},
                status=status.HTTP_404_NOT_FOUND
            )

        except requests.RequestException as e:
            return Response(
                {"error": f"Error al conectar con MangaDex: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    # ── @action: guardar favorito ── #
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def guardar_favorito(self, request, pk=None):
        """POST /api/mangas/{id}/guardar_favorito/"""
        manga     = self.get_object()
        input_ser = GuardarFavoritoInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)

        favorito, creado = Favorito.objects.get_or_create(
            usuario=request.user,
            manga=manga,
            defaults={
                "nota_personal": input_ser.validated_data.get("nota_personal", "")
            }
        )

        if not creado:
            return Response(
                {"error": "Este manga ya está en tus favoritos."},
                status=status.HTTP_409_CONFLICT
            )

        return Response(
            {"mensaje": f"'{manga.titulo}' guardado en favoritos."},
            status=status.HTTP_201_CREATED
        )


# ------------------- CAPÍTULO ------------------- #
class CapituloViewSet(ModelViewSet):
    queryset         = Capitulo.objects.select_related("manga").all()
    serializer_class = CapituloSerializer
    filter_backends  = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["manga", "volumen"]
    ordering_fields  = ["numero", "fecha_publicacion"]
    ordering         = ["numero"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    # ── @action: marcar progreso ── #
    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def marcar_progreso(self, request, pk=None):
        """POST /api/capitulos/{id}/marcar_progreso/"""
        capitulo   = self.get_object()
        pagina     = request.data.get("pagina_actual", 1)
        completado = request.data.get("completado", False)

        progreso, _ = Progreso.objects.update_or_create(
            usuario=request.user,
            capitulo=capitulo,
            defaults={"pagina_actual": pagina, "completado": completado}
        )

        return Response(
            {"mensaje": "Progreso actualizado.", "completado": progreso.completado},
            status=status.HTTP_200_OK
        )


# ------------------- FAVORITO ------------------- #
class FavoritoViewSet(ModelViewSet):
    serializer_class   = FavoritoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)