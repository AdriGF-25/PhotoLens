"""
anime'n'chill — Modelo de Noticias
Fuente: Anime News Network Encyclopedia API
"""

from django.db import models
from django.utils.text import slugify


# ------------------- NOTICIA -------------------
class Noticia(models.Model):
    class Tipo(models.TextChoices):
        ANIME = "anime", "Anime"
        MANGA = "manga", "Manga"

    # ann_id único para no duplicar al sincronizar
    ann_id      = models.CharField(max_length=50, unique=True,
                    help_text="ID del título en ANN")
    titulo      = models.CharField(max_length=300)

    # slug: versión limpia del título para URLs amigables
    # unique=True garantiza que no haya dos noticias con el mismo slug
    # blank=True permite generarlo automáticamente al guardar
    slug        = models.SlugField(max_length=350, unique=True, blank=True,
                    help_text="URL amigable generada automáticamente desde el título")

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

    # ------------------- GENERACIÓN AUTOMÁTICA DE SLUG -------------------
    def save(self, *args, **kwargs):
        """
        Genera el slug automáticamente a partir del título si aún no tiene uno.
        Si el slug base ya existe en BD, le añade el ann_id al final para hacerlo único.
        Ejemplo: "chainsaw-man" → "chainsaw-man-12345"
        """
        if not self.slug:
            base_slug = slugify(self.titulo)

            # Comprobamos si ya existe ese slug en la base de datos
            if Noticia.objects.filter(slug=base_slug).exists():
                # Si ya existe, añadimos el ann_id para hacerlo único
                self.slug = f"{base_slug}-{self.ann_id}"
            else:
                self.slug = base_slug

        super().save(*args, **kwargs)