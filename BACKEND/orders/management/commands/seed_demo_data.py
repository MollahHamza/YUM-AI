from django.core.management.base import BaseCommand
from django.utils import timezone
from decimal import Decimal
import json

from orders.models import MenuItem, Order, OrderItem, BillingHistory
from inventory.models import InventoryItem


class Command(BaseCommand):
    help = "Seed demo data for menu items, inventory, sample orders, and billing history"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding demo data..."))

        menu_seed = [
            {"name": "Cheeseburger", "price": Decimal("8.99"), "category": "Burgers"},
            {"name": "Chicken Sandwich", "price": Decimal("7.99"), "category": "Sandwiches"},
            {"name": "Caesar Salad", "price": Decimal("6.99"), "category": "Salads"},
            {"name": "French Fries", "price": Decimal("3.99"), "category": "Sides"},
            {"name": "Onion Rings", "price": Decimal("4.99"), "category": "Sides"},
            {"name": "Soda", "price": Decimal("1.99"), "category": "Drinks"},
            {"name": "Milkshake", "price": Decimal("4.99"), "category": "Drinks"},
            {"name": "Pizza", "price": Decimal("12.99"), "category": "Main"},
            {"name": "Pasta", "price": Decimal("10.99"), "category": "Main"},
        ]

        for m in menu_seed:
            obj, created = MenuItem.objects.get_or_create(name=m["name"], defaults=m)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created MenuItem: {obj.name}"))

        inventory_seed = [
            {"name": "Tomatoes", "category": "Vegetables", "quantity": 50, "unit": "kg"},
            {"name": "Lettuce", "category": "Vegetables", "quantity": 30, "unit": "kg"},
            {"name": "Cheese", "category": "Dairy", "quantity": 5, "unit": "kg"},
            {"name": "Chicken Breast", "category": "Meat", "quantity": 15, "unit": "kg"},
            {"name": "Buns", "category": "Bread", "quantity": 80, "unit": "pcs"},
        ]

        for i in inventory_seed:
            obj, created = InventoryItem.objects.get_or_create(name=i["name"], defaults=i)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created InventoryItem: {obj.name}"))

        # Only create sample order if none exists
        if not Order.objects.exists():
            self.stdout.write("Creating sample orders and billing...")
            menu = list(MenuItem.objects.all())
            if len(menu) >= 3:
                # First order
                order_number = f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}"
                order = Order.objects.create(
                    customer_name="Alice Johnson",
                    order_number=order_number,
                    order_date=timezone.now(),
                    total=Decimal('0.00')
                )
                choices = [
                    (menu[0], 2),
                    (menu[3], 1),
                    (menu[5], 3),
                ]
                total = Decimal('0.00')
                for m, qty in choices:
                    oi = OrderItem.objects.create(order=order, menu_item=m, quantity=qty, price=m.price, subtotal=m.price * qty)
                    total += oi.subtotal
                order.total = total
                order.save()

                items_summary = [
                    {
                        "name": item.menu_item.name,
                        "quantity": item.quantity,
                        "price": float(item.price),
                        "subtotal": float(item.subtotal),
                    }
                    for item in order.items.all()
                ]

                BillingHistory.objects.create(
                    order_number=order.order_number,
                    customer_name=order.customer_name,
                    total_amount=order.total,
                    order_date=order.order_date,
                    items_summary=json.dumps(items_summary),
                )
                self.stdout.write(self.style.SUCCESS(f"Created sample order and billing: {order.order_number}"))
        else:
            self.stdout.write("Orders already exist; skipping sample order creation.")

        self.stdout.write(self.style.SUCCESS("Demo data seeding complete."))