export type InvoiceItemDetail = {
  id: string | number;
  description: string;
  item_type: "Room" | "Food" | "Laundry" | "Service" | "Custom";
  quantity: number;
  unit_price: number;
  amount: number;
};

export type StoredInvoice = {
  id: string;
  invoice_number: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  room_number: string;
  room_type: string;
  customer_type?: "hotel_guest" | "restaurant_walkin";
  check_in: string;
  check_out: string;
  nights: number;
  items: InvoiceItemDetail[];
  subtotal: number;
  discount: number;
  taxable_amount: number;
  service_charge: number;
  service_charge_rate: number;
  tax: number;
  tax_rate: number;
  total: number;
  paid_amount: number;
  balance: number;
  payment_method: "Cash" | "UPI" | "Card" | "Split";
  payment_status: "Paid" | "Pending" | "Partially Paid";
  created_at: string;
};

export const initialInvoices: StoredInvoice[] = [
  {
    id: "inv-1048",
    invoice_number: "#INV-1048",
    guest_name: "Rahul Sharma",
    guest_phone: "+91 98765 43210",
    guest_email: "rahul.s@example.com",
    room_number: "Room 301",
    room_type: "Deluxe Suite",
    check_in: "2026-09-30",
    check_out: "2026-10-02",
    nights: 2,
    items: [
      { id: 1, description: "Deluxe Suite - 2 Nights", item_type: "Room", quantity: 2, unit_price: 2100, amount: 4200 },
      { id: 2, description: "Chicken Biryani", item_type: "Food", quantity: 1, unit_price: 350, amount: 350 },
      { id: 3, description: "Fresh Lime Soda", item_type: "Food", quantity: 2, unit_price: 120, amount: 240 },
    ],
    subtotal: 4790,
    discount: 200,
    taxable_amount: 4590,
    service_charge: 0,
    service_charge_rate: 0,
    tax: 229.5,
    tax_rate: 5,
    total: 4819.5,
    paid_amount: 4819.5,
    balance: 0,
    payment_method: "UPI",
    payment_status: "Paid",
    created_at: "2026-10-02",
  },
  {
    id: "inv-1047",
    invoice_number: "#INV-1047",
    guest_name: "Ananya Rao",
    guest_phone: "+91 98450 11223",
    guest_email: "ananya.r@example.com",
    room_number: "Room 202",
    room_type: "Executive Suite",
    check_in: "2026-09-28",
    check_out: "2026-10-01",
    nights: 3,
    items: [
      { id: 1, description: "Executive Suite - 3 Nights", item_type: "Room", quantity: 3, unit_price: 2200, amount: 6600 },
      { id: 2, description: "Paneer Tikka", item_type: "Food", quantity: 1, unit_price: 280, amount: 280 },
      { id: 3, description: "Butter Naan", item_type: "Food", quantity: 4, unit_price: 80, amount: 320 },
    ],
    subtotal: 7200,
    discount: 300,
    taxable_amount: 6900,
    service_charge: 0,
    service_charge_rate: 0,
    tax: 345,
    tax_rate: 5,
    total: 7245,
    paid_amount: 7245,
    balance: 0,
    payment_method: "Card",
    payment_status: "Paid",
    created_at: "2026-10-01",
  },
  {
    id: "inv-1046",
    invoice_number: "#INV-1046",
    guest_name: "Vikram Singh",
    guest_phone: "+91 99887 12345",
    guest_email: "vikram.s@example.com",
    room_number: "Room 203",
    room_type: "Standard Deluxe",
    check_in: "2026-10-01",
    check_out: "2026-10-03",
    nights: 2,
    items: [
      { id: 1, description: "Standard Deluxe - 2 Nights", item_type: "Room", quantity: 2, unit_price: 1500, amount: 3000 },
      { id: 2, description: "Laundry Service", item_type: "Laundry", quantity: 1, unit_price: 300, amount: 300 },
    ],
    subtotal: 3300,
    discount: 0,
    taxable_amount: 3300,
    service_charge: 0,
    service_charge_rate: 0,
    tax: 165,
    tax_rate: 5,
    total: 3465,
    paid_amount: 0,
    balance: 3465,
    payment_method: "Cash",
    payment_status: "Pending",
    created_at: "2026-10-03",
  },
];

let invoiceMemoryStore = [...initialInvoices];

export function getInvoicesStore(): StoredInvoice[] {
  return invoiceMemoryStore;
}

export function saveInvoiceToStore(inv: StoredInvoice) {
  invoiceMemoryStore = [inv, ...invoiceMemoryStore];
}
