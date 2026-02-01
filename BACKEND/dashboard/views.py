from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from orders.models import Order
from inventory.models import InventoryItem


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = timezone.now().date()

    # Orders created today for this user only
    todays_orders = Order.objects.filter(user=request.user, order_date__date=today)
    total_orders_today = todays_orders.count()

    # Total sales today for this user
    total_sales_today = sum([o.total for o in todays_orders]) if todays_orders else Decimal('0.00')

    # Total inventory items for this user
    total_inventory_items = InventoryItem.objects.filter(user=request.user).count()

    # Low stock items count
    low_stock_count = InventoryItem.objects.filter(user=request.user, quantity__lt=5).count()

    return Response({
        "total_sales_today": float(total_sales_today),
        "total_orders_today": total_orders_today,
        "total_inventory_items": total_inventory_items,
        "low_stock_count": low_stock_count
    })
