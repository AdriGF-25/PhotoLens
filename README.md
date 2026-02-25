# PhotoLens

## 📸 Descripción del Proyecto

**PhotoLens** es una plataforma web interactiva dedicada a la fotografía y la tecnología de imagen. Ofrece a los usuarios un espacio completo para descubrir novedades fotográficas, explorar tendencias del mercado, compartir experiencias en un foro comunitario y comprar equipos fotográficos de calidad. La aplicación simula un entorno e-commerce completo con carrito de compras, gestión de perfil y sistema de noticias actualizado.

### 🎯 Objetivo
Proporcionar a fotógrafos profesionales y aficionados una plataforma centralizada para mantenerse actualizado sobre las últimas tendencias (como la Sony A7R VI), comparar y adquirir equipos fotográficos, y conectar con una comunidad de interesados.

---

## ✨ Características Principales

- **📰 Novedades y Tendencias**: Visualiza las cámaras y lentes más destacadas del momento
- **🛒 Mercado de Equipos**: Explora y compra cámaras, lentes y accesorios fotográficos
- **👥 Foro Comunitario**: Participa en discusiones sobre técnicas y experiencias fotográficas
- **👤 Perfil de Usuario**: Gestiona tu perfil, historial de compras y preferencias
- **🛍️ Carrito de Compras**: Sistema de carrito con checkout simulado
- **📱 Diseño Responsivo**: Experiencia optimizada para móvil, tablet y escritorio

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (Vanilla)** - Interactividad y lógica cliente

### Backend
- **Python** - Desarrollo de API REST
- **Framework**: Flask/Django (especificar según corresponda)

### Base de Datos
- **MariaDB** - Almacenamiento de datos

### Herramientas
- **Git** - Control de versiones
- **GitHub** - Repositorio remoto

---

## 📋 Requisitos

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
- **Navegador**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **SO Servidor**: Linux/Windows Server 2019+
- **Python**: 3.9+
- **MariaDB**: 10.5+

### Software Recomendado
- **Navegador**: Latest versión de Chrome/Firefox
- **SO Servidor**: Ubuntu 20.04 LTS o Windows Server 2022
- **Python**: 3.11+
- **MariaDB**: 10.11+
- **IDE**: VS Code con extensiones Python

---

## 🚀 Instalación y Setup

### 1. Clonar el Repositorio
```bash
git clone git@github.com:AdriGF-25/PhotoLens.git
cd PhotoLens
```

### 2. Configurar Frontend
```bash
# No requiere instalación especial
# Los archivos HTML, CSS y JS están listos para usar
```

### 3. Configurar Backend (Python)
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 4. Configurar Base de Datos
```bash
# Crear base de datos MariaDB
mysql -u root -p < database/photolens.sql

# O mediante gestor visual (phpMyAdmin)
```

### 5. Ejecutar la Aplicación
```bash
# Terminal 1 - Backend
python app.py

# Terminal 2 - Frontend (abrir en navegador)
# http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
PhotoLens/
├── front-end/
│   ├── header/
│   │   ├── header.html
│   │   └── header.css
│   ├── footer/
│   │   ├── footer.html
│   │   └── footer.css
│   ├── imagenes/
│   │   └── (assets gráficos)
│   └── paginasPrincipales/
│       ├── novedades/
│       │   ├── novedades.html
│       │   └── novedades.css
│       ├── mercado/
│       │   ├── mercado.html
│       │   └── mercado.css
│       ├── foros/
│       │   ├── foros.html
│       │   └── foros.css
│       ├── perfil/
│       │   ├── perfil.html
│       │   └── perfil.css
│       └── carrito/
│           ├── carrito.html
│           └── carrito.css
├── back-end/
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   ├── api/
│   │   ├── routes.py
│   │   └── handlers/
│   └── database/
│       └── models.py
├── database/
│   └── photolens.sql
└── README.md
```

---

## 🔌 API REST Endpoint (Ejemplo)

### Obtener Novedades
```
GET /api/novedades
Response: {
  "status": "success",
  "data": [
    {
      "id": 1,
      "titulo": "Sony A7R VI",
      "descripcion": "Cámara de 100MP",
      "imagen": "sony-a7r-vi.webp"
    }
  ]
}
```

### Obtener Productos del Mercado
```
GET /api/mercado
Response: {
  "status": "success",
  "data": [
    {
      "id": 1,
      "nombre": "Canon EOS R7",
      "precio": 1500,
      "categoria": "camaras"
    }
  ]
}
```

---

## 📖 Documentación Adicional

- **Memoria del Proyecto**: `docs/memoria.pdf`
- **Diagramas**: `docs/diagramas/`
- **Guía de Desarrollo**: `docs/DEVELOPMENT.md`

---

## 👨‍💻 Autor

**Adrián Gómez F.**
- Email: agomezf24@fpcoruna.afundacion.org
- GitHub: [@AdriGF-25](https://github.com/AdriGF-25)

---

## 📄 Licencia

Este proyecto es parte de un ciclo formativo en Desarrollo de Aplicaciones Web.

---

## 📧 Contacto y Soporte

Para reportar bugs o sugerencias, abre un [issue en GitHub](https://github.com/AdriGF-25/PhotoLens/issues).

