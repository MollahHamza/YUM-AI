

from django.contrib import admin
from django.urls import path,include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('dashboard.urls')),
    path('api/', include('api.urls')),
    path('billing/', include('orders.urls')),
    path('inventory/', include('inventory.urls')),
    path('users/', include('users.urls')),
]
