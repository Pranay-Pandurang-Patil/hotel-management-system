# 🏨 HotelOS — Hotel Management & Smart Billing System

**A modern full-stack hotel management platform for managing rooms, restaurant operations, smart billing, payments, and professional invoice generation.**

HotelOS is a portfolio-focused application designed to simplify hotel operations through a centralized management dashboard. It combines a premium dark-themed interface with practical business workflows and a dedicated billing calculation engine.

---

## ✨ Key Features

### 📊 1. Dashboard

* Centralized hotel operations overview.
* Real-time-style room occupancy statistics.
* Revenue summaries.
* Operational status indicators.
* Dashboard statistics derived from the actual room inventory.

### 🧾 2. Smart Billing & Invoicing

A comprehensive billing system supporting multiple billing scenarios.

**Billing Features:**

* Billing history.
* Five-step bill creation wizard.
* Hotel guest billing.
* Restaurant walk-in billing.
* Room charges.
* Restaurant charges.
* Laundry, service, and custom charges.
* Discount calculations.
* GST and service charge calculations.
* Payment and outstanding balance handling.
* Professional invoice preview.
* Browser printing and print-to-PDF support.

**Supported Billing Workflows:**

| Feature            | Hotel Guest | Restaurant Walk-in |
| ------------------ | :---------: | :----------------: |
| Customer details   |      ✅      |          ✅         |
| Room association   |   Optional  |    Not required    |
| Room charges       |      ✅      |          ❌         |
| Restaurant charges |      ✅      |          ✅         |
| Service charges    |      ✅      |      Optional      |
| Invoice generation |      ✅      |          ✅         |

### 🛏️ 3. Room Management

Complete room inventory management.

* Add new rooms.
* Edit room numbers.
* Update room types.
* Manage floors.
* Configure nightly tariffs.
* Update room status.
* Assign guests.
* Check-in and check-out operations.
* Delete eligible rooms.
* Search and filter rooms.

**Demo Inventory:** Starts with 9 actual rooms. Dashboard occupancy figures are calculated using the same room inventory.

### 🍽️ 4. Restaurant Management

A dedicated restaurant menu management module.

* Add, edit, and delete food items.
* Food category management.
* Search and category filters.
* Food availability toggle.
* GST and pricing configuration.
* Local food image support.
* Browser Local Storage persistence.
* Restaurant menu integration with billing.

### ⚙️ 5. Settings & Administration

Functional browser-based settings with local persistence.

* Hotel name and contact information.
* Hotel address.
* GSTIN configuration.
* Administrator display name.
* Username management.
* Demo password change.
* Payment alerts.
* Housekeeping alerts.
* Revenue summary.
* Two-factor control state.
* Session timeout selection.

---

## 🧠 Smart Billing Architecture

One of the important design decisions in HotelOS is separating hotel guest billing from restaurant walk-in billing.

A restaurant customer does not need to be a hotel guest.

```text
                    NEW BILL
                       |
             +---------+---------+
             |                   |
         HOTEL GUEST        WALK-IN CUSTOMER
             |                   |
        Guest Details      Customer Details
             |                   |
       Room (Optional)         No Room
             |                   |
       +-----+------+        Food Charges
       |     |      |
      Room  Food  Services
    Charges
       |     |      |
       +-----+------+
             |
             v
       BILLING ENGINE
             |
             v
      GST / DISCOUNT /
      SERVICE CHARGES
             |
             v
          PAYMENT
             |
             v
      BALANCE HANDLING
             |
             v
     PROFESSIONAL INVOICE
```

### Billing Calculation Engine

The backend provides a dedicated calculation endpoint:

`POST /api/billing/calculate`

* Frontend communicates with the FastAPI calculation API when available.
* A matching local calculation implementation acts as a fallback.
* Billing calculations support discounts, GST, service charges, and payment balances.

This approach allows the billing interface to remain functional even when the backend is unavailable.

---

## 🛠️ Technology Stack

### Frontend

| Technology    | Purpose                              |
| ------------- | ------------------------------------ |
| React         | Component-based UI                   |
| TypeScript    | Type safety                          |
| Vite          | Development server and build tooling |
| Motion        | Animations and transitions           |
| Lucide React  | Icon library                         |
| Custom CSS    | Responsive design system             |
| Local Storage | Browser-based persistence            |

### Backend

| Technology | Purpose              |
| ---------- | -------------------- |
| Python     | Backend programming  |
| FastAPI    | REST API framework   |
| SQLAlchemy | Database ORM         |
| SQLite     | Development database |
| Uvicorn    | ASGI server          |

---

## 🏗️ Project Architecture

```text
HotelOS/
│
├── frontend/
│   ├── public/
│   │   └── food/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── services/
│   │   ├── styles/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── ...
│   │
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

*Note: Directory names are illustrative. Refer to the actual repository structure for exact implementation details.*

---

## 🚀 Getting Started

Follow these instructions to run HotelOS locally.

### Prerequisites

Make sure you have installed:

* Node.js (LTS recommended).
* npm.
* Python 3.10 or later.
* Git.

### 1. Clone the Repository

```bash
git clone https://github.com/Pranay-Pandurang-Patil/hotel-management-system.git
```

```bash
cd hotel-management-system
```

### 2. Start the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### 3. Start the Backend

Open another terminal from the project root.

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 🔐 Demo Credentials

Use the following credentials to explore the application.

| Field    | Value                                         |
| -------- | --------------------------------------------- |
| Email    | [admin@hotelos.com](mailto:admin@hotelos.com) |
| Password | admin123                                      |

**Important:** Authentication is implemented as a local portfolio/demo authentication flow. It is not intended for production identity management.

Do not use these credentials for real hotel operations.

---

## 🗄️ Data Management

HotelOS uses different persistence mechanisms for its demo functionality.

| Component               | Technology                                       |
| ----------------------- | ------------------------------------------------ |
| Backend database        | SQLite                                           |
| Database ORM            | SQLAlchemy                                       |
| Restaurant menu changes | Browser Local Storage                            |
| Browser-based settings  | Browser Local Storage                            |
| Food images             | Local frontend assets and external image sources |

Frontend local persistence and backend database storage should not be assumed to synchronize automatically.

---

## 🔌 API Documentation

HotelOS uses FastAPI to expose backend functionality.

### Billing Calculation API

| Property          | Value                    |
| ----------------- | ------------------------ |
| Method            | POST                     |
| Endpoint          | `/api/billing/calculate` |
| Framework         | FastAPI                  |
| API Documentation | Swagger UI               |

Access interactive API documentation:

`http://127.0.0.1:8000/docs`

---

## 🎨 UI/UX Design Philosophy

HotelOS follows a premium dark-dashboard design approach.

**Design Principles:**

* Clean visual hierarchy.
* Consistent spacing and typography.
* Responsive layouts.
* Modern dashboard components.
* Clear operational indicators.
* Intuitive navigation.
* Consistent form interactions.
* Professional invoice layouts.
* Smooth interface animations.

The objective is to provide a unified and intuitive interface for everyday hotel management operations.

---

## 🖼️ Restaurant Food Photography & Attribution

The demo restaurant menu uses food photography from Unsplash and Wikimedia Commons.

* Food images are stored locally where applicable in `frontend/public/food/`.
* External image URLs are used for selected food items.
* A local SVG fallback is provided when an external image fails to load.
* Masala Dosa and Dal Makhani images sourced from Wikimedia Commons are subject to their respective Creative Commons licenses.

**Redistribution Notice:** Preserve original image sources, creator attribution, and applicable license information when redistributing Wikimedia Commons images.

---

## 🔒 Security & Production Considerations

HotelOS is currently designed as a portfolio and demonstration application.

Before using it for actual hotel operations, the following improvements would be necessary:

* Production-grade authentication and authorization.
* Secure password hashing.
* Server-side session management.
* Role-based access control.
* Backend validation for all billing operations.
* Persistent server-side storage for operational data.
* Database migrations.
* API rate limiting.
* Secure environment variable management. and Audit logging.
* Automated database backups.
* HTTPS configuration.
* Payment gateway integration where required.

The demo authentication and browser-based persistence mechanisms are not substitutes for production security controls.

---

## 🔮 Future Enhancements

Potential future development directions:

* [ ] Production authentication and role management.
* [ ] Guest reservation management.
* [ ] Advanced check-in/check-out management.
* [ ] Housekeeping task management.
* [ ] Restaurant kitchen order management.
* [ ] Inventory and stock management.
* [ ] Advanced revenue analytics.
* [ ] Downloadable PDF invoice generation.
* [ ] Email invoice delivery.
* [ ] Payment gateway integration.
* [ ] Database migration to PostgreSQL.
* [ ] Automated backup and recovery.
* [ ] Cloud deployment.
* [ ] Automated testing and CI/CD.

---

## 🎯 Project Objectives

HotelOS demonstrates the practical application of:

* Full-stack application development.
* React and TypeScript.
* REST API development using FastAPI.
* Relational database integration.
* SQLAlchemy ORM.
* Billing and tax calculation logic.
* Browser-based state persistence.
* Responsive UI/UX design.
* Frontend-backend integration.
* Real-world business workflow modeling.

---

## 👨‍💻 Author

**Pranay Pandurang Patil**

Computer Science & Engineering Student At KLS GIT Belgaum,Karnataka,India.

GitHub: [Pranay-Pandurang-Patil](https://github.com/Pranay-Pandurang-Patil)

---

## 📄 License

This project is intended for educational, portfolio, and demonstration purposes.

A separate `LICENSE` file should define the terms under which the source code may be used, modified, and distributed.

---

<p align="center">
  <b>HotelOS — Smarter Hotel Operations. Simplified Billing.</b>
  <br>
  Built with React, TypeScript, FastAPI, and SQLite.
</p>
