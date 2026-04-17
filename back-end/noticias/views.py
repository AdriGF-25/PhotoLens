"""
anime'n'chill — Vistas de noticias
Incluye @action para sincronizar desde AnimeNewsNetwork
"""

import xml.etree.ElementTree as ET
from datetime import datetime

import requests
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from .models import Noticia
from .serializers import NoticiaSerializer


class NoticiaViewSet(ModelViewSet):
    queryset         = Noticia.objects.all()
    serializer_class = NoticiaSerializer
    filter_backends  = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["tipo"]
    search_fields    = ["titulo", "descripcion"]
    ordering_fields  = ["fecha_publicacion", "created_at"]
    ordering         = ["-fecha_publicacion"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    # ─────────── @action: sincronizar desde ANN ───────────
    @action(detail=False, methods=["post"], url_path="sincronizar",
            permission_classes=[IsAdminUser])
    def sincronizar_ann(self, request):
        """POST /api/noticias/sincronizar/ — Solo admin."""
        try:
            response = requests.get(
                settings.ANN_API_URL,
                params={"news": "50"},
                timeout=15
            )
            response.raise_for_status()
            root      = ET.fromstring(response.content)
            creadas   = 0
            actualizadas = 0

            for item in root.findall(".//item"):
                ann_id      = item.get("id", "")
                titulo      = item.findtext("title", "")
                descripcion = item.findtext("summary", "")
                url_ext     = item.findtext("src", "")
                imagen_url  = item.findtext("img", "") or ""

                fecha_str = item.findtext("date", "")
                fecha     = None
                if fecha_str:
                    try:
                        fecha = timezone.make_aware(
                            datetime.strptime(fecha_str, "%Y-%m-%dT%H:%M:%S")
                        )
                    except ValueError:
                        pass

                noticia, nueva = Noticia.objects.update_or_create(
                    ann_id=ann_id,
                    defaults={
                        "titulo":            titulo,
                        "descripcion":       descripcion,
                        "url_externa":       url_ext,
                        "imagen_url":        imagen_url,
                        "fecha_publicacion": fecha,
                        "tipo":              "news",
                    }
                )
                if nueva:
                    creadas += 1
                else:
                    actualizadas += 1

            return Response(
                {"mensaje": "Sincronización completada.",
                 "creadas": creadas, "actualizadas": actualizadas},
                status=status.HTTP_200_OK
            )

        except requests.RequestException as e:
            return Response({"error": f"Error ANN: {str(e)}"},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except ET.ParseError as e:
            return Response({"error": f"Error XML: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)