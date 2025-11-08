# dashboard/serializers.py
from rest_framework import serializers

class DashboardStatsSerializer(serializers.Serializer):
    total_sales_today = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_inventory_items = serializers.IntegerField()
