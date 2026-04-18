"""
anime'n'chill — Vistas de la app noticias
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Noticia
from .serializers import NoticiaSerializer
from .services.ann import obtener_detalle
from .services.sincronizacion import sincronizar_noticias_ann


# ------------------- NOTICIA VIEWSET -------------------
class NoticiaViewSet(viewsets.ModelViewSet):
    queryset = Noticia.objects.all().order_by("-created_at")
    serializer_class = NoticiaSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "sincronizar_ann", "detalle_ann"]:
            return [AllowAny()]
        return [IsAdminUser()]

    # ---- @action: Sincronizar con ANN ----
    @action(detail=False, methods=["post"], url_path="sincronizar")
    def sincronizar_ann(self, request):
        limite = int(request.data.get("limite", 15))
        resultado = sincronizar_noticias_ann(limite=limite)

        if not resultado["ok"]:
            return Response(
                {"error": resultado["error"]},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response({
            "mensaje": "Sincronización completada.",
            "creadas": resultado["creadas"],
            "actualizadas": resultado["actualizadas"],
            "total": resultado["total"],
            "fuente": "Anime News Network",
            "fuente_url": "https://www.animenewsnetwork.com/encyclopedia/",
        })

    # ---- @action: Detalle de un título en ANN ----
    @action(detail=True, methods=["get"], url_path="detalle-ann")
    def detalle_ann(self, request, pk=None):
        noticia = self.get_object()

        if not noticia.ann_id:
            return Response(
                {"error": "Esta noticia no tiene ID de ANN."},
                status=status.HTTP_400_BAD_REQUEST
            )

        detalle = obtener_detalle(noticia.ann_id)

        if not detalle:
            return Response(
                {"error": "No se encontraron detalles en ANN."},
                status=status.HTTP_404_NOT_FOUND
            )

        detalle["creditos"] = "Datos proporcionados por Anime News Network"
        detalle["enlace"] = (
            f"https://www.animenewsnetwork.com/encyclopedia/anime.php?id={noticia.ann_id}"
        )

        return Response(detalle)