import requests
from urllib.parse import urlencode
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Usuario, Producto
from .serializers import UsuarioSerializer, ProductoSerializer


class UsuarioViewSet(ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer


class ProductoViewSet(ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = '__all__'
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['precio', 'id']
    ordering = ['-id']
    
    @action(detail=True, methods=['post'])
    def favorito(self, request, pk=None):
        return Response({"mensaje": "Añadido a favoritos"})


# -------- GOOGLE AUTH --------
def google_login(request):
    params = {
        'response_type': 'code',
        'client_id': settings.GOOGLE_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_REDIRECT_URI,
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent',
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return HttpResponseRedirect(url)


def google_callback(request):
    code = request.GET.get('code')
    if not code:
        return JsonResponse({'error': 'No se recibió código de Google'}, status=400)

    # 1. Intercambiar código por token de Google
    token_res = requests.post(
        'https://oauth2.googleapis.com/token',
        data={
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
    )
    
    if token_res.status_code != 200:
        return JsonResponse({'error': 'Fallo al obtener token de Google'}, status=400)

    access_token = token_res.json().get('access_token')

    # 2. Obtener datos del perfil de Google
    profile_res = requests.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    if profile_res.status_code != 200:
        return JsonResponse({'error': 'Fallo al obtener perfil de usuario'}, status=400)

    profile = profile_res.json()
    email = profile.get('email')
    first_name = profile.get('given_name', '')
    last_name = profile.get('family_name', '')

    # 3. Buscar o crear el usuario en Django
    user, created = User.objects.get_or_create(username=email, defaults={
        'email': email,
        'first_name': first_name,
        'last_name': last_name
    })

    # 4. Generar token JWT de tu propia API
    refresh = RefreshToken.for_user(user)
    jwt_token = str(refresh.access_token)

    # 5. Redirigir al frontend (Ojo: asegúrate de que el Live Server está en el 5500)
    frontend_url = f"http://127.0.0.1:5500/front-end/index.html?token={jwt_token}"
    return HttpResponseRedirect(frontend_url)