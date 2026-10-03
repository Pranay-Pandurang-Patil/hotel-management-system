from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="cashier")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    audit_logs = relationship("AuditLog", back_populates="user")


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(30), index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    id_proof_type: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    id_proof_number: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    reservations = relationship("Reservation", back_populates="guest")


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_number: Mapped[str] = mapped_column(
        String(20), unique=True, index=True
    )
    room_type: Mapped[str] = mapped_column(String(50))
    floor: Mapped[int] = mapped_column(Integer)
    price_per_night: Mapped[Decimal] = mapped_column(
        Numeric(12, 2)
    )
    status: Mapped[str] = mapped_column(
        String(30), default="available"
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    reservations = relationship("Reservation", back_populates="room")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("guests.id"))
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))

    check_in: Mapped[datetime] = mapped_column(DateTime)
    check_out: Mapped[datetime] = mapped_column(DateTime)

    adults: Mapped[int] = mapped_column(Integer, default=1)
    children: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[str] = mapped_column(
        String(30), default="reserved"
    )

    guest = relationship("Guest", back_populates="reservations")
    room = relationship("Room", back_populates="reservations")


class MenuCategory(Base):
    __tablename__ = "menu_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    items = relationship("MenuItem", back_populates="category")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("menu_categories.id")
    )

    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    image_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    is_available: Mapped[bool] = mapped_column(
        Boolean, default=True
    )

    category = relationship("MenuCategory", back_populates="items")


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    invoice_number: Mapped[str] = mapped_column(
        String(40), unique=True, index=True
    )

    guest_id: Mapped[int | None] = mapped_column(
        ForeignKey("guests.id"), nullable=True
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0
    )
    discount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0
    )
    tax: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0
    )
    service_charge: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0
    )
    total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=0
    )

    status: Mapped[str] = mapped_column(
        String(30), default="unpaid"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )

    payments = relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id")
    )

    description: Mapped[str] = mapped_column(String(200))
    item_type: Mapped[str] = mapped_column(String(40))

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), default=1
    )
    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2)
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2)
    )

    invoice = relationship("Invoice", back_populates="items")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    invoice_id: Mapped[int] = mapped_column(
        ForeignKey("invoices.id")
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2)
    )

    method: Mapped[str] = mapped_column(String(30))
    reference: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30), default="completed"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    invoice = relationship("Invoice", back_populates="payments")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(80))
    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2)
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )

    action: Mapped[str] = mapped_column(String(120))
    entity_type: Mapped[str] = mapped_column(String(80))
    entity_id: Mapped[str | None] = mapped_column(
        String(80), nullable=True
    )

    details: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    user = relationship("User", back_populates="audit_logs")