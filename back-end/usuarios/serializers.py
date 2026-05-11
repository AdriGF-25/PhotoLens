"""
anime'n'chill — Serializers de usuarios
"""

from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Perfil


# ------------------- PERFIL -------------------
class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Perfil
        fields = ["avatar", "bio", "fecha_nacimiento", "pais", "updated_at"]
        extra_kwargs = {"updated_at": {"read_only": True}}


# ------------------- USUARIO (lectura completa) -------------------
class UsuarioSerializer(serializers.ModelSerializer):
    """Solo lectura — devuelve todos los datos del usuario + perfil anidado."""
    perfil_detalle = PerfilSerializer(source="perfil", read_only=True)

    class Meta:
        model  = User
        fields = ["id", "username", "email", "first_name",
                  "last_name", "date_joined", "perfil_detalle"]
        extra_kwargs = {
            "date_joined": {"read_only": True},
            "email":       {"required": True},
        }


# ------------------- USUARIO EDITAR (escritura parcial) -------------------
class UsuarioEditarSerializer(serializers.ModelSerializer):
    """
    Permite editar username, email, first_name y last_name.
    Valida que email y username no estén en uso por otro usuario.
    """
    class Meta:
        model  = User
        fields = ["username", "email", "first_name", "last_name"]

    def validate_email(self, value):
        usuario_actual = self.context["request"].user
        if User.objects.filter(email=value).exclude(pk=usuario_actual.pk).exists():
            raise serializers.ValidationError("Este correo ya está en uso por otra cuenta.")
        return value

    def validate_username(self, value):
        usuario_actual = self.context["request"].user
        if User.objects.filter(username=value).exclude(pk=usuario_actual.pk).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value


# ------------------- REGISTRO -------------------
class RegistroSerializer(serializers.ModelSerializer):
    """Crea usuario + perfil en un solo paso."""
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirmar contraseña")
    email     = serializers.EmailField(required=True)

    class Meta:
        model  = User
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
        user     = User(**validated_data)
        user.set_password(password)
        user.save()
        Perfil.objects.create(usuario=user)
        return user

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value