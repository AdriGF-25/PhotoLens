"""
anime'n'chill — Modelos principales (solo Manga)
"""

from django.db import models
from django.contrib.auth.models import User


# ------------------- GÉNERO ------------------- #
class Genero(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Género"
        verbose_name_plural = "Géneros"
        db_table = "generos"

    def __str__(self):
        return self.nombre


# ------------------- MANGA ------------------- #
class Manga(models.Model):
    class Estado(models.TextChoices):
        EN_CURSO = "ongoing", "En curso"
        COMPLETADO = "completed", "Completado"
        HIATUS = "hiatus", "En hiato"
        CANCELADO = "cancelled", "Cancelado"

    mangadex_id = models.CharField(max_length=255, blank=True, help_text="ID externo del manga")
    titulo = models.CharField(max_length=300)
    titulo_original = models.CharField(max_length=300, blank=True)
    descripcion = models.TextField(blank=True)
    autor = models.CharField(max_length=200, blank=True)
    anio_publicacion = models.PositiveIntegerField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_CURSO)
    portada_url = models.URLField(blank=True, help_text="URL rápida de la portada elegida")
    portada_local = models.ImageField(upload_to="Portadas/Manga/", null=True, blank=True)
    generos = models.ManyToManyField("Genero", blank=True, related_name="mangas")
    destacado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Manga"
        verbose_name_plural = "Mangas"
        db_table = "mangas"

    def __str__(self):
        return self.titulo

    @property
    def portada(self):
        if self.portada_local and getattr(self.portada_local, "name", ""):
            return self.portada_local.url

        portada_principal = self.portadas.filter(es_principal=True).first()
        if portada_principal and portada_principal.imagen:
            return portada_principal.imagen.url

        primera = self.portadas.first()
        if primera and primera.imagen:
            return primera.imagen.url

        if self.portada_url:
            return self.portada_url

        return ""


# ------------------- PORTADA ------------------- #
class Portada(models.Model):
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name="portadas")
    imagen = models.ImageField(upload_to="portadas/")
    titulo_busqueda = models.CharField(max_length=300, blank=True)
    fuente = models.CharField(max_length=50, default="manual")
    es_principal = models.BooleanField(default=False)
    creada_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-es_principal", "-creada_at"]
        verbose_name = "Portada"
        verbose_name_plural = "Portadas"

    def __str__(self):
        return f"{self.manga.titulo} - {self.id}"

    def save(self, *args, **kwargs):
        if self.es_principal:
            Portada.objects.filter(manga=self.manga, es_principal=True).exclude(pk=self.pk).update(es_principal=False)
            if self.imagen:
                self.manga.portada_url = self.imagen.url
            self.manga.save(update_fields=["portada_url"])
        super().save(*args, **kwargs)

# ------------------- CAPÍTULO ------------------- #
class Capitulo(models.Model):
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name="capitulos")
    numero = models.DecimalField(max_digits=6, decimal_places=1, help_text="Ej: 1, 7.5, 100")
    titulo = models.CharField(max_length=300, blank=True)
    volumen = models.PositiveIntegerField(null=True, blank=True)
    ruta_imagenes = models.CharField(max_length=500, blank=True)
    fecha_publicacion = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["numero"]
        verbose_name = "Capítulo"
        verbose_name_plural = "Capítulos"
        db_table = "capitulos"
        constraints = [
            models.UniqueConstraint(
                fields=["manga", "numero"],
                name="unique_capitulo_manga"
            )
        ]

    def __str__(self):
        return f"{self.manga.titulo} — Cap. {self.numero}"


# ------------------- FAVORITO ------------------- #
class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favoritos")
    manga = models.ForeignKey(Manga, on_delete=models.CASCADE, related_name="favoritos")
    fecha_guardado = models.DateTimeField(auto_now_add=True)
    nota_personal = models.TextField(blank=True)

    class Meta:
        verbose_name = "Favorito"
        verbose_name_plural = "Favoritos"
        db_table = "favoritos"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "manga"],
                name="unique_favorito_manga"
            )
        ]

    def __str__(self):
        return f"{self.usuario.username} → {self.manga.titulo}"


# ------------------- PROGRESO ------------------- #
class Progreso(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progresos")
    capitulo = models.ForeignKey(Capitulo, on_delete=models.CASCADE, related_name="progresos")
    fecha_lectura = models.DateTimeField(auto_now=True)
    completado = models.BooleanField(default=False)
    pagina_actual = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Progreso"
        verbose_name_plural = "Progresos"
        db_table = "progresos"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "capitulo"],
                name="unique_progreso_capitulo"
            )
        ]

    def __str__(self):
        return f"{self.usuario.username} — {self.capitulo}"