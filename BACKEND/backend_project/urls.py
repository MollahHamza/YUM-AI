from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', include('dashboard.urls')),
    path('api/', include('orders.urls')),  # existing mount
    path('api/orders/', include('orders.urls')),  # docs-compatible mount
    path('inventory/', include('inventory.urls')),
    path('users/', include('users.urls')),
]
