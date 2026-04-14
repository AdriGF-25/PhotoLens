function getBasePath() {
  var headerContainer = document.getElementById('header-container');

  if (!headerContainer) {
    return './';
  }

  return headerContainer.getAttribute('data-base') || './';
}

function loadHeader() {
  var headerContainer = document.getElementById('header-container');
  var basePath = getBasePath();

  if (!headerContainer) return;

  fetch(basePath + 'header/header.html')
    .then(function (response) {
      if (!response.ok) {
        throw new Error('No se pudo cargar header.html');
      }

      return response.text();
    })
    .then(function (html) {
      headerContainer.innerHTML = html;
      updateHeaderPaths(basePath);
      renderAuth(basePath);
      markActiveLink();
    })
    .catch(function (error) {
      console.error('Error al cargar el header:', error);
    });
}

function updateHeaderPaths(basePath) {
  var logoLink = document.getElementById('logoLink');
  var logoImage = document.getElementById('logoImage');

  var navNovedades = document.getElementById('navNovedades');
  var navMercado = document.getElementById('navMercado');
  var navForos = document.getElementById('navForos');

  var navNovedadesMobile = document.getElementById('navNovedadesMobile');
  var navMercadoMobile = document.getElementById('navMercadoMobile');
  var navForosMobile = document.getElementById('navForosMobile');

  if (logoLink) {
    logoLink.href = basePath + 'index.html';
  }

  if (logoImage) {
    logoImage.src = basePath + 'imagenes/Logo_PhotoLens.png';
  }

  if (navNovedades) {
    navNovedades.href = basePath + 'pages/novedades/index.html';
  }

  if (navMercado) {
    navMercado.href = basePath + 'pages/mercado/index.html';
  }

  if (navForos) {
    navForos.href = basePath + 'pages/foros/index.html';
  }

  if (navNovedadesMobile) {
    navNovedadesMobile.href = basePath + 'pages/novedades/index.html';
  }

  if (navMercadoMobile) {
    navMercadoMobile.href = basePath + 'pages/mercado/index.html';
  }

  if (navForosMobile) {
    navForosMobile.href = basePath + 'pages/foros/index.html';
  }
}

function logout() {
  var basePath = getBasePath();

  localStorage.removeItem('userToken');
  sessionStorage.removeItem('userToken');
  window.location.href = basePath + 'pages/login/login.html';
}

function renderAuth(basePath) {
  var navAuth = document.getElementById('navAuth');
  var token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  if (!navAuth) return;

  if (token) {
    navAuth.innerHTML = `
      <a href="${basePath}pages/perfil/index.html" class="btn-perfil">Perfil</a>
      <button type="button" class="btn-logout" id="logoutButton">Salir</button>
    `;

    var logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
  } else {
    navAuth.innerHTML = `
      <a href="${basePath}pages/login/login.html" class="btn-login">Login</a>
    `;
  }
}

function markActiveLink() {
  var currentPath = window.location.pathname;

  var navNovedades = document.getElementById('navNovedades');
  var navMercado = document.getElementById('navMercado');
  var navForos = document.getElementById('navForos');

  var navNovedadesMobile = document.getElementById('navNovedadesMobile');
  var navMercadoMobile = document.getElementById('navMercadoMobile');
  var navForosMobile = document.getElementById('navForosMobile');

  if (currentPath.includes('/novedades/')) {
    if (navNovedades) navNovedades.classList.add('activo');
    if (navNovedadesMobile) navNovedadesMobile.classList.add('activo');
  }

  if (currentPath.includes('/mercado/')) {
    if (navMercado) navMercado.classList.add('activo');
    if (navMercadoMobile) navMercadoMobile.classList.add('activo');
  }

  if (currentPath.includes('/foros/')) {
    if (navForos) navForos.classList.add('activo');
    if (navForosMobile) navForosMobile.classList.add('activo');
  }
}

document.addEventListener('DOMContentLoaded', loadHeader);