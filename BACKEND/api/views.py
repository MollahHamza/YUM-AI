from rest_framework.decorators import api_view
from rest_framework.response import Response
from orders.models import Order
from inventory.models import InventoryItem
from orders.serializers import OrderSerializer
from inventory.serializers import InventoryItemSerializer
from .models import Order, BillingHistory
from django.utils import timezone


@api_view(['GET'])
def get_all_data(request):
    orders = Order.objects.all()
    items = Item.objects.all()
    
    orders_serialized = OrderSerializer(orders, many=True).data
    items_serialized = InventoryItemSerializer(items, many=True).data
    
    return Response({
        "orders": orders_serialized,
        "items": items_serialized
    })


@api_view(['POST'])
def pay_order(request):
    # Assuming you send a list of order IDs in request.data['order_ids']
    order_ids = request.data.get('order_ids', [])
    total_amount = 0
    customer_name = "Unknown"

    for oid in order_ids:
        order = get_object_or_404(Order, id=oid)
        total_amount += order.total
        customer_name = order.customer_name  # assuming same customer for all orders
        order.delete()  # clear current order after payment

    billing = BillingHistory.objects.create(
        order_number=f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        customer_name=customer_name,
        total_amount=total_amount,
        status="Paid",
        order_date=timezone.now()
    )

    return Response({"message": "Payment successful", "billing_id": billing.id})
