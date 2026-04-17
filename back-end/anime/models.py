"""
anime'n'chill — Modelos principales
"""

from django.db import models
from django.contrib.auth.models import User


# ------------------- GÉNERO -------------------
class Genero(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "Género"
        verbose_name_plural = "Géneros"

    def __str__(self):
        return self.nombre


# ------------------- MANGA -------------------
class Manga(models.Model):
    class Estado(models.TextChoices):
        EN_CURSO    = "ongoing",   "En curso"
        COMPLETADO  = "completed", "Completado"
        HIATUS      = "hiatus",    "En hiato"
        CANCELADO   = "cancelled", "Cancelado"

    mangadex_id     = models.CharField(max_length=255, blank=True,
                        help_text="UUID de MangaDex para obtener portada e info")
    titulo          = models.CharField(max_length=300)
    titulo_original = models.CharField(max_length=300, blank=True)
    descripcion     = models.TextField(blank=True)
    autor           = models.CharField(max_length=200, blank=True)
    anio_publicacion = models.PositiveIntegerField(null=True, blank=True)
    estado          = models.CharField(max_length=20, choices=Estado.choices,
                        default=Estado.EN_CURSO)
    portada_url     = models.URLField(blank=True,
                        help_text="URL externa de la portada (MangaDex)")
    portada_local   = models.ImageField(upload_to="Portadas/Manga/",
                        null=True, blank=True)
    generos         = models.ManyToManyField("Genero", blank=True,
                        related_name="mangas")
    destacado       = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Manga"
        verbose_name_plural = "Mangas"

    def __str__(self):
        return self.titulo

    @property
    def portada(self):
        """Devuelve portada local si existe, si no la URL de MangaDex."""
        if self.portada_local:
            return self.portada_local.url
        return self.portada_url or ""


# ------------------- ANIME -------------------
class Anime(models.Model):
    class Estado(models.TextChoices):
        EN_EMISION   = "airing",    "En emisión"
        FINALIZADO   = "finished",  "Finalizado"
        PROXIMAMENTE = "upcoming",  "Próximamente"
        CANCELADO    = "cancelled", "Cancelado"

    class Tipo(models.TextChoices):
        TV      = "tv",      "Serie TV"
        PELICULA = "movie",  "Película"
        OVA     = "ova",     "OVA"
        ONA     = "ona",     "ONA"
        ESPECIAL = "special","Especial"

    titulo          = models.CharField(max_length=300)
    titulo_japones  = models.CharField(max_length=300, blank=True)
    descripcion     = models.TextField(blank=True)
    estudio         = models.CharField(max_length=200, blank=True)
    anio_emision    = models.PositiveIntegerField(null=True, blank=True)
    estado          = models.CharField(max_length=20, choices=Estado.choices,
                        default=Estado.EN_EMISION)
    tipo            = models.CharField(max_length=10, choices=Tipo.choices,
                        default=Tipo.TV)
    total_episodios = models.PositiveIntegerField(null=True, blank=True)
    portada_url     = models.URLField(blank=True)
    portada_local   = models.ImageField(upload_to="Portadas/Anime/",
                        null=True, blank=True)
    generos         = models.ManyToManyField("Genero", blank=True,
                        related_name="animes")
    destacado       = models.BooleanField(default=False)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Anime"
        verbose_name_plural = "Animes"

    def __str__(self):
        return self.titulo

    @property
    def portada(self):
        if self.portada_local:
            return self.portada_local.url
        return self.portada_url or ""


# ------------------- CAPÍTULO -------------------
class Capitulo(models.Model):
    manga            = models.ForeignKey(Manga, on_delete=models.CASCADE,
                         related_name="capitulos")
    numero           = models.DecimalField(max_digits=6, decimal_places=1,
                         help_text="Ej: 1, 7.5, 100")
    titulo           = models.CharField(max_length=300, blank=True)
    volumen          = models.PositiveIntegerField(null=True, blank=True)
    ruta_imagenes    = models.CharField(max_length=500, blank=True)
    fecha_publicacion = models.DateField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["numero"]
        verbose_name = "Capítulo"
        verbose_name_plural = "Capítulos"
        constraints = [
            models.UniqueConstraint(
                fields=["manga", "numero"],
                name="unique_capitulo_manga"
            )
        ]

    def __str__(self):
        return f"{self.manga.titulo} — Cap. {self.numero}"


# ------------------- EPISODIO -------------------
class Episodio(models.Model):
    anime         = models.ForeignKey(Anime, on_delete=models.CASCADE,
                      related_name="episodios")
    numero        = models.PositiveIntegerField()
    titulo        = models.CharField(max_length=300, blank=True)
    duracion_min  = models.PositiveIntegerField(null=True, blank=True,
                      help_text="Duración en minutos")
    fecha_emision = models.DateField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["numero"]
        verbose_name = "Episodio"
        verbose_name_plural = "Episodios"
        constraints = [
            models.UniqueConstraint(
                fields=["anime", "numero"],
                name="unique_episodio_anime"
            )
        ]

    def __str__(self):
        return f"{self.anime.titulo} — Ep. {self.numero}"


# ------------------- FAVORITO (N:M con through) -------------------
class Favorito(models.Model):
    """
    Relación N:M con datos extra entre Usuario y contenido.
    Cumple requisito: N:M con modelo through.
    """
    class TipoContenido(models.TextChoices):
        MANGA = "manga", "Manga"
        ANIME = "anime", "Anime"

    usuario       = models.ForeignKey(User, on_delete=models.CASCADE,
                      related_name="favoritos")
    manga         = models.ForeignKey(Manga, on_delete=models.CASCADE,
                      null=True, blank=True, related_name="favoritos")
    anime         = models.ForeignKey(Anime, on_delete=models.CASCADE,
                      null=True, blank=True, related_name="favoritos")
    tipo          = models.CharField(max_length=10,
                      choices=TipoContenido.choices)
    fecha_guardado = models.DateTimeField(auto_now_add=True)
    nota_personal = models.TextField(blank=True)

    class Meta:
        verbose_name = "Favorito"
        verbose_name_plural = "Favoritos"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "manga"],
                condition=models.Q(manga__isnull=False),
                name="unique_favorito_manga"
            ),
            models.UniqueConstraint(
                fields=["usuario", "anime"],
                condition=models.Q(anime__isnull=False),
                name="unique_favorito_anime"
            ),
        ]

    def __str__(self):
        contenido = self.manga or self.anime
        return f"{self.usuario.username} → {contenido}"


# ------------------- PROGRESO (N:M con through) -------------------
class Progreso(models.Model):
    """
    Seguimiento de lectura por capítulo.
    Segunda relación N:M con datos extra.
    """
    usuario      = models.ForeignKey(User, on_delete=models.CASCADE,
                     related_name="progresos")
    capitulo     = models.ForeignKey(Capitulo, on_delete=models.CASCADE,
                     related_name="progresos")
    fecha_lectura = models.DateTimeField(auto_now=True)
    completado   = models.BooleanField(default=False)
    pagina_actual = models.PositiveIntegerField(default=1)

    class Meta:
        verbose_name = "Progreso"
        verbose_name_plural = "Progresos"
        constraints = [
            models.UniqueConstraint(
                fields=["usuario", "capitulo"],
                name="unique_progreso_capitulo"
            )
        ]

    def __str__(self):
        return f"{self.usuario.username} — {self.capitulo}"