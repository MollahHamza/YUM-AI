from django.db import models

# Create your models here.

class Order(models.Model):
    # create fields here
    number = models.CharField(max_length=20, unique=True, null=True, blank=True)   
    customer = models.CharField(max_length=100, null=True, blank=True)              
    date = models.DateField(null=True, blank=True)                                 
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)              

    def __str__(self):
        return f"Order {self.number or self.id} - {self.customer or 'Unknown'}" 
    