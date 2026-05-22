"""
anime'n'chill — Serializers de usuarios
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers

from anime.models import Progreso
from .models import Perfil


# ------------------- PERFIL -------------------
class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = ["avatar", "bio", "fecha_nacimiento", "pais", "updated_at"]
        extra_kwargs = {"updated_at": {"read_only": True}}


# ------------------- USUARIO (lectura completa) -------------------
class UsuarioSerializer(serializers.ModelSerializer):
    """Solo lectura — devuelve todos los datos del usuario + campos de perfil aplanados."""

    avatar = serializers.SerializerMethodField()
    capitulos_leidos = serializers.SerializerMethodField()
    mangas_leidos = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name",
            "last_name", "date_joined",
            "avatar", "capitulos_leidos", "mangas_leidos",
        ]
        extra_kwargs = {
            "date_joined": {"read_only": True},
        }

    def get_avatar(self, obj):
        request = self.context.get("request")
        try:
            avatar = obj.perfil.avatar
            if avatar and request:
                return request.build_absolute_uri(avatar.url)
            if avatar:
                return avatar.url
        except Perfil.DoesNotExist:
            pass
        return None

    def get_capitulos_leidos(self, obj):
        # Cuenta exactamente en cuántos progresos de este usuario el campo "completado" es True
        return Progreso.objects.filter(
            usuario=obj,
            completado=True
        ).count()

    def get_mangas_leidos(self, obj):
        # Cuenta mangas distintos navegando desde el progreso -> capitulo -> manga
        # Solo cuenta mangas donde haya leído al menos un capítulo completo
        return Progreso.objects.filter(
            usuario=obj,
            completado=True
        ).values('capitulo__manga').distinct().count()


# ------------------- USUARIO EDITAR (escritura parcial) -------------------
class UsuarioEditarSerializer(serializers.ModelSerializer):
    """
    Edita username y avatar.
    Requiere password_actual para confirmar los cambios.
    """
    password_actual = serializers.CharField(write_only=True, required=True)
    avatar = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["username", "password_actual", "avatar"]

    def validate_username(self, value):
        usuario_actual = self.context["request"].user
        if User.objects.filter(username=value).exclude(pk=usuario_actual.pk).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate(self, data):
        usuario = self.context["request"].user
        password = data.pop("password_actual")
        autenticado = authenticate(
            username=usuario.username,
            password=password
        )
        if not autenticado:
            raise serializers.ValidationError(
                {"password_actual": "La contraseña actual no es correcta."}
            )
        return data

    def update(self, instance, validated_data):
        avatar = validated_data.pop("avatar", None)

        # Actualiza username si viene
        instance.username = validated_data.get("username", instance.username)
        instance.save()

        # Actualiza avatar en el perfil
        if avatar:
            perfil, _ = Perfil.objects.get_or_create(usuario=instance)
            perfil.avatar = avatar
            perfil.save()

        return instance


# ------------------- REGISTRO -------------------
class RegistroSerializer(serializers.ModelSerializer):
    """Crea usuario + perfil en un solo paso."""
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirmar contraseña")
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "email", "first_name",
                  "last_name", "password", "password2"]

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError(
                {"password": "Las contraseñas no coinciden."}
            )
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        Perfil.objects.create(usuario=user)
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

# ------------------- CAMBIAR CONTRASEÑA -------------------
class CambiarPasswordSerializer(serializers.Serializer):
    """
    Cambia la contraseña del usuario.
    """
    email = serializers.EmailField(required=False)
    password_actual = serializers.CharField(write_only=True)
    nueva_password = serializers.CharField(write_only=True, min_length=6)
    nueva_password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["nueva_password"] != data["nueva_password2"]:
            raise serializers.ValidationError(
                {"nueva_password2": "Las contraseñas nuevas no coinciden."}
            )

        request = self.context.get("request")
        if request and request.user.is_authenticated:
            usuario = request.user
        else:
            email = data.get("email")
            if not email:
                raise serializers.ValidationError(
                    {"email": "El email es obligatorio si no estás logueado."}
                )
            try:
                usuario = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError(
                    {"email": "No existe ninguna cuenta con ese email."}
                )

        autenticado = authenticate(
            username=usuario.username,
            password=data["password_actual"]
        )
        if not autenticado:
            raise serializers.ValidationError(
                {"password_actual": "La contraseña actual no es correcta."}
            )

        data["_usuario"] = usuario
        return data
