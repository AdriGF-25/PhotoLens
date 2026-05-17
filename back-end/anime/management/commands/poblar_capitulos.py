"""
anime'n'chill — Comando para poblar capitulos desde media/Manga/
Uso:
    python manage.py poblar_capitulos
    python manage.py poblar_capitulos --manga "Chainsaw Man"
    python manage.py poblar_capitulos --dry-run
"""

import os
import re
from django.core.management.base import BaseCommand
from django.conf import settings
from anime.models import Manga, Capitulo


# ------------------- CONSTANTES ------------------- #
RUTA_MANGA   = os.path.join(settings.MEDIA_ROOT, "Manga")
EXTENSIONES  = {".jpg", ".jpeg", ".png", ".webp"}


# ------------------- HELPERS ------------------- #
def _es_imagen(nombre_archivo):
    """Comprueba si un archivo es una imagen valida."""
    _, ext = os.path.splitext(nombre_archivo.lower())
    return ext in EXTENSIONES


def _extraer_numero(texto):
    """
    Extrae el numero de capitulo de un string.
    Soporta enteros y decimales (ej: 7.5, 100).
    Devuelve None si no encuentra ninguno.
    """
    match = re.search(r"(\d+(?:\.\d+)?)", texto)
    return float(match.group(1)) if match else None


def _extraer_volumen_y_cap(nombre_carpeta):
    """
    Para el patron 'Vol 10_Chap 79_Titulo'.
    Devuelve (volumen: int, numero_cap: float, titulo: str)
    o None si no encaja el patron.
    """
    patron = re.match(
        r"Vol\s*(\d+)_Chap\s*(\d+(?:\.\d+)?)_?(.*)",
        nombre_carpeta,
        re.IGNORECASE
    )
    if patron:
        volumen = int(patron.group(1))
        numero  = float(patron.group(2))
        titulo  = patron.group(3).strip().replace("_", " ")
        return volumen, numero, titulo
    return None


def _procesar_carpeta_capitulo(ruta_carpeta, nombre_carpeta, manga_titulo):
    """
    Analiza una subcarpeta y devuelve un dict con los datos del capitulo.
    Soporta los tres patrones detectados en el proyecto.
    """
    # Contar imagenes dentro
    try:
        imagenes = sorted([
            f for f in os.listdir(ruta_carpeta)
            if _es_imagen(f)
        ])
    except PermissionError:
        return None

    if not imagenes:
        return None

    # Ruta relativa para guardar en BD (relativa a MEDIA_ROOT)
    ruta_relativa = os.path.relpath(ruta_carpeta, settings.MEDIA_ROOT)
    # Normalizar separadores a /
    ruta_relativa = ruta_relativa.replace("\\", "/")

    # ── Patron 1: Vol XX_Chap YY_Titulo ──
    datos_vol = _extraer_volumen_y_cap(nombre_carpeta)
    if datos_vol:
        volumen, numero, titulo = datos_vol
        return {
            "numero" : numero,
            "titulo" : titulo,
            "volumen": volumen,
            "ruta"   : ruta_relativa,
            "imagenes": len(imagenes),
        }

    # ── Patron 2 y 3: Capitulo X / texto libre ──
    numero = _extraer_numero(nombre_carpeta)
    if numero is None:
        # Si no hay numero extraible asignamos 0.0 para no perder el cap
        numero = 0.0

    return {
        "numero" : numero,
        "titulo" : nombre_carpeta.strip(),
        "volumen": None,
        "ruta"   : ruta_relativa,
        "imagenes": len(imagenes),
    }


# ------------------- COMMAND ------------------- #
class Command(BaseCommand):
    help = "Pobla los capitulos de cada manga leyendo la estructura de media/Manga/"


    def add_arguments(self, parser):
        parser.add_argument(
            "--manga",
            type=str,
            default=None,
            help="Titulo exacto del manga a procesar (por defecto procesa todos)"
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Simula el proceso sin escribir nada en la BD"
        )
        parser.add_argument(
            "--limpiar",
            action="store_true",
            default=False,
            help="Elimina los capitulos existentes del manga antes de repoblar"
        )


    def handle(self, *args, **kwargs):
        manga_filtro = kwargs["manga"]
        dry_run      = kwargs["dry_run"]
        limpiar      = kwargs["limpiar"]

        if dry_run:
            self.stdout.write(self.style.WARNING(
                "[DRY-RUN] Modo simulacion activo — no se escribira nada en BD"
            ))

        # ── Obtener lista de mangas a procesar ──
        if manga_filtro:
            mangas = Manga.objects.filter(titulo=manga_filtro)
            if not mangas.exists():
                self.stdout.write(self.style.ERROR(
                    f"No se encontro ningun manga con titulo: '{manga_filtro}'"
                ))
                return
        else:
            mangas = Manga.objects.all()

        if not mangas.exists():
            self.stdout.write(self.style.WARNING(
                "No hay mangas en la BD. Registra los mangas primero."
            ))
            return

        # ── Contadores globales ──
        total_creados    = 0
        total_existentes = 0
        total_errores    = 0

        # ── Procesar cada manga ──
        for manga in mangas:
            ruta_manga = os.path.join(RUTA_MANGA, manga.titulo)

            if not os.path.exists(ruta_manga):
                self.stdout.write(self.style.WARNING(
                    f"  [!] Carpeta no encontrada para: {manga.titulo}"
                ))
                continue

            self.stdout.write(f"\n{'─' * 55}")
            self.stdout.write(self.style.HTTP_INFO(
                f"  Procesando: {manga.titulo}"
            ))

            # Limpiar capitulos existentes si se pide
            if limpiar and not dry_run:
                eliminados = manga.capitulos.all().delete()[0]
                self.stdout.write(self.style.WARNING(
                    f"  [LIMPIAR] {eliminados} capitulos eliminados"
                ))

            # ── Obtener subcarpetas (capitulos) ──
            try:
                subcarpetas = sorted([
                    d for d in os.listdir(ruta_manga)
                    if os.path.isdir(os.path.join(ruta_manga, d))
                ])
            except PermissionError:
                self.stdout.write(self.style.ERROR(
                    f"  [ERROR] Sin permisos para leer: {ruta_manga}"
                ))
                continue

            if not subcarpetas:
                self.stdout.write(self.style.WARNING(
                    f"  [!] Sin subcarpetas en: {manga.titulo}"
                ))
                continue

            creados    = 0
            existentes = 0
            errores    = 0

            for nombre_carpeta in subcarpetas:
                ruta_carpeta = os.path.join(ruta_manga, nombre_carpeta)

                datos = _procesar_carpeta_capitulo(
                    ruta_carpeta, nombre_carpeta, manga.titulo
                )

                if datos is None:
                    self.stdout.write(self.style.WARNING(
                        f"    [!] Sin imagenes en: {nombre_carpeta}"
                    ))
                    errores += 1
                    continue

                if dry_run:
                    self.stdout.write(
                        f"    [SIM] Cap {datos['numero']:>6} | "
                        f"Vol {str(datos['volumen']):>3} | "
                        f"{datos['imagenes']:>3} imgs | "
                        f"{datos['titulo'][:35]}"
                    )
                    creados += 1
                    continue

                # ── Crear o ignorar si ya existe ──
                _, fue_creado = Capitulo.objects.get_or_create(
                    manga  = manga,
                    numero = datos["numero"],
                    defaults={
                        "titulo"        : datos["titulo"],
                        "volumen"       : datos["volumen"],
                        "ruta_imagenes" : datos["ruta"],
                    }
                )

                if fue_creado:
                    creados += 1
                else:
                    existentes += 1

            # ── Resumen por manga ──
            self.stdout.write(
                self.style.SUCCESS(f"  ✓ Creados: {creados}") +
                f"  |  Ya existian: {existentes}" +
                (f"  |  Errores: {errores}" if errores else "")
            )

            total_creados    += creados
            total_existentes += existentes
            total_errores    += errores

        # ── Resumen global ──
        self.stdout.write(f"\n{'═' * 55}")
        self.stdout.write(self.style.SUCCESS(
            f"COMPLETADO — Creados: {total_creados}  |  "
            f"Ya existian: {total_existentes}  |  "
            f"Errores: {total_errores}"
        ))