from pathlib import Path
import re

from django.conf import settings
from django.core.management.base import BaseCommand

from anime.models import Manga


RUTA_PORTADAS = Path(settings.MEDIA_ROOT) / "Portadas"


class Command(BaseCommand):
    help = "Ajusta portadas con emparejamiento estricto por nombre de archivo"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Simula el proceso sin guardar cambios"
        )

    def handle(self, *args, **kwargs):
        dry_run = kwargs["dry_run"]

        if not RUTA_PORTADAS.exists():
            self.stdout.write(self.style.ERROR(f"No existe la carpeta: {RUTA_PORTADAS}"))
            return

        archivos = [a for a in RUTA_PORTADAS.rglob("*") if a.is_file()]
        if not archivos:
            self.stdout.write(self.style.WARNING(f"No hay imágenes dentro de: {RUTA_PORTADAS}"))
            return

        mangas = Manga.objects.all().order_by("titulo")
        total = mangas.count()
        actualizados = 0
        sin_portada = []
        ambiguos = []

        self.stdout.write(f"\n{'═' * 55}")

        for manga in mangas:
            coincidencias = self._buscar_coincidencias(manga.titulo, archivos)

            if len(coincidencias) == 0:
                sin_portada.append(manga.titulo)
                self.stdout.write(self.style.WARNING(f"  [SIN PORTADA] {manga.titulo}"))
                continue

            if len(coincidencias) > 1:
                ambiguos.append((manga.titulo, [c.relative_to(settings.MEDIA_ROOT).as_posix() for c in coincidencias]))
                self.stdout.write(self.style.ERROR(f"  [AMBIGUO] {manga.titulo} -> {len(coincidencias)} coincidencias"))
                continue

            portada = coincidencias[0]
            ruta_relativa = portada.relative_to(settings.MEDIA_ROOT).as_posix()

            if dry_run:
                self.stdout.write(self.style.SUCCESS(f"  [DRY-RUN] {manga.titulo} -> {ruta_relativa}"))
                actualizados += 1
                continue

            manga.portada_local = ruta_relativa
            manga.save(update_fields=["portada_local", "updated_at"])
            actualizados += 1
            self.stdout.write(self.style.SUCCESS(f"  [OK] {manga.titulo} -> {ruta_relativa}"))

        self.stdout.write(f"{'═' * 55}")
        self.stdout.write(self.style.SUCCESS(f"COMPLETADO — Total: {total} | Actualizados: {actualizados}"))

        if sin_portada:
            self.stdout.write(self.style.WARNING("Mangas sin portada:"))
            for titulo in sin_portada:
                self.stdout.write(f"- {titulo}")

        if ambiguos:
            self.stdout.write(self.style.ERROR("Mangas con coincidencias ambiguas:"))
            for titulo, rutas in ambiguos:
                self.stdout.write(f"- {titulo}")
                for ruta in rutas:
                    self.stdout.write(f"  · {ruta}")

    def _buscar_coincidencias(self, titulo, archivos):
        titulo_n = self._normalizar(titulo)
        titulo_tokens = self._tokens(titulo_n)
        resultados = []

        for archivo in archivos:
            nombre_n = self._normalizar(archivo.stem)
            nombre_tokens = self._tokens(nombre_n)

            if nombre_n == titulo_n:
                resultados.append(archivo)
                continue

            if titulo_n in nombre_n or nombre_n in titulo_n:
                resultados.append(archivo)
                continue

            if self._tokens_coinciden(titulo_tokens, nombre_tokens):
                resultados.append(archivo)

        return self._filtrar_unicos(resultados)

    def _tokens_coinciden(self, tokens_titulo, tokens_archivo):
        if not tokens_titulo or not tokens_archivo:
            return False

        if len(tokens_titulo) == 1:
            return tokens_titulo[0] in tokens_archivo

        if len(tokens_archivo) == 1:
            return tokens_archivo[0] in tokens_titulo

        comunes = sum(1 for t in tokens_titulo if t in tokens_archivo)
        return comunes >= max(1, min(len(tokens_titulo), len(tokens_archivo)) - 1)

    def _filtrar_unicos(self, resultados):
        unicos = []
        vistos = set()
        for archivo in resultados:
            clave = archivo.resolve()
            if clave not in vistos:
                vistos.add(clave)
                unicos.append(archivo)
        return unicos

    def _tokens(self, texto):
        return [t for t in re.split(r"[^a-z0-9]+", texto) if t]

    def _normalizar(self, texto):
        texto = texto.lower()
        texto = (
            texto.replace("á", "a").replace("é", "e").replace("í", "i")
                 .replace("ó", "o").replace("ú", "u").replace("ü", "u")
        )
        texto = re.sub(r"[^a-z0-9]+", "", texto)
        return texto