from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from orders.models import Order, BillingHistory
from inventory.models import InventoryItem
from orders.serializers import OrderSerializer
from inventory.serializers import InventoryItemSerializer
from django.utils import timezone


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_data(request):
    """Get all orders and inventory items for the logged-in user."""
    orders = Order.objects.filter(user=request.user)
    items = InventoryItem.objects.filter(user=request.user)

    orders_serialized = OrderSerializer(orders, many=True).data
    items_serialized = InventoryItemSerializer(items, many=True).data

    return Response({
        "orders": orders_serialized,
        "items": items_serialized
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_order(request):
    """Process payment for orders (legacy endpoint)."""
    order_ids = request.data.get('order_ids', [])
    total_amount = 0
    customer_name = "Unknown"

    for oid in order_ids:
        order = get_object_or_404(Order, id=oid, user=request.user)
        total_amount += order.total
        customer_name = order.customer_name
        order.delete()

    billing = BillingHistory.objects.create(
        user=request.user,
        order_number=f"INV-{timezone.now().strftime('%Y%m%d%H%M%S')}",
        customer_name=customer_name,
        total_amount=total_amount,
        order_date=timezone.now()
    )

    return Response({"message": "Payment successful", "billing_id": billing.id})
