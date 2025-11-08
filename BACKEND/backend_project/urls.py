from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', include('dashboard.urls')),
    path('api/', include('orders.urls')),  # <-- point API to orders app
    path('inventory/', include('inventory.urls')),
    path('users/', include('users.urls')),
]
