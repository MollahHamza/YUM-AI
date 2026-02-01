from rest_framework import serializers
from .models import MenuItem, Order, OrderItem, BillingHistory
from django.utils import timezone
from decimal import Decimal


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'name', 'price', 'category', 'created_at']
        read_only_fields = ['id', 'created_at']


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
    items = OrderItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(read_only=True)
    order_date = serializers.DateTimeField(read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'order_number', 'order_date', 'total', 'items']
        read_only_fields = ['id', 'order_number', 'order_date', 'total']


class BillingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingHistory
        fields = ['id', 'order_number', 'customer_name', 'total_amount', 'order_date', 'items_summary']
        read_only_fields = ['id']
