from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.get_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('settings/', views.update_settings, name='update_settings'),
    path('change-password/', views.change_password, name='change_password'),
    path('check-username/', views.check_username, name='check_username'),
    path('check-email/', views.check_email, name='check_email'),
]
