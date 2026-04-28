"""
anime'n'chill — Vistas de la app noticias
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Noticia
from .serializers import NoticiaSerializer, NoticiaDetalleSerializer
from .services.sincronizacion import sincronizar_noticias_ann


# ------------------- NOTICIA VIEWSET -------------------
class NoticiaViewSet(viewsets.ModelViewSet):
    queryset         = Noticia.objects.all().order_by("-created_at")
    serializer_class = NoticiaSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "por_slug", "sincronizar_ann", "relacionadas"]:
            return [AllowAny()]
        return [IsAdminUser()]


    # ------------------- DETALLE POR SLUG -------------------
    # GET /api/noticias/noticias/por-slug/?slug=chainsaw-man
    @action(detail=False, methods=["get"], url_path="por-slug")
    def por_slug(self, request):
        slug = request.query_params.get("slug", None)

        if not slug:
            return Response(
                {"error": "Debes proporcionar el parámetro ?slug="},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            noticia = Noticia.objects.get(slug=slug)
        except Noticia.DoesNotExist:
            return Response(
                {"error": f"No existe ninguna noticia con slug '{slug}'."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = NoticiaDetalleSerializer(noticia)
        return Response(serializer.data)


    # ------------------- NOTICIAS RELACIONADAS -------------------
    # GET /api/noticias/noticias/{id}/relacionadas/
    @action(detail=True, methods=["get"], url_path="relacionadas")
    def relacionadas(self, request, pk=None):
        noticia = self.get_object()

        relacionadas = (
            Noticia.objects
            .filter(tipo=noticia.tipo)
            .exclude(pk=noticia.pk)
            .order_by("-created_at")[:5]
        )

        if relacionadas.count() < 3:
            relacionadas = (
                Noticia.objects
                .exclude(pk=noticia.pk)
                .order_by("-created_at")[:5]
            )

        serializer = NoticiaSerializer(relacionadas, many=True)
        return Response(serializer.data)


    # ------------------- SINCRONIZAR CON ANN -------------------
    # POST /api/noticias/noticias/sincronizar/
    @action(detail=False, methods=["post"], url_path="sincronizar")
    def sincronizar_ann(self, request):
        limite = int(request.data.get("limite", 20))
        resultado = sincronizar_noticias_ann(limite=limite)

        if not resultado["ok"]:
            return Response(
                {"error": resultado["error"]},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({
            "mensaje":      "Sincronización completada.",
            "creadas":      resultado["creadas"],
            "actualizadas": resultado["actualizadas"],
            "total":        resultado["total"],
            "fuente":       "Anime News Network",
            "fuente_url":   "https://www.animenewsnetwork.com",
        })