from rest_framework import serializers
from .models import MenuItem, Order, OrderItem, BillingHistory
from django.utils import timezone
from decimal import Decimal

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderItemCreateSerializer(serializers.ModelSerializer):
    menu_item = serializers.PrimaryKeyRelatedField(queryset=MenuItem.objects.all())

    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity']

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_category = serializers.CharField(source='menu_item.category', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'menu_item_category', 'quantity', 'price', 'subtotal']
        read_only_fields = ['price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True)  # accept input for items only
    order_number = serializers.CharField(read_only=True)  # automatically generated
    order_date = serializers.DateTimeField(read_only=True)  # automatically set
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)  # calculated

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'order_number', 'order_date', 'total', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # auto-generate order number using timestamp + temporary ID
        order = Order.objects.create(
            order_date=timezone.now(),
            **validated_data
        )
        order.order_number = f"ORD-{order.id}"  # use DB id for unique order number

        total = Decimal('0.00')
        for item_data in items_data:
            menu_item = item_data['menu_item']
            quantity = item_data.get('quantity', 1)
            order_item = OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity
            )
            total += order_item.subtotal

        order.total = total
        order.save()
        return order

class BillingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingHistory
        fields = '__all__'
