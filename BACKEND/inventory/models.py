from django.db import models

class InventoryItem(models.Model):
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
        return self.name
    
    class Meta:
        ordering = ['-created_at']