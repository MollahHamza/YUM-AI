from django.db import models

# Create your models here.

class Item(models.Model):
    # create fields here
    name = models.CharField(max_length=100, null=True, blank=True)             
    category = models.CharField(max_length=50, blank=True, null=True)  
    quantity = models.IntegerField(default=0, null=True, blank=True)          
    unit = models.CharField(max_length=20, blank=True, null=True)      
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) 

    def __str__(self):
        return self.name or f"Item {self.id}"