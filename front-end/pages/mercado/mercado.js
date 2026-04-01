// mercado.js - Carga dinámica de productos desde Django API
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productos-grid');
    
    // Mostrar loading inicial
    grid.innerHTML = '<div class="loading">Cargando productos...</div>';
    
    try {
        const response = await fetch('http://127.0.0.1:8000/productos/');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const productos = await response.json();
        
        // Generar HTML dinámico conservando tu CSS
        grid.innerHTML = productos.map(producto => `
            <article class="producto">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}" 
                     loading="lazy"
                     onerror="this.src='../../imagenes/fallback-producto.png'">
                <h2>${producto.nombre}</h2>
                <p class="precio">${parseFloat(producto.precio).toLocaleString('es-ES')} €</p>
                <p class="detalle">${producto.descripcion}</p>
                <a class="boton-carrito" href="../../carrito/index.html" 
                   data-producto-id="${producto.id}">
                    Añadir al carrito
                </a>
            </article>
        `).join('');
        
        console.log(`${productos.length} productos cargados desde API`);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        grid.innerHTML = `
            <div class="error-mensajes">
                <h3>ERROR al cargar productos</h3>
                <p>Verifica que Django esté ejecutándose:</p>
                <code>python manage.py runserver</code>
                <br><small>API: <a href="http://127.0.0.1:8000/productos/" target="_blank">/productos/</a></small>
            </div>
        `;
    }
});