from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistroView, UsuarioViewSet

router = DefaultRouter()
router.register(r"usuarios", UsuarioViewSet, basename="usuario")

urlpatterns = [
    path("registro/", RegistroView.as_view(), name="registro"),
    path("", include(router.urls)),
]