"""
anime'n'chill — Vistas de la app noticias
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import Noticia
from .serializers import NoticiaSerializer
from .services.ann import obtener_noticias_recientes, obtener_detalle


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
        """
        POST /api/noticias/sincronizar/
        Llama a ANN, obtiene los últimos títulos y los guarda en BD.
        Usa update_or_create para evitar duplicados.
        """
        limite   = int(request.data.get("limite", 50))
        noticias = obtener_noticias_recientes(limite=limite)

        if not noticias:
            return Response(
                {"error": "No se pudieron obtener datos de Anime News Network."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        creadas     = 0
        actualizadas = 0

        for item in noticias:
            _, created = Noticia.objects.update_or_create(
                ann_id=item["ann_id"],        # busca por este campo
                defaults={                     # si existe: actualiza; si no: crea
                    "titulo":      item["titulo"],
                    "descripcion": item["descripcion"],
                    "url_externa": item["url_externa"],
                }
            )
            if created:
                creadas += 1
            else:
                actualizadas += 1

        return Response({
            "mensaje":      f"Sincronización completada.",
            "creadas":      creadas,
            "actualizadas": actualizadas,
            "total":        creadas + actualizadas,
            # Créditos obligatorios según términos de ANN
            "fuente":       "Anime News Network",
            "fuente_url":   "https://www.animenewsnetwork.com/encyclopedia/",
        })

    # ---- @action: Detalle de un título en ANN ----
    @action(detail=True, methods=["get"], url_path="detalle-ann")
    def detalle_ann(self, request, pk=None):
        """
        GET /api/noticias/{id}/detalle-ann/
        Obtiene los detalles completos de la noticia desde ANN.
        """
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

        # Créditos obligatorios en la respuesta según ToS de ANN
        detalle["creditos"] = "Datos proporcionados por Anime News Network"
        detalle["enlace"]   = noticia.ann_id and \
            f"https://www.animenewsnetwork.com/encyclopedia/anime.php?id={noticia.ann_id}"

        return Response(detalle)