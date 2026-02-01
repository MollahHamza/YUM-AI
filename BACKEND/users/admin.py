from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, UserSettings


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserSettingsInline(admin.StackedInline):
    model = UserSettings
    can_delete = False
    verbose_name_plural = 'Settings'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline, UserSettingsInline)


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant_name', 'role', 'phone', 'theme', 'created_at']
    list_filter = ['role', 'theme', 'currency']
    search_fields = ['user__username', 'user__email', 'restaurant_name', 'phone']


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ['user', 'tax_rate', 'default_tip_percentage', 'created_at']
    search_fields = ['user__username', 'restaurant_email']
