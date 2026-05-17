"""
anime'n'chill — URLs de la app anime (solo Manga)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GeneroViewSet, MangaViewSet, CapituloViewSet, FavoritoViewSet


# ------------------- ROUTER ------------------- #
router = DefaultRouter()
router.register(r"generos",   GeneroViewSet,   basename="genero")
router.register(r"mangas",    MangaViewSet,    basename="manga")
router.register(r"capitulos", CapituloViewSet, basename="capitulo")
router.register(r"favoritos", FavoritoViewSet, basename="favorito")

urlpatterns = [
    path("", include(router.urls)),
]