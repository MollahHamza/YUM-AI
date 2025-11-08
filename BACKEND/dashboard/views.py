from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from orders.models import Order
from inventory.models import InventoryItem

@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now().date()

    # Orders created today
    todays_orders = Order.objects.filter(order_date__date=today)
    total_orders_today = todays_orders.count()

    # Total sales today
    total_sales_today = sum([o.total for o in todays_orders]) if todays_orders else Decimal('0.00')

    # Total inventory items
    total_inventory_items = InventoryItem.objects.count()

    return Response({
        "total_sales_today": float(total_sales_today),
        "total_orders_today": total_orders_today,
        "total_inventory_items": total_inventory_items
    })
