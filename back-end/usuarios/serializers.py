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


# ------------------- USUARIO (lectura) -------------------
class UsuarioSerializer(serializers.ModelSerializer):
    """Patrón mixto 1:1 — perfil_detalle es solo lectura."""
    perfil_detalle = PerfilSerializer(source="perfil", read_only=True)

    class Meta:
        model  = User
        fields = ["id", "username", "email", "first_name",
                  "last_name", "date_joined", "perfil_detalle"]
        extra_kwargs = {
            "date_joined": {"read_only": True},
            "email":       {"required": True},
        }


# ------------------- REGISTRO -------------------
class RegistroSerializer(serializers.ModelSerializer):
    """Crea usuario + perfil en un solo paso."""
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True,
                  label="Confirmar contraseña")

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