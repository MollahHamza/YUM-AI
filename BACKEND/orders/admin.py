from django.contrib import admin
from .models import MenuItem, Order, OrderItem, BillingHistory

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'created_at']
    list_filter = ['category']
    search_fields = ['name', 'category']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['price', 'subtotal']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'total', 'order_date']  
    list_filter = ['order_date'] 
    search_fields = ['order_number', 'customer_name']
    inlines = [OrderItemInline]
    readonly_fields = ['total']

@admin.register(BillingHistory)
class BillingHistoryAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'total_amount', 'order_date']  
    search_fields = ['order_number', 'customer_name']
