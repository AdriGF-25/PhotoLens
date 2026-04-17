"""
anime'n'chill — Perfil de usuario (relación 1:1 con User de Django)
"""

from django.db import models
from django.contrib.auth.models import User


# ------------------- PERFIL -------------------
class Perfil(models.Model):
    """
    Extiende User con datos extra.
    Relación OneToOne — requisito obligatorio del enunciado.
    """
    usuario         = models.OneToOneField(User, on_delete=models.CASCADE,
                        related_name="perfil")
    avatar          = models.ImageField(upload_to="avatares/",
                        null=True, blank=True)
    bio             = models.TextField(blank=True, max_length=500)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    pais            = models.CharField(max_length=100, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Perfil"
        verbose_name_plural = "Perfiles"

    def __str__(self):
        return f"Perfil de {self.usuario.username}"