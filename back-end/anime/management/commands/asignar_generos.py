"""
anime'n'chill — Asigna géneros a los mangas por nombre
Uso: python manage.py asignar_generos
"""

from django.core.management.base import BaseCommand

from anime.models import Manga, Genero


MAPA_TITULOS = {
    "chainsaw man": "accion",
    "kimetsu": "accion",
    "gachiakuta": "accion",
    "solo leveling": "accion",
    "fire force": "accion",
    "one piece": "aventura",
    "blame": "aventura",
    "horimiya": "romance",
    "spy x family": "romance",
    "zero kara": "fantasia",
    "ragnarok": "accion",
    "hunter origin": "accion",
    "anatomy": "fantasia",
    "misuto": "fantasia",
}

GENEROS_BASE = [
    ("accion", "Acción"),
    ("aventura", "Aventura"),
    ("romance", "Romance"),
    ("fantasia", "Fantasía"),
]


class Command(BaseCommand):
    help = "Asigna géneros a los mangas según su título"

    def handle(self, *args, **options):
        self._crear_generos_base()

        mangas = Manga.objects.prefetch_related("generos").all()
        generos = {g.slug: g for g in Genero.objects.all()}
        asignados = 0
        saltados = 0

        if not mangas.exists():
            self.stdout.write(self.style.WARNING(
                "No hay mangas en la base de datos."
            ))
            return

        for manga in mangas:
            titulo_lower = manga.titulo.lower()
            slug_encontrado = None

            for fragmento, slug in MAPA_TITULOS.items():
                if fragmento in titulo_lower:
                    slug_encontrado = slug
                    break

            if not slug_encontrado:
                self.stdout.write(
                    self.style.WARNING(f"Sin mapeo: {manga.titulo}")
                )
                saltados += 1
                continue

            genero = generos.get(slug_encontrado)
            if not genero:
                self.stdout.write(
                    self.style.ERROR(f"Género no existe en BD: {slug_encontrado}")
                )
                saltados += 1
                continue

            manga.generos.set([genero])
            self.stdout.write(
                self.style.SUCCESS(f"✓ {manga.titulo} → {genero.nombre}")
            )
            asignados += 1

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Asignados: {asignados} | Sin mapeo: {saltados}")
        )

    def _crear_generos_base(self):
        creados = 0

        for slug, nombre in GENEROS_BASE:
            _, created = Genero.objects.get_or_create(
                slug=slug,
                defaults={"nombre": nombre}
            )
            if created:
                creados += 1

        self.stdout.write(self.style.SUCCESS(
            f"Géneros base revisados/creados: {len(GENEROS_BASE)} | Nuevos: {creados}"
        ))