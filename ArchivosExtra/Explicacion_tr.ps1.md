---

## Herramientas de desarrollo

### tr.ps1 — Generador de árbol de archivos

Script PowerShell que genera un árbol ASCII del proyecto y lo guarda en `structure.txt`.
Útil para documentar la estructura actual antes de cada entrega o commit importante.

**Uso básico** — genera el árbol sin archivos `.jpg`:
```powershell
.\tr.ps1
```

**Uso con archivos** — incluye todos los archivos (flag `-f`):
```powershell
.\tr.ps1 -f
```

**Parámetros disponibles:**

| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| `-Ruta` | Directorio raíz desde el que generar el árbol | `.` (directorio actual) |
| `-Salida` | Ruta del archivo de salida | `structure.txt` junto al script |
| `-ExcluirDirectorios` | Directorios a ignorar | `.venv`, `__pycache__`, `.vscode`, `.git` |
| `-f` | Si se pasa, incluye archivos `.jpg` en el árbol | No incluye `.jpg` por defecto |

**Ejemplos:**
```powershell
# Árbol desde una subcarpeta
.\tr.ps1 -Ruta .\back-end\

# Árbol con nombre de salida personalizado
.\tr.ps1 -Salida .\ArchivosExtra\estructura_backEnd.txt -Ruta .\back-end\

# Añadir más directorios a excluir
.\tr.ps1 -ExcluirDirectorios @(".venv", "__pycache__", ".git", "media", "migrations")
```

> El archivo `structure.txt` generado se usa como referencia de la estructura del proyecto
> y se mantiene actualizado en el repositorio.