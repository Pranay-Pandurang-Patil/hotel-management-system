# HotelOS — Hotel Management & Smart Billing System

Portfolio/demo full-stack hotel management system focused on billing, rooms, restaurant operations and a premium dark UI.

## Stack

- React + TypeScript + Vite
- Motion + Lucide React
- Custom responsive CSS design system
- FastAPI
- SQLAlchemy
- SQLite for development

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Run the backend

```bash
cd backend
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend: `http://127.0.0.1:8000`
Swagger: `http://127.0.0.1:8000/docs`

## Demo login

- Email: `admin@hotelos.com`
- Password: `admin123`

The authentication layer is intentionally a local portfolio/demo authentication flow. It is not production identity management.

## Core workflows

### Billing

- Billing History
- New Bill 5-step wizard
- Hotel Guest billing
- Restaurant Walk-in billing with **no room required**
- Room charges
- Restaurant charges
- Service/laundry/custom charges
- Discount, GST and service charge
- Payment and balance handling
- Professional invoice preview
- Browser print / print-to-PDF layout

### Rooms

The demo inventory starts with **9 actual rooms**, so all dashboard occupancy figures are derived from that same inventory rather than unrelated hard-coded totals.

Room management supports:

- Add room
- Edit room number
- Edit room type
- Edit floor
- Edit nightly tariff
- Edit status
- Assign guest/check-out for occupied/reserved rooms
- Delete eligible rooms
- Search/filter

### Restaurant

- Menu catalog
- Add/Edit/Delete food
- Availability toggle
- Category/search filters
- GST and pricing
- Food images stored locally in `frontend/public/food/` so the demo does not depend on broken external image URLs
- Menu changes persist in browser local storage
- Restaurant items flow into Billing

### Settings

Settings are functional for the browser-based demo and persist locally:

- Hotel name/contact/address/GSTIN
- Administrator display name/username
- Demo password change
- Payment alerts
- Housekeeping alerts
- Revenue summary
- Two-factor control state
- Session timeout selection

### Backend billing engine

The FastAPI calculation API remains available at:

`POST /api/billing/calculate`

The frontend uses the API when available and falls back to a matching local calculation when the backend is unavailable.

## Important demo logic

A restaurant customer does **not** have to be a hotel guest.

```text
New Bill
   |
   +-- Hotel Guest
   |      +-- Guest + optional/current Room
   |      +-- Room Charges
   |      +-- Restaurant / Service Charges
   |
   +-- Restaurant Walk-in
          +-- Customer
          +-- No Room
          +-- Food Charges

                 |
                 v
            Billing Engine
                 |
                 v
              Payment
                 |
                 v
              Invoice
```


## Restaurant food photography
The demo menu uses direct image URLs from Unsplash and Wikimedia Commons for food photography. The application includes a local SVG fallback if an external image cannot be loaded. Masala Dosa and Dal Makhani images are served from Wikimedia Commons under their respective Creative Commons licenses; keep the source/attribution information when redistributing those images/links.
