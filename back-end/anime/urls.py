"""
anime'n'chill — URLs de la app anime (solo Manga)
"""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneroViewSet, MangaViewSet, CapituloViewSet, FavoritoViewSet

router = DefaultRouter()
router.register(r"generos", GeneroViewSet, basename="genero")
router.register(r"mangas", MangaViewSet, basename="manga")
router.register(r"capitulos", CapituloViewSet, basename="capitulo")
router.register(r"favoritos", FavoritoViewSet, basename="favorito")

urlpatterns = [
    path("", include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)