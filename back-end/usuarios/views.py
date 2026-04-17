"""
anime'n'chill — Vistas de usuarios
"""

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet, mixins

from .models import Perfil
from .serializers import UsuarioSerializer, PerfilSerializer, RegistroSerializer


# ------------------- REGISTRO (público) -------------------
class RegistroView(CreateAPIView):
    """POST /api/usuarios/registro/"""
    serializer_class  = RegistroSerializer
    permission_classes = [AllowAny]


# ------------------- PERFIL -------------------
class UsuarioViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet
):
    serializer_class  = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    # ─────────── @action: mi perfil ───────────
    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """GET /api/usuarios/me/"""
        return Response(UsuarioSerializer(request.user).data)

    # ─────────── @action: actualizar perfil ───────────
    @action(detail=False, methods=["patch"], url_path="me/perfil")
    def actualizar_perfil(self, request):
        """PATCH /api/usuarios/me/perfil/"""
        perfil, _ = Perfil.objects.get_or_create(usuario=request.user)
        serializer = PerfilSerializer(perfil, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # ─────────── @action: mis favoritos ───────────
    @action(detail=False, methods=["get"], url_path="mis-favoritos")
    def mis_favoritos(self, request):
        """GET /api/usuarios/mis-favoritos/"""
        from anime.models import Favorito
        from anime.serializers import FavoritoSerializer
        favoritos  = Favorito.objects.filter(usuario=request.user)
        serializer = FavoritoSerializer(favoritos, many=True)
        return Response(serializer.data)