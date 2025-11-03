from rest_framework import serializers
from .models import InventoryItem

class InventoryItemSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'category', 'quantity', 'unit', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']