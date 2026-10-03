from decimal import Decimal

from pydantic import BaseModel, Field


class BillItemInput(BaseModel):
    description: str = Field(min_length=1, max_length=200)
    item_type: str = Field(min_length=1, max_length=40)
    quantity: Decimal = Field(gt=0)
    unit_price: Decimal = Field(ge=0)


class BillCalculationRequest(BaseModel):
    items: list[BillItemInput] = Field(min_length=1)
    discount: Decimal = Field(default=Decimal("0"), ge=0)
    tax_rate: Decimal = Field(default=Decimal("5"), ge=0)
    service_charge_rate: Decimal = Field(default=Decimal("0"), ge=0)