from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'quantity', 'unit', 'status', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'category']