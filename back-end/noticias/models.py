"""
anime'n'chill — Modelo de noticias (fuente: AnimeNewsNetwork)
"""

from django.db import models


# ------------------- NOTICIA -------------------
class Noticia(models.Model):
    class Tipo(models.TextChoices):
        NOTICIA     = "news",    "Noticia"
        REVIEW      = "review",  "Review"
        LANZAMIENTO = "release", "Lanzamiento"
        EVENTO      = "event",   "Evento"

    ann_id            = models.CharField(max_length=50, unique=True,
                          blank=True, null=True,
                          help_text="ID de AnimeNewsNetwork")
    titulo            = models.CharField(max_length=500)
    descripcion       = models.TextField(blank=True)
    url_externa       = models.URLField(blank=True)
    imagen_url        = models.URLField(blank=True)
    tipo              = models.CharField(max_length=20, choices=Tipo.choices,
                          default=Tipo.NOTICIA)
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering    = ["-fecha_publicacion"]
        verbose_name = "Noticia"
        verbose_name_plural = "Noticias"

    def __str__(self):
        return self.titulo