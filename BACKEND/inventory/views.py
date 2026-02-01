from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']

    def get_queryset(self):
        """Filter by user and optionally by category"""
        queryset = InventoryItem.objects.filter(user=self.request.user)
        category = self.request.query_params.get('category', None)

        if category:
            queryset = queryset.filter(category__iexact=category)

        return queryset

    def perform_create(self, serializer):
        """Automatically assign the logged-in user"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get inventory statistics for the current user"""
        user_items = InventoryItem.objects.filter(user=request.user)
        total_items = user_items.count()
        low_stock_items = user_items.filter(quantity__lt=5).count()
        categories = user_items.values('category').distinct().count()

        return Response({
            'total_items': total_items,
            'low_stock_items': low_stock_items,
            'categories': categories
        })

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """Get only low stock items for the current user"""
        low_stock_items = InventoryItem.objects.filter(user=request.user, quantity__lt=5)
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)
