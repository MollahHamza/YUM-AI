from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
import json
from decimal import Decimal
from .models import MenuItem, Order, OrderItem, BillingHistory
from .serializers import MenuItemSerializer, OrderSerializer, OrderItemSerializer, BillingHistorySerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-order_date')
    serializer_class = OrderSerializer

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """
        Create a new order with multiple items (menu_item_id + quantity).
        Automatically calculates subtotal and total.
        """
        customer_name = request.data.get('customer_name', 'Unknown')
        items_data = request.data.get('items', [])

        if not isinstance(items_data, list) or len(items_data) == 0:
            return Response({"error": "Items must be a non-empty list."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                order_number = f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}"
                order = Order.objects.create(
                    customer_name=customer_name,
                    order_number=order_number,
                    order_date=timezone.now()
                )

                total = Decimal('0.00')

                for item_data in items_data:
                    menu_item_id = item_data.get('menu_item_id')
                    quantity = int(item_data.get('quantity', 1))

                    if not menu_item_id:
                        return Response({"error": "Each item must have menu_item_id."}, status=status.HTTP_400_BAD_REQUEST)

                    menu_item = get_object_or_404(MenuItem, id=menu_item_id)
                    subtotal = menu_item.price * quantity

                    OrderItem.objects.create(
                        order=order,
                        menu_item=menu_item,
                        quantity=quantity,
                        price=menu_item.price,
                        subtotal=subtotal
                    )

                    total += subtotal

                order.total = total
                order.save()

                # Return order with nested items
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def pay_order(request):
    order_id = request.data.get('order_id')

    if not order_id:
        return Response({"error": "Order ID is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = get_object_or_404(Order, id=order_id)

        items_summary = [
            {
                'name': item.menu_item.name,
                'quantity': item.quantity,
                'price': float(item.price),
                'subtotal': float(item.subtotal)
            }
            for item in order.items.all()
        ]

        billing = BillingHistory.objects.create(
            order_number=order.order_number,
            customer_name=order.customer_name,
            total_amount=order.total,
            order_date=order.order_date,
            items_summary=json.dumps(items_summary)
        )

        return Response({
            "message": "Payment successful",
            "billing_id": billing.id,
            "order_number": billing.order_number,
            "total_amount": float(billing.total_amount)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BillingHistoryViewSet(viewsets.ModelViewSet):
    queryset = BillingHistory.objects.all().order_by('-order_date')
    serializer_class = BillingHistorySerializer

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        billing = self.get_object()
        try:
            items = json.loads(billing.items_summary)
            return Response({"items": items})
        except:
            return Response({"items": []})
