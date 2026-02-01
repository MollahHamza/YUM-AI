from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """Extended user profile with additional fields for restaurant management."""

    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
        ('viewer', 'Viewer'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    restaurant_name = models.CharField(max_length=200, blank=True, default='My Restaurant')
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='staff')
    avatar_initials = models.CharField(max_length=2, blank=True)

    # Settings/Preferences
    theme = models.CharField(max_length=20, default='light')  # light/dark
    currency = models.CharField(max_length=10, default='USD')
    language = models.CharField(max_length=10, default='en')
    notifications_enabled = models.BooleanField(default=True)
    low_stock_threshold = models.IntegerField(default=5)

    # AI Settings
    ai_model = models.CharField(max_length=50, default='gemini-2.0-flash')
    gemini_api_key = models.CharField(max_length=100, blank=True)  # Per-user API key (optional)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def save(self, *args, **kwargs):
        # Auto-generate avatar initials from username or name
        if not self.avatar_initials:
            if self.user.first_name and self.user.last_name:
                self.avatar_initials = f"{self.user.first_name[0]}{self.user.last_name[0]}".upper()
            else:
                self.avatar_initials = self.user.username[:2].upper()
        super().save(*args, **kwargs)


class UserSettings(models.Model):
    """Global application settings (for admin users)."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='app_settings')

    # Restaurant Info
    restaurant_address = models.TextField(blank=True)
    restaurant_phone = models.CharField(max_length=20, blank=True)
    restaurant_email = models.EmailField(blank=True)
    business_hours = models.TextField(blank=True)  # JSON string

    # Tax & Billing
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    default_tip_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=15.00)
    receipt_footer = models.TextField(blank=True, default='Thank you for your business!')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s settings"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create profile when user is created."""
    if created:
        UserProfile.objects.create(user=instance)
        UserSettings.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Auto-save profile when user is saved."""
    if hasattr(instance, 'profile'):
        instance.profile.save()
    if hasattr(instance, 'app_settings'):
        instance.app_settings.save()
