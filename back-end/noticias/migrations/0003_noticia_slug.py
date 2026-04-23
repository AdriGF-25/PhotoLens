from django.db import migrations, models
from django.utils.text import slugify


# ------------------- FUNCIÓN DE MIGRACIÓN DE DATOS -------------------
def generar_slugs(apps, schema_editor):
    """
    Genera un slug único para cada noticia existente.
    Se ejecuta ANTES de aplicar la restricción unique.
    Usa ann_id como sufijo si hay colisión.
    """
    Noticia = apps.get_model('noticias', 'Noticia')

    slugs_usados = set()

    for noticia in Noticia.objects.all():
        base_slug = slugify(noticia.titulo)

        # Si el slug base ya fue usado en esta misma migración, añadimos ann_id
        if base_slug in slugs_usados or not base_slug:
            slug_final = f"{base_slug}-{noticia.ann_id}" if base_slug else f"noticia-{noticia.ann_id}"
        else:
            slug_final = base_slug

        slugs_usados.add(slug_final)
        noticia.slug = slug_final
        noticia.save()


class Migration(migrations.Migration):

    dependencies = [
        # ------------------- DEPENDENCIA CON LA MIGRACIÓN ANTERIOR -------------------
        ('noticias', '0002_alter_noticia_options_and_more'),
    ]

    operations = [
        # ------------------- PASO 1: Añadir el campo SIN unique todavía -------------------
        migrations.AddField(
            model_name='noticia',
            name='slug',
            field=models.SlugField(
                blank=True,
                default='',
                help_text='URL amigable generada automáticamente desde el título',
                max_length=350,
            ),
            preserve_default=False,
        ),

        # ------------------- PASO 2: Rellenar slugs en filas existentes -------------------
        migrations.RunPython(generar_slugs, migrations.RunPython.noop),

        # ------------------- PASO 3: Ahora sí aplicamos unique, ya no hay duplicados -------------------
        migrations.AlterField(
            model_name='noticia',
            name='slug',
            field=models.SlugField(
                blank=True,
                unique=True,
                help_text='URL amigable generada automáticamente desde el título',
                max_length=350,
            ),
        ),
    ]