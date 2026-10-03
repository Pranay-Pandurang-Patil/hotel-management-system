from fastapi import APIRouter, HTTPException

from ..schemas.billing import BillCalculationRequest
from ..services.billing_service import calculate_bill

router = APIRouter(
    prefix="/api/billing",
    tags=["Billing"],
)


@router.post("/calculate")
def calculate(request: BillCalculationRequest):
    try:
        result = calculate_bill(
            items=[
                item.model_dump()
                for item in request.items
            ],
            discount=request.discount,
            tax_rate=request.tax_rate,
            service_charge_rate=request.service_charge_rate,
        )

        return {
            "success": True,
            "bill": result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )