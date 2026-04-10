# /* -------- ROUTER DRF -------- */
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, ProductoViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = router.urls