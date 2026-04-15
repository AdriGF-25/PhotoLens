# /* -------- ROUTER DRF + JWT + GOOGLE AUTH -------- */
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

from .views import (
    UsuarioViewSet,
    ProductoViewSet,
    google_login,
    google_callback
)

# Router DRF
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    # /* -------- ENDPOINTS DRF -------- */
    path('', include(router.urls)),

    # /* -------- JWT AUTH -------- */
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # /* -------- GOOGLE AUTH -------- */
    path('auth/google/login/', google_login, name='google_login'),
    path('auth/google/callback/', google_callback, name='google_callback'),
]