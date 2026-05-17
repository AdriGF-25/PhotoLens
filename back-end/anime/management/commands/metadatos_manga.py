"""
anime'n'chill — Menú interactivo para scraping y sincronización de portadas
El catálogo se genera automáticamente desde media/Manga/.
Uso: python manage.py scrapear_portadas
"""

from django.core.management.base import BaseCommand
from anime.services.sincronizacion import sincronizar_portadas, sincronizar_uno_por_titulo
from anime.services.mangadex       import consultar_manga, get_catalogo_local, TERMINOS_CUSTOM


# ------------------- COMANDO PRINCIPAL ------------------- #

class Command(BaseCommand):
    help = 'Menú para obtener portadas y metadatos desde la API oficial de MangaDex'

    def add_arguments(self, parser):
        parser.add_argument(
            '--forzar',
            action='store_true',
            default=False,
            help='Fuerza la actualización aunque no haya cambios'
        )

    def handle(self, *args, **kwargs):
        self.forzar = kwargs['forzar']
        self._mostrar_menu()

    # ------------------- MENÚ ------------------- #

    def _mostrar_menu(self):
        catalogo = get_catalogo_local()
        self.stdout.write('\n' + '═' * 52)
        self.stdout.write(self.style.SUCCESS(
            "   anime'n'chill — Gestor de portadas MangaDex"
        ))
        self.stdout.write(f'   {len(catalogo)} manga(s) detectados en media/Manga/')
        self.stdout.write('═' * 52)
        self.stdout.write('  [1]  Sincronizar todo      (solo cambios)')
        self.stdout.write('  [2]  Forzar todo           (actualiza siempre)')
        self.stdout.write('  [3]  Sincronizar uno solo  (elige del catálogo)')
        self.stdout.write('  [4]  Prueba de conexión    (sin guardar en BD)')
        self.stdout.write('  [5]  Buscar un manga       (sin guardar en BD)')
        self.stdout.write('  [6]  Ver catálogo local')
        self.stdout.write('  [0]  Salir')
        self.stdout.write('═' * 52)

        opcion = input('  Elige una opción: ').strip()

        acciones = {
            '1': self._accion_sincronizar,
            '2': self._accion_forzar,
            '3': self._accion_sincronizar_uno,
            '4': self._accion_prueba_conexion,
            '5': self._accion_buscar_uno,
            '6': self._accion_ver_catalogo,
            '0': self._accion_salir,
        }

        accion = acciones.get(opcion)
        if accion:
            accion()
        else:
            self.stdout.write(self.style.ERROR('  Opción no válida.'))
            self._mostrar_menu()


    # ------------------- OPCIONES ------------------- #

    def _accion_sincronizar(self):
        self._ejecutar_sincronizacion(forzar=False)

    def _accion_forzar(self):
        self.stdout.write(self.style.WARNING(
            '\n⚠  Modo forzar: se actualizarán todos aunque no hayan cambiado.\n'
        ))
        self._ejecutar_sincronizacion(forzar=True)

    def _accion_sincronizar_uno(self):
        """[3] Muestra el catálogo numerado y sincroniza el manga elegido."""
        catalogo = get_catalogo_local()

        if not catalogo:
            self.stdout.write(self.style.ERROR(
                '\n  No hay carpetas en media/Manga/.'
            ))
            self._volver_al_menu()
            return

        # Mostrar lista numerada
        titulos = list(catalogo.keys())
        self.stdout.write('\n  Elige el manga a sincronizar:')
        self.stdout.write('  ' + '─' * 46)
        for i, titulo in enumerate(titulos, 1):
            tiene_custom = titulo in TERMINOS_CUSTOM
            indicador    = self.style.WARNING(' ⚙') if tiene_custom else ''
            self.stdout.write(f'  {i:>2}. {titulo}{indicador}')
        self.stdout.write('  ' + '─' * 46)

        eleccion = input('\n  Número del manga [o Enter para cancelar]: ').strip()

        if not eleccion:
            self.stdout.write('  Operación cancelada.')
            self._volver_al_menu()
            return

        try:
            indice = int(eleccion) - 1
            if indice < 0 or indice >= len(titulos):
                raise ValueError
        except ValueError:
            self.stdout.write(self.style.ERROR('  Número no válido.'))
            self._volver_al_menu()
            return

        titulo_elegido = titulos[indice]

        # Preguntar si forzar
        forzar_str = input(f'\n  ¿Forzar actualización aunque no haya cambios? [s/n]: ').strip().lower()
        forzar     = forzar_str == 's'

        self.stdout.write(self.style.WARNING(
            f'\n  Sincronizando "{titulo_elegido}"...\n'
        ))

        r = sincronizar_uno_por_titulo(titulo_elegido, forzar=forzar)
        self._imprimir_resultado(r)
        self._volver_al_menu()

    def _accion_prueba_conexion(self):
        self.stdout.write(self.style.WARNING('\nProbando conexión con MangaDex...'))
        catalogo = get_catalogo_local()

        if not catalogo:
            self.stdout.write(self.style.ERROR(
                '  ✗ No hay carpetas en media/Manga/.'
            ))
            self._volver_al_menu()
            return

        termino_prueba = list(catalogo.values())[0]
        datos = consultar_manga(termino_prueba)

        if datos:
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ Conexión OK — Portada obtenida: {datos["portada_url"]}'
            ))
        else:
            self.stdout.write(self.style.ERROR(
                '  ✗ Sin respuesta de MangaDex. Revisa tu conexión.'
            ))
        self._volver_al_menu()

    def _accion_buscar_uno(self):
        titulo = input('\n  Nombre del manga a buscar: ').strip()
        if not titulo:
            self.stdout.write(self.style.ERROR('  Nombre vacío, operación cancelada.'))
            self._volver_al_menu()
            return

        self.stdout.write(self.style.WARNING(f'\n  Buscando "{titulo}"...'))
        datos = consultar_manga(titulo)

        if not datos:
            self.stdout.write(self.style.ERROR(
                '  ✗ No encontrado. Prueba con otro término o añádelo a TERMINOS_CUSTOM.'
            ))
        else:
            self.stdout.write(self.style.SUCCESS('  ✓ Encontrado:'))
            self.stdout.write(f'    ID          : {datos["mangadex_id"]}')
            self.stdout.write(f'    Portada URL : {datos["portada_url"]}')
            self.stdout.write(f'    Autor       : {datos["autor"] or "—"}')
            self.stdout.write(f'    Estado      : {datos["estado_raw"]}')
            self.stdout.write(f'    Géneros     : {", ".join(datos["generos"]) or "—"}')
            self.stdout.write(f'    Descripción : {datos["descripcion"][:120]}...')

        self._volver_al_menu()

    def _accion_ver_catalogo(self):
        catalogo = get_catalogo_local()

        if not catalogo:
            self.stdout.write(self.style.ERROR(
                '\n  No se encontraron carpetas en media/Manga/.'
            ))
            self._volver_al_menu()
            return

        self.stdout.write('\n  Catálogo detectado en media/Manga/:')
        self.stdout.write('  ' + '─' * 50)
        for i, (titulo, termino) in enumerate(catalogo.items(), 1):
            tiene_custom = titulo in TERMINOS_CUSTOM
            indicador    = self.style.WARNING(' ⚙ custom') if tiene_custom else ''
            self.stdout.write(f'  {i:>2}. {titulo:<44}{indicador}')
        self.stdout.write('  ' + '─' * 50)
        self.stdout.write(f'\n  Total: {len(catalogo)} manga(s) detectados.\n')
        self._volver_al_menu()

    def _accion_salir(self):
        self.stdout.write(self.style.SUCCESS('\n  Hasta luego.\n'))

    def _volver_al_menu(self):
        respuesta = input('\n  ¿Volver al menú? [s/n]: ').strip().lower()
        if respuesta == 's':
            self._mostrar_menu()


    # ------------------- LÓGICA COMÚN ------------------- #

    def _ejecutar_sincronizacion(self, forzar: bool):
        catalogo = get_catalogo_local()
        self.stdout.write(self.style.WARNING(
            f'\n  Sincronizando {len(catalogo)} manga(s) desde MangaDex...\n'
        ))

        resultado = sincronizar_portadas(forzar=forzar)

        self.stdout.write('  ' + '─' * 50)
        for r in resultado["resultados"]:
            self._imprimir_resultado(r)

        self.stdout.write('  ' + '─' * 50)
        self.stdout.write(
            f'\n  ✓ {resultado["creados"]} creados  '
            f'·  {resultado["actualizados"]} actualizados  '
            f'·  {resultado["sin_cambios"]} sin cambios  '
            f'·  {resultado["errores"]} errores\n'
        )
        self._volver_al_menu()

    def _imprimir_resultado(self, r: dict):
        """Imprime una línea de resultado con color según el estado."""
        titulo = r["titulo_local"]
        estado = r["estado"]

        if estado == "creado":
            self.stdout.write(self.style.SUCCESS(
                f'  ✓  [NUEVO]         {titulo}'
            ))
        elif estado == "actualizado":
            self.stdout.write(self.style.SUCCESS(
                f'  ✓  [ACTUALIZADO]   {titulo}'
            ))
        elif estado == "sin_cambios":
            self.stdout.write(self.style.WARNING(
                f'  ·  [SIN CAMBIOS]   {titulo}'
            ))
        elif estado == "error":
            self.stdout.write(self.style.ERROR(
                f'  ✗  [ERROR]         {titulo} — {r.get("error", "")}'
            ))