from django.db import models
from django.contrib.auth.models import User


class InventoryItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory_items')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    quantity = models.FloatField()
    unit = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def status(self):
        return "Low Stock" if self.quantity < 5 else "In Stock"

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']
