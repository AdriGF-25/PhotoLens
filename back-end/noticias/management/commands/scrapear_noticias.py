"""
anime'n'chill — Comando para sincronizar noticias desde RSS de ANN
Uso: python manage.py scrapear_noticias --limite 20
"""

from django.core.management.base import BaseCommand
from noticias.services.sincronizacion import sincronizar_noticias_ann


class Command(BaseCommand):
    help = 'Sincroniza las últimas noticias desde el RSS de Anime News Network'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limite',
            type=int,
            default=20,
            help='Número de noticias a sincronizar (por defecto 20)'
        )

    def handle(self, *args, **kwargs):
        limite = kwargs['limite']
        self.stdout.write(self.style.WARNING(
            f'Sincronizando las últimas {limite} noticias del RSS de ANN...'
        ))

        resultado = sincronizar_noticias_ann(limite=limite)

        if not resultado["ok"]:
            self.stdout.write(self.style.ERROR(
                f'Error: {resultado["error"]}'
            ))
            return

        self.stdout.write(self.style.SUCCESS(
            f'✓ Completado: {resultado["creadas"]} creadas, '
            f'{resultado["actualizadas"]} actualizadas.'
        ))