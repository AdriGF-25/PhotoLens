"""
anime'n'chill — Comando de extracción de noticias
"""

from django.core.management.base import BaseCommand
from noticias.models import Noticia
from noticias.services import ann

class Command(BaseCommand):
    help = 'Sincroniza las noticias recientes desde Anime News Network (ANN)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limite',
            type=int,
            default=15,
            help='Número de noticias recientes a comprobar (por defecto 15 para no saturar la API)'
        )

    def handle(self, *args, **kwargs):
        limite = kwargs['limite']
        self.stdout.write(self.style.WARNING(f'Iniciando sincronización de las últimas {limite} noticias de ANN...'))

        # 1. Obtener la lista de IDs recientes (esta llamada no trae la imagen, solo datos básicos)
        noticias_basicas = ann.obtener_noticias_recientes(limite=limite)
        
        if not noticias_basicas:
            self.stdout.write(self.style.ERROR('No se pudo obtener la lista inicial de ANN.'))
            return

        nuevas = 0
        actualizadas = 0

        # 2. Procesar cada noticia
        for item in noticias_basicas:
            ann_id = item.get("ann_id")
            
            if not ann_id:
                continue

            self.stdout.write(f"Procesando ANN ID {ann_id} - {item.get('titulo')}...")

            # 3. Comprobar si ya está en la base de datos
            # Usamos get_or_create para manejar automáticamente la creación o recuperación
            noticia_obj, creada = Noticia.objects.get_or_create(
                ann_id=ann_id,
                defaults={
                    'titulo': item.get("titulo"),
                    'tipo': item.get("tipo"),
                    'url_externa': item.get("url_externa"),
                    'descripcion': item.get("descripcion")
                }
            )

            # 4. Si la noticia es nueva, o si le falta la imagen, hacemos la llamada de detalle
            if creada or not noticia_obj.imagen_url:
                self.stdout.write(f"  -> Obteniendo detalles/imagen para {ann_id}...")
                
                detalle = ann.obtener_detalle(ann_id=ann_id)
                
                if detalle:
                    # Actualizamos con la info enriquecida
                    noticia_obj.descripcion = detalle.get("descripcion") or noticia_obj.descripcion
                    noticia_obj.imagen_url = detalle.get("imagen_url", "")
                    
                    if detalle.get("anio"):
                        noticia_obj.fecha_ann = str(detalle.get("anio"))
                    
                    noticia_obj.save()
                    
                    if creada:
                        nuevas += 1
                        self.stdout.write(self.style.SUCCESS(f"  [+] Noticia NUEVA guardada con imagen."))
                    else:
                        actualizadas += 1
                        self.stdout.write(self.style.SUCCESS(f"  [*] Noticia ACTUALIZADA con imagen."))
                else:
                    self.stdout.write(self.style.ERROR(f"  [-] No se pudieron obtener detalles de {ann_id}."))
            else:
                self.stdout.write(self.style.SUCCESS(f"  [=] La noticia ya existe y tiene imagen. Omitiendo."))

        # Resumen final
        self.stdout.write(self.style.SUCCESS(
            f'\nSincronización completada: {nuevas} creadas, {actualizadas} actualizadas.'
        ))