from decimal import Decimal, ROUND_HALF_UP


MONEY_PLACES = Decimal("0.01")


def money(value: Decimal | int | float | str) -> Decimal:
    return Decimal(str(value)).quantize(
        MONEY_PLACES,
        rounding=ROUND_HALF_UP,
    )


def calculate_bill(
    items: list[dict],
    discount: Decimal = Decimal("0"),
    tax_rate: Decimal = Decimal("5"),
    service_charge_rate: Decimal = Decimal("0"),
) -> dict:
    """
    Calculate a complete hotel bill.

    Each item must contain:
        description
        quantity
        unit_price
        item_type
    """

    normalized_items = []
    subtotal = Decimal("0")

    for item in items:
        quantity = money(item["quantity"])
        unit_price = money(item["unit_price"])

        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")

        if unit_price < 0:
            raise ValueError("Unit price cannot be negative.")

        amount = money(quantity * unit_price)

        normalized_item = {
            "description": item["description"],
            "item_type": item["item_type"],
            "quantity": quantity,
            "unit_price": unit_price,
            "amount": amount,
        }

        normalized_items.append(normalized_item)
        subtotal += amount

    subtotal = money(subtotal)

    discount = money(discount)

    if discount < 0:
        raise ValueError("Discount cannot be negative.")

    if discount > subtotal:
        raise ValueError("Discount cannot exceed subtotal.")

    taxable_amount = money(subtotal - discount)

    service_charge_rate = money(service_charge_rate)

    if service_charge_rate < 0:
        raise ValueError("Service charge rate cannot be negative.")

    service_charge = money(
        taxable_amount * service_charge_rate / Decimal("100")
    )

    tax_rate = money(tax_rate)

    if tax_rate < 0:
        raise ValueError("Tax rate cannot be negative.")

    tax_base = money(taxable_amount + service_charge)

    tax = money(
        tax_base * tax_rate / Decimal("100")
    )

    total = money(
        taxable_amount
        + service_charge
        + tax
    )

    return {
        "items": normalized_items,
        "subtotal": subtotal,
        "discount": discount,
        "taxable_amount": taxable_amount,
        "service_charge_rate": service_charge_rate,
        "service_charge": service_charge,
        "tax_rate": tax_rate,
        "tax": tax,
        "total": total,
    }