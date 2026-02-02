from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from orders.models import Order, BillingHistory
from inventory.models import InventoryItem


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    today = timezone.now().date()

    # Current (unpaid) orders created today for this user
    todays_orders = Order.objects.filter(user=request.user, order_date__date=today)
    pending_orders_count = todays_orders.count()
    pending_sales = sum([o.total for o in todays_orders]) if todays_orders else Decimal('0.00')

    # Paid orders (billing history) from today for this user
    todays_billing = BillingHistory.objects.filter(user=request.user, order_date__date=today)
    paid_orders_count = todays_billing.count()
    paid_sales = sum([b.total_amount for b in todays_billing]) if todays_billing else Decimal('0.00')

    # Combine both for totals
    total_orders_today = pending_orders_count + paid_orders_count
    total_sales_today = pending_sales + paid_sales

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
