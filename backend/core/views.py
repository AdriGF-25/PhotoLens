from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Usuario, Producto
from .serializers import UsuarioSerializer, ProductoSerializer


@api_view(['GET'])
def obtener_usuarios(request):
    usuarios = Usuario.objects.all()
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def obtener_productos(request):
    productos = Producto.objects.all()
    serializer = ProductoSerializer(productos, many=True)
    return Response(serializer.data)