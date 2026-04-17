"""
anime'n'chill — URLs de la app anime
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GeneroViewSet, MangaViewSet, AnimeViewSet,
    CapituloViewSet, EpisodioViewSet, FavoritoViewSet
)

# ------------------- ROUTER -------------------
router = DefaultRouter()
router.register(r"generos",   GeneroViewSet,   basename="genero")
router.register(r"mangas",    MangaViewSet,    basename="manga")
router.register(r"animes",    AnimeViewSet,    basename="anime")
router.register(r"capitulos", CapituloViewSet, basename="capitulo")
router.register(r"episodios", EpisodioViewSet, basename="episodio")
router.register(r"favoritos", FavoritoViewSet, basename="favorito")

urlpatterns = [
    path("", include(router.urls)),
]