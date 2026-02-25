# PhotoLens

## Descripción del Proyecto

PhotoLens es una plataforma web interactiva dedicada a la fotografía (Proyecto Intermodular - Tipo 2). Permite a los usuarios explorar novedades, tendencias, mercado de equipos, participar en foros y gestionar compras. La arquitectura sigue el modelo Tipo 2: Frontend HTML/CSS/JavaScript consumiendo una API REST propia desarrollada con Python.

## Características Principales

- Novedades y Tendencias
- Mercado de Equipos
- Foro Comunitario
- Perfil de Usuario
- Carrito de Compras
- Diseño Responsivo

---

## Tecnologías Utilizadas

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python 3.9+

### Base de Datos
- MariaDB

### Herramientas
- Git
- GitHub

---

## Decisiones Técnicas

Se ha elegido Python como framework backend, en lugar de PHP, como aprendizaje adicional y reto profesional. Esta decisión se justifica por:

- Versatilidad: Python permite construir APIs REST modernas y escalables de forma simple
- Transferencia de conocimientos: Habilidades aplicables a proyectos profesionales actuales
- Cumplimiento de especificaciones: Satisface completamente los requisitos del Tipo 2 (API REST propia + BD propia)
- Modernidad: Python es ampliamente utilizado en desarrollo web contemporáneo

---

## Requisitos

### Hardware Mínimos
- Procesador: Intel Core i5 o equivalente
- RAM: 4 GB
- Almacenamiento: 500 MB disponibles
- Conexión: Internet (mínimo 1 Mbps)

### Hardware Recomendado
- Procesador: Intel Core i7 o equivalente
- RAM: 8 GB
- Almacenamiento: 1 GB disponibles
- Conexión: Internet (mínimo 5 Mbps)

### Software Mínimo
- Navegador: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- SO Servidor: Linux/Windows Server 2019+
- Python: 3.9+
- MariaDB: 10.5+

### Software Recomendado
- Navegador: Latest versión de Chrome/Firefox
- SO Servidor: Ubuntu 20.04 LTS o Windows Server 2022
- Python: 3.11+
- MariaDB: 10.11+
- IDE: VS Code

---

## Instalación y Setup

### 1. Clonar el Repositorio
```bash
git clone git@github.com:AdriGF-25/PhotoLens.git
cd PhotoLens
```

### 2. Configurar Frontend
Los archivos HTML, CSS y JS están listos para usar.

### 3. Configurar Backend (Python)
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configurar Base de Datos
```bash
mysql -u root -p < database/photolens.sql
```

### 5. Ejecutar la Aplicación
```bash
python app.py
```

---

## Estructura del Proyecto

```
PhotoLens/
├── front-end/
│   ├── header/
│   ├── footer/
│   ├── imagenes/
│   └── paginasPrincipales/
│       ├── novedades/
│       ├── mercado/
│       ├── foros/
│       ├── perfil/
│       └── carrito/
├── back-end/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── api/
│   └── database/
├── database/
│   └── photolens.sql
└── README.md
```

---

## API REST Endpoint (Ejemplo)

### Obtener Novedades
```
GET /api/novedades
```

### Obtener Productos del Mercado
```
GET /api/mercado
```

---

## Documentación Adicional

- Memoria del Proyecto: docs/memoria.pdf
- Diagramas: docs/diagramas/
- Guía de Desarrollo: docs/DEVELOPMENT.md

---

## Autor

Adrián Gómez F.
- Email: agomezf24@fpcoruna.afundacion.org
- GitHub: @AdriGF-25

---

## Licencia

Este proyecto es parte de un ciclo formativo en Desarrollo de Aplicaciones Web.
