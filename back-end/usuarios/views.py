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
from .serializers import (
    UsuarioSerializer, PerfilSerializer,
    RegistroSerializer, UsuarioEditarSerializer,
    CambiarPasswordSerializer
)


# ------------------- REGISTRO (público) -------------------
class RegistroView(CreateAPIView):
    """POST /api/usuarios/registro/"""
    serializer_class   = RegistroSerializer
    permission_classes = [AllowAny]


# ------------------- PERFIL -------------------
class UsuarioViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    GenericViewSet
):
    serializer_class   = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    # ─────────── GET /api/usuarios/perfil/ ───────────
    @action(detail=False, methods=["get"], url_path="perfil")
    def perfil(self, request):
        serializer = UsuarioSerializer(request.user, context={"request": request})
        return Response(serializer.data)

    # ─────────── PATCH /api/usuarios/perfil/editar/ ───────────
    @action(detail=False, methods=["patch"], url_path="perfil/editar",
            parser_classes=[__import__('rest_framework.parsers', fromlist=['MultiPartParser']).MultiPartParser,
                            __import__('rest_framework.parsers', fromlist=['FormParser']).FormParser])
    def editar_usuario(self, request):
        serializer = UsuarioEditarSerializer(
            request.user, data=request.data, partial=True,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            UsuarioSerializer(request.user, context={"request": request}).data
        )

    # ─────────── PATCH /api/usuarios/perfil/editar/extra/ ───────────
    @action(detail=False, methods=["patch"], url_path="perfil/editar/extra")
    def editar_perfil(self, request):
        perfil, _ = Perfil.objects.get_or_create(usuario=request.user)
        serializer = PerfilSerializer(perfil, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # ─────────── POST /api/usuarios/cambiar-password/ ───────────
    @action(
        detail=False,
        methods=["post"],
        url_path="cambiar-password",
        permission_classes=[AllowAny]   # Funciona con y sin token
    )
    def cambiar_password(self, request):
        serializer = CambiarPasswordSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        usuario = serializer.validated_data["_usuario"]
        usuario.set_password(serializer.validated_data["nueva_password"])
        usuario.save()

        # TODO: invalidar tokens existentes del usuario (extra de seguridad)
        # from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        # OutstandingToken.objects.filter(user=usuario).delete()

        return Response(
            {"detail": "Contraseña actualizada correctamente."},
            status=status.HTTP_200_OK
        )

    # ─────────── GET /api/usuarios/mis-favoritos/ ───────────
    @action(detail=False, methods=["get"], url_path="mis-favoritos")
    def mis_favoritos(self, request):
        from anime.models import Favorito
        from anime.serializers import FavoritoSerializer
        favoritos  = Favorito.objects.filter(usuario=request.user).order_by("-fecha_guardado")[:10]
        serializer = FavoritoSerializer(favoritos, many=True)
        return Response(serializer.data)