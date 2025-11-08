# orders/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, OrderViewSet, BillingHistoryViewSet, pay_order

router = DefaultRouter()
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'billing-history', BillingHistoryViewSet, basename='billinghistory')

urlpatterns = [
    path('', include(router.urls)),
    path('pay-order/', pay_order, name='pay-order'),
]