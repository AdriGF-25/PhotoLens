from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoticiaViewSet

router = DefaultRouter()
router.register(r"noticias", NoticiaViewSet, basename="noticia")

urlpatterns = [
    path("", include(router.urls)),
]