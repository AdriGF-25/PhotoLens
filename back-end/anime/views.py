"""
anime'n'chill — Vistas (solo Manga)
"""

import os
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
    MangaListSerializer,
    MangaDetailSerializer,
    CapituloSerializer,
    FavoritoSerializer,
    GuardarFavoritoInputSerializer,
)


class GeneroViewSet(ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]


class MangaViewSet(ModelViewSet):
    queryset = Manga.objects.prefetch_related("generos").all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = MangaFilter
    search_fields = ["titulo", "titulo_original", "autor", "descripcion"]
    ordering_fields = ["anio_publicacion", "titulo", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return MangaListSerializer
        return MangaDetailSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "capitulos"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(
        detail=True,
        methods=["get"],
        url_path="capitulos",
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def capitulos(self, request, pk=None):
        manga = self.get_object()
        capitulos = manga.capitulos.all().order_by("numero")
        serializer = CapituloSerializer(capitulos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def guardar_favorito(self, request, pk=None):
        manga = self.get_object()
        input_ser = GuardarFavoritoInputSerializer(data=request.data)
        input_ser.is_valid(raise_exception=True)

        favorito, creado = Favorito.objects.get_or_create(
            usuario=request.user,
            manga=manga,
            defaults={"nota_personal": input_ser.validated_data.get("nota_personal", "")}
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


class CapituloViewSet(ModelViewSet):
    queryset = Capitulo.objects.select_related("manga").all()
    serializer_class = CapituloSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ["manga", "volumen"]
    ordering_fields = ["numero", "fecha_publicacion"]
    ordering = ["numero"]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "paginas"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def marcar_progreso(self, request, pk=None):
        capitulo = self.get_object()

        try:
            pagina = int(request.data.get("pagina_actual", 1))
        except (TypeError, ValueError):
            return Response(
                {"pagina_actual": "Debe ser un número entero válido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if pagina < 1:
            pagina = 1

        completado_raw = request.data.get("completado", False)

        if isinstance(completado_raw, bool):
            completado = completado_raw
        elif isinstance(completado_raw, str):
            completado = completado_raw.strip().lower() in ["true", "1", "yes", "si", "sí"]
        else:
            completado = bool(completado_raw)

        progreso, _ = Progreso.objects.update_or_create(
            usuario=request.user,
            capitulo=capitulo,
            defaults={
                "pagina_actual": pagina,
                "completado": completado
            }
        )

        return Response(
            {
                "mensaje": "Progreso actualizado.",
                "capitulo_id": capitulo.id,
                "manga_id": capitulo.manga_id,
                "pagina_actual": progreso.pagina_actual,
                "completado": progreso.completado
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=["get"],
        url_path="paginas",
        authentication_classes=[],
        permission_classes=[AllowAny],
    )
    def paginas(self, request, pk=None):
        capitulo = self.get_object()

        if not capitulo.ruta_imagenes:
            return Response({"paginas": [], "total": 0})

        ruta_completa = os.path.join(settings.MEDIA_ROOT, capitulo.ruta_imagenes)

        if not os.path.isdir(ruta_completa):
            return Response({"paginas": [], "total": 0})

        extensiones = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

        try:
            archivos = sorted(
                f for f in os.listdir(ruta_completa)
                if os.path.splitext(f.lower())[1] in extensiones
            )
        except OSError:
            return Response({"paginas": [], "total": 0})

        ruta_rel = capitulo.ruta_imagenes.replace("\\", "/").strip("/")
        media_url = request.build_absolute_uri(settings.MEDIA_URL).rstrip("/")

        paginas_urls = [f"{media_url}/{ruta_rel}/{archivo}" for archivo in archivos]
        return Response({"paginas": paginas_urls, "total": len(paginas_urls)})

class FavoritoViewSet(ModelViewSet):
    serializer_class = FavoritoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)