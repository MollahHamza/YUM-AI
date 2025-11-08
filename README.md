🍽️ YumAI – AI-Powered Restaurant Management SaaS
📌 Project Overview

YumAI is a cloud-based, multi-tenant Restaurant Management SaaS designed to simplify restaurant operations with:

Billing & POS

Inventory Management

AI-Powered Analytics & Forecasting

Scalability Recommendations

The system integrates AI (Ollama) and ML forecasting to help restaurant owners reduce waste, optimize menus, and plan for growth.

🚀 Current Status (23 Sept 2025)

✅ ~40% of Frontend (ReactJS) completed
❌ Backend (Django + FastAPI) not yet started
❌ Database (PostgreSQL/MySQL) not integrated
❌ AI/ML (Ollama + Prophet/LightGBM) pending
❌ Deployment not yet done

🛠️ Tech Stack

Frontend: ReactJS, HTML, CSS

Backend (planned): Django (API Gateway), FastAPI (ML Service)

Database (planned): PostgreSQL / MySQL

AI Runtime (planned): Ollama (Mistral, Phi3, Llama3)

ML Libraries (planned): Prophet, scikit-learn, LightGBM

Deployment (planned): Docker, GitHub Actions

📂 Project Structure (current)
yumai-frontend/         # React frontend (40% done)
 ├── public/           
 ├── src/              
 │   ├── components/    # Navbar, Dashboard (in progress)  
 │   ├── pages/         # Login, Home, Reports (partial)  
 │   ├── App.js  
 │   └── index.js  
 └── package.json  

yumai-backend/          # (to be added later)
ml-service/             # (to be added later)
docs/                   # Proposal, designs, planning files

📅 Project Timeline (Planned)

Requirement Analysis: ✅ Done

Design: ✅ Done

Frontend Development: 🔄 In progress (40%)

Backend + ML Integration: ⏳ Pending

Testing & Debugging: ⏳ Pending

Deployment & Demo: ⏳ Pending

👥 Team Members
Name	Reg. No.	Contribution
Md. Sadman Saquib	2022331002	Backend, Database
Mollah Omar Hamza	2022331066	AI/ML Integration
Ahmed Istiaque	2022331100	Frontend, UI/UX, Backend & Security
📖 References

Django & FastAPI Documentation

PostgreSQL Documentation

scikit-learn, Prophet Official Docs









# YumAI Backend API Documentation

Base URL: `http://127.0.0.1:8000`

---

## 📋 Menu Items API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/api/orders/menu-items/` | Get all menu items | — | `[{"id": 1, "name": "Cheeseburger", "price": "8.99", "category": "Burgers", "created_at": "2025-01-15T10:30:00Z"}]` |
| **GET** | `/api/orders/menu-items/{id}/` | Get single menu item | — | `{"id": 1, "name": "Cheeseburger", "price": "8.99", "category": "Burgers"}` |
| **POST** | `/api/orders/menu-items/` | Create new menu item | `{"name": "Pizza", "price": "12.99", "category": "Main"}` | `{"id": 10, "name": "Pizza", "price": "12.99", "category": "Main"}` |
| **PUT** | `/api/orders/menu-items/{id}/` | Update entire menu item | `{"name": "Cheese Pizza", "price": "13.99", "category": "Main"}` | `{"id": 10, "name": "Cheese Pizza", "price": "13.99"}` |
| **PATCH** | `/api/orders/menu-items/{id}/` | Update specific fields | `{"price": "14.99"}` | `{"id": 10, "name": "Pizza", "price": "14.99"}` |
| **DELETE** | `/api/orders/menu-items/{id}/` | Delete menu item | — | `204 No Content` |

---

## 🛒 Orders API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/api/orders/orders/` | Get all orders | — | `[{"id": 1, "customer_name": "John", "order_number": "ORD-123", "total": "25.50", "status": "Pending", "items": [...]}]` |
| **GET** | `/api/orders/orders/{id}/` | Get single order | — | `{"id": 1, "customer_name": "John", "order_number": "ORD-123", "total": "25.50", "items": [...]}` |
| **POST** | `/api/orders/orders/create_order/` | Create new order with multiple items | `{"customer_name": "John Doe", "items": [{"menu_item_id": 1, "quantity": 2}, {"menu_item_id": 3, "quantity": 1}]}` | `{"id": 1, "customer_name": "John Doe", "order_number": "ORD-20250115103045", "total": "25.50", "status": "Pending"}` |
| **POST** | `/api/orders/pay-order/` | Process payment for order | `{"order_id": 1}` | `{"message": "Payment successful", "billing_id": 5, "order_number": "ORD-123", "total_amount": 25.50}` |

---

## 💰 Billing History API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/api/orders/billing-history/` | Get all billing records | — | `[{"id": 1, "order_number": "ORD-123", "customer_name": "John", "total_amount": "25.50", "status": "Paid", "order_date": "2025-01-15T10:30:00Z"}]` |
| **GET** | `/api/orders/billing-history/{id}/` | Get single billing record | — | `{"id": 1, "order_number": "ORD-123", "customer_name": "John", "total_amount": "25.50", "status": "Paid"}` |
| **GET** | `/api/orders/billing-history/{id}/items/` | Get items for specific bill | — | `{"items": [{"name": "Cheeseburger", "quantity": 2, "price": 8.99, "subtotal": 17.98}]}` |

---

## 📦 Inventory API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/inventory/items/` | List all inventory items | — | `[{"id": 1, "name": "Tomatoes", "quantity": 50, "unit": "kg", "category": "Vegetables"}]` |
| **GET** | `/inventory/items/{id}/` | Get single inventory item | — | `{"id": 1, "name": "Tomatoes", "quantity": 50, "unit": "kg"}` |
| **POST** | `/inventory/items/` | Create new inventory item | `{"name": "Lettuce", "quantity": 30, "unit": "kg", "category": "Vegetables"}` | `{"id": 2, "name": "Lettuce", "quantity": 30}` |
| **PUT** | `/inventory/items/{id}/` | Update entire inventory item | `{"name": "Cherry Tomatoes", "quantity": 60, "unit": "kg"}` | `{"id": 1, "name": "Cherry Tomatoes", "quantity": 60}` |
| **PATCH** | `/inventory/items/{id}/` | Update specific fields | `{"quantity": 40}` | `{"id": 1, "name": "Tomatoes", "quantity": 40}` |
| **DELETE** | `/inventory/items/{id}/` | Delete inventory item | — | `204 No Content` |
| **GET** | `/inventory/items/stats/` | Get inventory statistics | — | `{"total_items": 25, "low_stock_count": 5, "out_of_stock": 2}` |
| **GET** | `/inventory/items/low_stock/` | Get low stock items | — | `[{"id": 3, "name": "Cheese", "quantity": 5, "threshold": 10}]` |
| **GET** | `/inventory/items/?search={query}` | Search inventory items | — | `[{"id": 1, "name": "Tomatoes", ...}]` |
| **GET** | `/inventory/items/?category={name}` | Filter by category | — | `[{"id": 1, "name": "Tomatoes", "category": "Vegetables"}]` |

---

## 📊 Dashboard API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **GET** | `/dashboard/stats/` | Get dashboard statistics | — | `{"total_sales": 5000.00, "total_orders": 150, "popular_items": [...], "recent_orders": [...]}` |

---

## 📝 Request Examples

### Creating an Order
```bash
curl -X POST http://127.0.0.1:8000/api/orders/orders/create_order/ \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Alice Johnson",
    "items": [
      {"menu_item_id": 1, "quantity": 2},
      {"menu_item_id": 4, "quantity": 1},
      {"menu_item_id": 6, "quantity": 3}
    ]
  }'
```

### Processing Payment
```bash
curl -X POST http://127.0.0.1:8000/api/orders/pay-order/ \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1}'
```

### Adding Menu Item
```bash
curl -X POST http://127.0.0.1:8000/api/orders/menu-items/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Veggie Burger",
    "price": "9.99",
    "category": "Burgers"
  }'
```

### Searching Inventory
```bash
curl -X GET "http://127.0.0.1:8000/inventory/items/?search=cheese"
```

---

## 🔒 Authentication

Currently, the API does not require authentication. For production deployment, implement token-based authentication using Django Rest Framework's authentication classes.

---

## ⚠️ Error Responses

All endpoints return appropriate HTTP status codes:

| Status Code | Description |
|------------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `204` | Deleted successfully |
| `400` | Bad request (invalid data) |
| `404` | Resource not found |
| `500` | Internal server error |

### Error Response Format
```json
{
  "error": "Detailed error message here"
}
```

---

## 🚀 Testing the API

You can test the API using:
- **Postman**: Import the endpoints above
- **curl**: Use the examples provided
- **Browser**: For GET requests, simply visit the URLs
- **Django REST Framework UI**: Visit any endpoint in your browser for an interactive interface

---

## 📌 Notes for Frontend Developers

1. **Base URL**: All endpoints are prefixed with `http://127.0.0.1:8000`
2. **Content-Type**: Always use `application/json` for POST/PUT/PATCH requests
3. **CORS**: Make sure CORS is configured if your frontend runs on a different port
4. **Decimal Values**: Prices and amounts are returned as strings (e.g., `"8.99"`) to maintain precision
5. **Timestamps**: All dates are in ISO 8601 format (e.g., `"2025-01-15T10:30:00Z"`)
6. **Order Flow**: 
   - Create order → Get order details → Process payment → Order moves to billing history
7. **Menu Item IDs**: Use `menu_item_id` when creating orders, not `menu_item`

---

## 🔄 Typical Workflow

### POS Workflow
1. `GET /api/orders/menu-items/` - Load menu items
2. User selects items with quantities
3. `POST /api/orders/orders/create_order/` - Create order
4. `POST /api/orders/pay-order/` - Process payment
5. `GET /api/orders/billing-history/` - View receipt

### Inventory Management
1. `GET /inventory/items/` - View all items
2. `GET /inventory/items/low_stock/` - Check low stock
3. `PATCH /inventory/items/{id}/` - Update quantities
4. `POST /inventory/items/` - Add new items

---

## 💡 Tips

- Use the Django REST Framework browsable API at `http://127.0.0.1:8000/api/orders/` for interactive testing
- Check `items` array in order responses to see order details
- Filter and search parameters can be combined: `/inventory/items/?category=Vegetables&search=tom`
- Order numbers are auto-generated in format: `ORD-YYYYMMDDHHmmss`

Ollama Documentation (API & Serving)

⚠️ Note: This project is currently in the early development stage. Only partial frontend has been built; backend, AI, and deployment will be integrated in upcoming phases.
