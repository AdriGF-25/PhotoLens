"""
anime'n'chill — Modelo de Noticias
Fuente: Anime News Network RSS
"""

from django.db import models
from django.utils.text import slugify


# ------------------- NOTICIA -------------------
class Noticia(models.Model):
    class Tipo(models.TextChoices):
        ANIME = "anime", "Anime"
        MANGA = "manga", "Manga"

    ann_id      = models.CharField(max_length=150, unique=True,
                    help_text="ID único generado desde la URL del artículo RSS")
    titulo      = models.CharField(max_length=300)
    slug        = models.SlugField(max_length=350, unique=True, blank=True,
                    help_text="URL amigable generada automáticamente desde el título")
    tipo        = models.CharField(max_length=10, choices=Tipo.choices,
                    default=Tipo.ANIME)
    descripcion = models.TextField(blank=True,
                    help_text="Introducción del artículo (del RSS)")
    contenido   = models.TextField(blank=True,
                    help_text="Cuerpo completo del artículo extraído de ANN")
    imagen_url  = models.URLField(blank=True)
    url_externa = models.URLField(
                    help_text="Enlace al artículo original de ANN (obligatorio por sus ToS)")
    fecha_ann   = models.CharField(max_length=100, blank=True,
                    help_text="Fecha de publicación según ANN")
    sincronizado_en = models.DateTimeField(auto_now=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering     = ["-created_at"]
        verbose_name = "Noticia"
        verbose_name_plural = "Noticias"

    def __str__(self):
        return f"[{self.get_tipo_display()}] {self.titulo}"

    # ------------------- GENERACIÓN AUTOMÁTICA DE SLUG -------------------
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.titulo)
            if Noticia.objects.filter(slug=base_slug).exists():
                self.slug = f"{base_slug}-{self.ann_id[:20]}"
            else:
                self.slug = base_slug
        super().save(*args, **kwargs)