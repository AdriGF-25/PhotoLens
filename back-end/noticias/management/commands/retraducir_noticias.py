"""
anime'n'chill — Comando para retraducir noticias sin traducción
Uso: python manage.py retraducir_noticias
"""

from django.core.management.base import BaseCommand
from noticias.models import Noticia
from noticias.services.sincronizacion import _traducir_texto


class Command(BaseCommand):
    help = 'Retraducir noticias que tienen contenido pero no tienen contenido_es'

    def handle(self, *args, **kwargs):
        # Solo noticias con contenido en inglés pero sin traducción
        pendientes = Noticia.objects.filter(
            contenido__gt="",
            contenido_es=""
        )

        total = pendientes.count()

        if total == 0:
            self.stdout.write(self.style.SUCCESS("✓ No hay noticias pendientes de traducir."))
            return

        self.stdout.write(self.style.WARNING(f"Traduciendo {total} noticias pendientes..."))

        traducidas = 0
        errores    = 0

        for noticia in pendientes:
            self.stdout.write(f"  → [{noticia.id}] {noticia.titulo[:60]}...")

            traduccion = _traducir_texto(noticia.contenido)

            if traduccion:
                noticia.contenido_es = traduccion
                noticia.save()
                traducidas += 1
            else:
                self.stdout.write(self.style.ERROR(f"     ✗ Falló la traducción"))
                errores += 1

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Completado: {traducidas} traducidas, {errores} errores."
        ))