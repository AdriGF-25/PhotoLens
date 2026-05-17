"""
anime'n'chill — Comando para registrar mangas en BD desde media/Manga/
Uso:
    python manage.py registrar_mangas
    python manage.py registrar_mangas --dry-run
"""

import os
from django.core.management.base import BaseCommand
from django.conf import settings
from anime.models import Manga

RUTA_MANGA = os.path.join(settings.MEDIA_ROOT, "Manga")


class Command(BaseCommand):
    help = "Crea registros Manga en BD por cada carpeta encontrada en media/Manga/"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Simula el proceso sin escribir nada en la BD"
        )

    def handle(self, *args, **kwargs):
        dry_run = kwargs["dry_run"]

        if dry_run:
            self.stdout.write(self.style.WARNING(
                "[DRY-RUN] Modo simulacion — no se escribira nada en BD"
            ))

        if not os.path.exists(RUTA_MANGA):
            self.stdout.write(self.style.ERROR(
                f"No existe la carpeta: {RUTA_MANGA}"
            ))
            return

        carpetas = sorted([
            d for d in os.listdir(RUTA_MANGA)
            if os.path.isdir(os.path.join(RUTA_MANGA, d))
        ])

        if not carpetas:
            self.stdout.write(self.style.WARNING("No hay carpetas en media/Manga/"))
            return

        creados    = 0
        existentes = 0

        self.stdout.write(f"\n{'═' * 55}")
        for titulo in carpetas:
            if dry_run:
                existe = Manga.objects.filter(titulo=titulo).exists()
                estado = f"{'YA EXISTE' if existe else 'SE CREARIA'}"
                color  = self.style.WARNING if existe else self.style.SUCCESS
                self.stdout.write(color(f"  [{estado}] {titulo}"))
                if not existe:
                    creados += 1
                else:
                    existentes += 1
                continue

            _, fue_creado = Manga.objects.get_or_create(
                titulo=titulo,
                defaults={"estado": "ongoing"}
            )

            if fue_creado:
                self.stdout.write(self.style.SUCCESS(f"  [CREADO]    {titulo}"))
                creados += 1
            else:
                self.stdout.write(self.style.WARNING(f"  [YA EXISTE] {titulo}"))
                existentes += 1

        self.stdout.write(f"{'═' * 55}")
        self.stdout.write(self.style.SUCCESS(
            f"COMPLETADO — Creados: {creados}  |  Ya existian: {existentes}"
        ))
        if creados > 0 and not dry_run:
            self.stdout.write(self.style.HTTP_INFO(
                "Siguiente paso: python manage.py poblar_capitulos"
            ))