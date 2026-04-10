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