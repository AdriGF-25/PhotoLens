"""
anime'n'chill — URLs principales
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # ------------------- ADMIN -------------------
    path("admin/", admin.site.urls),

    # ------------------- AUTH JWT -------------------
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ------------------- APPS -------------------
    path("api/anime/", include("anime.urls")),
    path("api/noticias/", include("noticias.urls")),
    path("api/usuarios/", include("usuarios.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)