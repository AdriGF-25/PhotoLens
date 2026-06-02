"""
anime'n'chill — Menú interactivo de comandos del proyecto
Uso: python manage.py menu_comandos
"""

from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Menú interactivo para comprobar comandos del proyecto'

    def handle(self, *args, **kwargs):
        self._mostrar_menu()

    def _mostrar_menu(self):
        self.stdout.write('\n' + '═' * 52)
        self.stdout.write(self.style.SUCCESS("   anime'n'chill — Menú de comandos"))
        self.stdout.write('═' * 52)
        self.stdout.write('  [1]  Registrar mangas')
        self.stdout.write('  [2]  Poblar capítulos')
        self.stdout.write('  [3]  Asignar géneros')
        self.stdout.write('  [4]  Ver ayuda de comandos')
        self.stdout.write('  [0]  Salir')
        self.stdout.write('═' * 52)

        opcion = input('  Elige una opción: ').strip()

        acciones = {
            '1': self._accion_registrar_mangas,
            '2': self._accion_poblar_capitulos,
            '3': self._accion_asignar_generos,
            '4': self._accion_ver_ayuda,
            '0': self._accion_salir,
        }

        accion = acciones.get(opcion)
        if accion:
            accion()
        else:
            self.stdout.write(self.style.ERROR('  Opción no válida.'))
            self._volver_al_menu()

    def _accion_registrar_mangas(self):
        self.stdout.write(self.style.WARNING(
            '\n  Ejecuta en otra terminal:\n'
            '  python manage.py registrar_mangas\n'
        ))
        self._volver_al_menu()

    def _accion_poblar_capitulos(self):
        self.stdout.write(self.style.WARNING(
            '\n  Ejecuta en otra terminal:\n'
            '  python manage.py poblar_capitulos\n'
        ))
        self._volver_al_menu()

    def _accion_asignar_generos(self):
        self.stdout.write(self.style.WARNING(
            '\n  Ejecuta en otra terminal:\n'
            '  python manage.py asignar_generos\n'
        ))
        self._volver_al_menu()

    def _accion_ver_ayuda(self):
        self.stdout.write(self.style.SUCCESS(
            '\n  Comandos disponibles:\n'
            '  - registrar_mangas\n'
            '  - poblar_capitulos\n'
            '  - asignar_generos\n'
        ))
        self._volver_al_menu()

    def _accion_salir(self):
        self.stdout.write(self.style.SUCCESS('\n  Hasta luego.\n'))

    def _volver_al_menu(self):
        respuesta = input('\n  ¿Volver al menú? [s/n]: ').strip().lower()
        if respuesta == 's':
            self._mostrar_menu()