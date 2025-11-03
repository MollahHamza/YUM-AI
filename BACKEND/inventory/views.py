from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import InventoryItem
from .serializers import InventoryItemSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']
    
    def get_queryset(self):
        """Filter by category if provided in query params"""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        
        if category:
            queryset = queryset.filter(category__iexact=category)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get inventory statistics"""
        total_items = InventoryItem.objects.count()
        low_stock_items = InventoryItem.objects.filter(quantity__lt=5).count()
        categories = InventoryItem.objects.values('category').distinct().count()
        
        return Response({
            'total_items': total_items,
            'low_stock_items': low_stock_items,
            'categories': categories
        })
    
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get only low stock items"""
        low_stock_items = InventoryItem.objects.filter(quantity__lt=5)
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)