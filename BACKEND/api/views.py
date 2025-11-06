from rest_framework.decorators import api_view
from rest_framework.response import Response
from orders.models import Order
from inventory.models import Item
from orders.serializers import OrderSerializer
from inventory.serializers import ItemSerializer


@api_view(['GET'])
def get_all_data(request):
    orders = Order.objects.all()
    items = Item.objects.all()
    
    orders_serialized = OrderSerializer(orders, many=True).data
    items_serialized = ItemSerializer(items, many=True).data
    
    return Response({
        "orders": orders_serialized,
        "items": items_serialized
    })

