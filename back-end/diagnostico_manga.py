"""
diagnostico_manga.py
Ejecutar: python manage.py shell -c "exec(open('diagnostico_manga.py', encoding='utf-8').read())"
"""

import os
from django.conf import settings
from anime.models import Manga, Capitulo

RUTA_MANGA = os.path.join(settings.MEDIA_ROOT, "Manga")

# ------------------- COLORES ------------------- #
V  = "\033[92m"
R  = "\033[91m"
Y  = "\033[93m"
B  = "\033[94m"
C  = "\033[96m"
W  = "\033[97m"
D  = "\033[90m"
NC = "\033[0m"
SEP  = "─" * 62
SEP2 = "═" * 62

# ------------------- HELPERS ------------------- #
def detectar_formato(ruta):
    conteo = {"jpg": 0, "jpeg": 0, "png": 0, "webp": 0}
    for root, _, files in os.walk(ruta):
        for f in files:
            ext = f.rsplit(".", 1)[-1].lower() if "." in f else ""
            if ext in conteo:
                conteo[ext] += 1
    conteo["jpg"] += conteo.pop("jpeg", 0)
    dominante = max(conteo, key=conteo.get)
    total = sum(conteo.values())
    return (dominante if total > 0 else "---"), total


def analizar_estructura(ruta_dir):
    """
    Devuelve: (tipo, patron, subcarpetas)
    tipo    -> 'volumenes' | 'directo' | 'vacio'
    patron  -> string descriptivo del nombre de las subcarpetas
    """
    try:
        contenido = sorted(os.listdir(ruta_dir))
    except FileNotFoundError:
        return "vacio", "---", []

    subcarpetas = [c for c in contenido if os.path.isdir(os.path.join(ruta_dir, c))]
    archivos_img = [
        c for c in contenido
        if os.path.isfile(os.path.join(ruta_dir, c))
        and c.rsplit(".", 1)[-1].lower() in ("jpg", "jpeg", "png", "webp")
    ]

    if not subcarpetas and not archivos_img:
        return "vacio", "---", []

    if not subcarpetas and archivos_img:
        return "directo", "imgs en raiz", []

    # Hay subcarpetas -> detectar patron
    muestra = subcarpetas[0]
    if "_Chap" in muestra or "_chap" in muestra:
        patron = "Vol XX_Chap YY_Titulo"
    elif muestra.isdigit():
        patron = "Numero (caps directos)"
    else:
        patron = f'Libre: "{muestra[:20]}"'

    return "volumenes", patron, subcarpetas


def bd_estado(titulo):
    manga = Manga.objects.filter(titulo=titulo).first()
    if not manga:
        return None, 0
    return manga, manga.capitulos.count()


def get_carpetas():
    if not os.path.exists(RUTA_MANGA):
        return []
    return sorted([
        d for d in os.listdir(RUTA_MANGA)
        if os.path.isdir(os.path.join(RUTA_MANGA, d))
    ])


# ------------------- VISTAS ------------------- #
def cabecera():
    print(f"\n{W}{SEP2}")
    print(f"   DIAGNOSTICO DE MANGA  --  anime'n'chill")
    print(f"{SEP2}{NC}")


def menu_principal():
    cabecera()
    print(f"\n  {C}[1]{NC} Resumen general")
    print(f"  {C}[2]{NC} Estructura detallada (patrones de carpetas)")
    print(f"  {C}[3]{NC} Explorar manga especifico")
    print(f"  {C}[4]{NC} Estado en base de datos")
    print(f"  {C}[5]{NC} Reporte completo (todo)")
    print(f"  {C}[0]{NC} Salir")
    print(f"\n  {D}{SEP}{NC}")
    return input(f"  Opcion: ").strip()


# ─── OPCION 1: Resumen ───
def vista_resumen():
    carpetas = get_carpetas()
    resumen = {"total": len(carpetas), "en_bd": 0, "con_caps": 0,
               "sin_bd": 0, "volumenes": 0, "directo": 0, "vacio": 0}

    for t in carpetas:
        ruta = os.path.join(RUTA_MANGA, t)
        tipo, _, _ = analizar_estructura(ruta)
        manga, caps = bd_estado(t)
        resumen[tipo] += 1
        if manga:
            resumen["en_bd"] += 1
            if caps > 0:
                resumen["con_caps"] += 1
        else:
            resumen["sin_bd"] += 1

    cabecera()
    print(f"\n  {W}RESUMEN GENERAL{NC}")
    print(f"  {SEP}")
    print(f"  Total en media/Manga/     : {W}{resumen['total']}{NC}")
    print()
    print(f"  {V}En BD con capitulos       : {resumen['con_caps']}{NC}")
    print(f"  {Y}En BD sin capitulos       : {resumen['en_bd'] - resumen['con_caps']}{NC}")
    print(f"  {R}Sin registro en BD        : {resumen['sin_bd']}{NC}")
    print()
    print(f"  Estructura Vol XX_Chap YY  : {resumen['volumenes']}")
    print(f"  Estructura directa         : {resumen['directo']}")
    print(f"  Carpetas vacias            : {resumen['vacio']}")
    print(f"\n  {SEP}\n")


# ─── OPCION 2: Estructura detallada ───
def vista_estructura():
    carpetas = get_carpetas()
    cabecera()
    print(f"\n  {W}{'MANGA':<42} {'TIPO':<12} {'PATRON':<28} {'FMT':<6} {'IMGS':>5}{NC}")
    print(f"  {SEP}")

    for t in carpetas:
        ruta = os.path.join(RUTA_MANGA, t)
        tipo, patron, subs = analizar_estructura(ruta)
        fmt, total = detectar_formato(ruta)

        if tipo == "volumenes":
            ico  = f"{B}[VOL]{NC}"
            nsub = f"{D}({len(subs)} subcarpetas){NC}"
        elif tipo == "directo":
            ico  = f"{Y}[DIR]{NC}"
            nsub = ""
        else:
            ico  = f"{R}[---]{NC}"
            nsub = ""

        print(f"  {t:<42} {ico}  {patron:<28} {fmt:<6} {total:>5}  {nsub}")

    print(f"\n  {SEP}\n")


# ─── OPCION 3: Explorar manga especifico ───
def vista_explorar():
    carpetas = get_carpetas()
    cabecera()
    print(f"\n  {W}MANGAS DISPONIBLES:{NC}\n")
    for i, t in enumerate(carpetas, 1):
        print(f"  {C}[{i:>2}]{NC} {t}")
    print(f"\n  {D}{SEP}{NC}")
    sel = input("  Numero de manga (0 para cancelar): ").strip()

    if not sel.isdigit() or int(sel) == 0:
        return
    idx = int(sel) - 1
    if idx >= len(carpetas):
        print(f"  {R}Seleccion invalida.{NC}")
        return

    titulo  = carpetas[idx]
    ruta    = os.path.join(RUTA_MANGA, titulo)
    tipo, patron, subs = analizar_estructura(ruta)
    fmt, total = detectar_formato(ruta)

    print(f"\n  {W}{SEP2}{NC}")
    print(f"  {W}{titulo}{NC}")
    print(f"  {SEP}")
    print(f"  Ruta      : {D}{ruta}{NC}")
    print(f"  Estructura: {tipo}  |  Patron: {patron}")
    print(f"  Formato   : {fmt}  |  Total imagenes: {total}")

    if subs:
        print(f"\n  {W}Subcarpetas ({len(subs)} total):{NC}")
        print(f"  {D}{SEP}{NC}")
        for s in subs[:15]:
            sub_ruta = os.path.join(ruta, s)
            imgs = [
                f for f in os.listdir(sub_ruta)
                if f.rsplit(".", 1)[-1].lower() in ("jpg","jpeg","png","webp")
            ] if os.path.isdir(sub_ruta) else []
            print(f"  {D}|{NC}  {s:<50} {D}({len(imgs)} imgs){NC}")
        if len(subs) > 15:
            print(f"  {D}... y {len(subs) - 15} mas{NC}")

    manga, caps = bd_estado(titulo)
    print(f"\n  {W}Estado BD:{NC}")
    if manga:
        print(f"  {V}Registrado{NC}  |  Capitulos en BD: {caps}  |  ID: {manga.id}")
    else:
        print(f"  {R}No registrado en la base de datos{NC}")

    print(f"\n  {SEP}\n")


# ─── OPCION 4: Estado BD ───
def vista_bd():
    carpetas = get_carpetas()
    cabecera()
    print(f"\n  {W}{'MANGA':<42} {'BD':^6} {'CAPS':>6}  {'ESTADO'}{NC}")
    print(f"  {SEP}")

    for t in carpetas:
        manga, caps = bd_estado(t)
        if manga:
            if caps > 0:
                estado = f"{V}OK - {caps} capitulos{NC}"
                bd_ico = f"{V}SI{NC}"
            else:
                estado = f"{Y}En BD pero sin capitulos{NC}"
                bd_ico = f"{Y}SI{NC}"
        else:
            estado = f"{R}Sin registrar{NC}"
            bd_ico = f"{R}NO{NC}"
        print(f"  {t:<42} {bd_ico}    {caps:>4}   {estado}")

    print(f"\n  {SEP}\n")


# ─── OPCION 5: Reporte completo ───
def vista_completa():
    vista_resumen()
    input(f"  {D}Pulsa Enter para ver estructura...{NC}")
    vista_estructura()
    input(f"  {D}Pulsa Enter para ver estado BD...{NC}")
    vista_bd()


# ------------------- LOOP PRINCIPAL ------------------- #
while True:
    opcion = menu_principal()

    if   opcion == "1": vista_resumen()
    elif opcion == "2": vista_estructura()
    elif opcion == "3": vista_explorar()
    elif opcion == "4": vista_bd()
    elif opcion == "5": vista_completa()
    elif opcion == "0":
        print(f"\n  {D}Hasta luego.{NC}\n")
        break
    else:
        print(f"\n  {R}Opcion no valida.{NC}\n")

    input(f"  {D}Pulsa Enter para volver al menu...{NC}")