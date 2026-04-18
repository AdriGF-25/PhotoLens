"""
anime'n'chill — Modelo de Noticias
Fuente: Anime News Network Encyclopedia API
"""

from django.db import models


# ------------------- NOTICIA -------------------
class Noticia(models.Model):
    class Tipo(models.TextChoices):
        ANIME = "anime", "Anime"
        MANGA = "manga", "Manga"

    # ann_id único para no duplicar al sincronizar
    ann_id      = models.CharField(max_length=50, unique=True,
                    help_text="ID del título en ANN")
    titulo      = models.CharField(max_length=300)
    tipo        = models.CharField(max_length=10, choices=Tipo.choices,
                    default=Tipo.ANIME)
    descripcion = models.TextField(blank=True)
    imagen_url  = models.URLField(blank=True)
    url_externa = models.URLField(
                    help_text="Enlace a la Encyclopedia de ANN (obligatorio por sus ToS)")
    fecha_ann   = models.CharField(max_length=20, blank=True,
                    help_text="Año/temporada de emisión según ANN")
    sincronizado_en = models.DateTimeField(auto_now=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering    = ["-created_at"]
        verbose_name = "Noticia"
        verbose_name_plural = "Noticias"

    def __str__(self):
        return f"[{self.get_tipo_display()}] {self.titulo}"