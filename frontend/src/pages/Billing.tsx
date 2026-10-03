import { useMemo, useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Minus,
  Trash2,
  Search,
  BedDouble,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Download,
  Utensils,
  FileText,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import type { MenuItem } from "../data/restaurantData";
import { getMenuItems } from "../data/restaurantData";
import type {
  StoredInvoice,
  InvoiceItemDetail,
} from "../data/billingData";
import {
  getInvoicesStore,
  saveInvoiceToStore,
} from "../data/billingData";
import { loadRooms } from "../data/roomData";

const API_BASE_URL = "http://localhost:8000";

const getHotelProfile = () => {
  try {
    const raw = localStorage.getItem("hotelos_settings_v2");
    return { hotelName: "HotelOS Grand Hotel", phone: "+91 98765 43210", email: "admin@hotelos.demo", address: "MG Road, Bengaluru, Karnataka - 560001", gstin: "29AAAAA0000A1Z5", ...(raw ? JSON.parse(raw) : {}) };
  } catch { return { hotelName: "HotelOS Grand Hotel", phone: "+91 98765 43210", email: "admin@hotelos.demo", address: "MG Road, Bengaluru, Karnataka - 560001", gstin: "29AAAAA0000A1Z5" }; }
};

const money = (v: number) =>
  `₹${(Number(v) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type ViewMode = "history" | "new_bill" | "invoice_details";
type Step = 1 | 2 | 3 | 4 | 5;

const ROOM_OPTIONS = loadRooms().map((room) => ({
  number: `Room ${room.number}`,
  type: room.type,
  price: room.price,
  status: room.status,
}));

export default function Billing() {
  const hotelProfile = getHotelProfile();
  const [viewMode, setViewMode] = useState<ViewMode>("history");
  const [invoices, setInvoices] = useState<StoredInvoice[]>(getInvoicesStore());
  const [selectedInvoice, setSelectedInvoice] = useState<StoredInvoice | null>(
    invoices[0] || null
  );

  // Search & Filters for Billing History
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("All");
  const [historyRoomFilter, setHistoryRoomFilter] = useState("All");

  // NEW BILL WIZARD STATE (5 Steps)
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Customer & Stay
  const [customerType, setCustomerType] = useState<"hotel_guest" | "restaurant_walkin">("hotel_guest");
  const [guestType, setGuestType] = useState<"walkin" | "existing">("walkin");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [selectedRoomNumber, setSelectedRoomNumber] = useState("Room 103");
  const [roomType, setRoomType] = useState("Deluxe Suite");
  const [roomPricePerNight, setRoomPricePerNight] = useState<number>(3000);
  const [checkInDate, setCheckInDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split("T")[0];
  });

  // Calculated stay nights
  const numberOfNights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [checkInDate, checkOutDate]);

  // Step 2: Charges
  const [billItems, setBillItems] = useState<InvoiceItemDetail[]>([
    {
      id: "room-default",
      description: "Deluxe Suite (2 Nights)",
      item_type: "Room",
      quantity: 2,
      unit_price: 3000,
      amount: 6000,
    },
  ]);

  // Food Menu Selection inside Charges Step
  const [menuItems] = useState<MenuItem[]>(getMenuItems());
  const [foodSearch, setFoodSearch] = useState("");
  const [foodCategory, setFoodCategory] = useState("All");

  // Custom charge input
  const [customDesc, setCustomDesc] = useState("");
  const [customPrice, setCustomPrice] = useState<number | "">(100);
  const [customQty, setCustomQty] = useState<number>(1);
  const [customType, setCustomType] = useState<"Service" | "Laundry" | "Custom">("Service");

  // Step 3: Adjustments
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number>(5);
  const [serviceChargeRate, setServiceChargeRate] = useState<number>(0);

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card" | "Split">("UPI");
  const [paidAmount, setPaidAmount] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending" | "Partially Paid">("Paid");

  // Customer type controls whether accommodation is part of the bill.
  useEffect(() => {
    if (customerType === "restaurant_walkin") {
      setSelectedRoomNumber("N/A");
      setRoomType("Restaurant Walk-in");
      setRoomPricePerNight(0);
      setBillItems((current) => current.filter((item) => item.item_type !== "Room"));
    } else {
      const firstRoom = ROOM_OPTIONS[0];
      if (selectedRoomNumber === "N/A") {
        setSelectedRoomNumber(firstRoom?.number || "N/A");
      }
    }
  }, [customerType]);

  // Synchronize room charges when room, price, or dates change in Step 1
  useEffect(() => {
    if (customerType === "restaurant_walkin") return;
    const selectedRoom = ROOM_OPTIONS.find((r) => r.number === selectedRoomNumber);
    if (selectedRoom) {
      setRoomType(selectedRoom.type);
      setRoomPricePerNight(selectedRoom.price);

      // Update default room item in billItems
      setBillItems((current) => {
        const nonRoomItems = current.filter((i) => i.item_type !== "Room");
        const newRoomItem: InvoiceItemDetail = {
          id: "room-stay",
          description: `${selectedRoom.number} (${selectedRoom.type}) - ${numberOfNights} ${
            numberOfNights === 1 ? "Night" : "Nights"
          }`,
          item_type: "Room",
          quantity: numberOfNights,
          unit_price: selectedRoom.price,
          amount: numberOfNights * selectedRoom.price,
        };
        return [newRoomItem, ...nonRoomItems];
      });
    }
  }, [selectedRoomNumber, numberOfNights, customerType]);

  // Billing Calculation via FastAPI endpoint or Client Fallback
  const [calcResult, setCalcResult] = useState<{
    subtotal: number;
    discount: number;
    taxable_amount: number;
    service_charge: number;
    tax: number;
    total: number;
  }>({
    subtotal: 0,
    discount: 0,
    taxable_amount: 0,
    service_charge: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {
    const rawSubtotal = billItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const rawDiscount = Math.min(discountAmount, rawSubtotal);
    const payloadItems = billItems.map((item) => ({
      description: item.description,
      item_type: item.item_type,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    let isSubscribed = true;

    // Call FastAPI /api/billing/calculate endpoint
    fetch(`${API_BASE_URL}/api/billing/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: payloadItems.length > 0 ? payloadItems : [{ description: "Base", item_type: "Room", quantity: 1, unit_price: 0 }],
        discount: rawDiscount,
        tax_rate: gstRate,
        service_charge_rate: serviceChargeRate,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("API calculate error");
        return res.json();
      })
      .then((data) => {
        if (isSubscribed && data.success && data.bill) {
          const b = data.bill;
          setCalcResult({
            subtotal: Number(b.subtotal),
            discount: Number(b.discount),
            taxable_amount: Number(b.taxable_amount),
            service_charge: Number(b.service_charge),
            tax: Number(b.tax),
            total: Number(b.total),
          });
        }
      })
      .catch(() => {
        // Fallback local calculation
        if (isSubscribed) {
          const taxable = Math.max(0, rawSubtotal - rawDiscount);
          const serviceChargeVal = (taxable * serviceChargeRate) / 100;
          const taxVal = ((taxable + serviceChargeVal) * gstRate) / 100;
          const totalVal = taxable + serviceChargeVal + taxVal;
          setCalcResult({
            subtotal: rawSubtotal,
            discount: rawDiscount,
            taxable_amount: taxable,
            service_charge: serviceChargeVal,
            tax: taxVal,
            total: totalVal,
          });
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [billItems, discountAmount, gstRate, serviceChargeRate]);

  // Update paid amount when total changes in Step 4
  useEffect(() => {
    if (paidAmount === "") {
      setPaidAmount(calcResult.total);
    }
  }, [calcResult.total]);

  // BILL ITEM HANDLERS
  const updateItemQty = (id: string | number, delta: number) => {
    setBillItems((items) =>
      items.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty, amount: newQty * i.unit_price };
        }
        return i;
      })
    );
  };

  const removeItem = (id: string | number) => {
    setBillItems((items) => items.filter((i) => i.id !== id));
  };

  const addFoodToBill = (food: MenuItem) => {
    if (!food.isAvailable) {
      alert(`${food.name} is currently marked as unavailable.`);
      return;
    }
    setBillItems((items) => {
      const existing = items.find((i) => i.description === food.name);
      if (existing) {
        return items.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.unit_price }
            : i
        );
      }
      return [
        ...items,
        {
          id: Date.now(),
          description: food.name,
          item_type: "Food",
          quantity: 1,
          unit_price: food.price,
          amount: food.price,
        },
      ];
    });
  };

  const handleAddCustomCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDesc.trim()) return;
    const priceNum = typeof customPrice === "number" ? customPrice : Number(customPrice) || 0;
    setBillItems((items) => [
      ...items,
      {
        id: Date.now(),
        description: customDesc.trim(),
        item_type: customType,
        quantity: customQty,
        unit_price: priceNum,
        amount: customQty * priceNum,
      },
    ]);
    setCustomDesc("");
    setCustomPrice(100);
    setCustomQty(1);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!guestName.trim() && customerType === "hotel_guest") { alert("Enter the hotel guest name before continuing."); return; }
    }
    if (currentStep === 2 && billItems.length === 0) { alert("Add at least one charge before continuing."); return; }
    if (currentStep === 4) {
      const paid = typeof paidAmount === "number" ? paidAmount : Number(paidAmount) || 0;
      if (paid < 0 || paid > calcResult.total) { alert("Paid amount cannot exceed the bill total."); return; }
    }
    setCurrentStep((s) => (s + 1) as Step);
  };

  // GENERATE INVOICE
  const handleGenerateInvoice = () => {
    if (!billItems.length) { alert("Add at least one charge before generating the invoice."); return; }
    if (customerType === "hotel_guest" && !guestName.trim()) { alert("Enter the hotel guest name before generating the invoice."); return; }
    const paidCheck = typeof paidAmount === "number" ? paidAmount : Number(paidAmount) || 0;
    if (paidCheck < 0 || paidCheck > calcResult.total) { alert("Paid amount cannot exceed the bill total."); return; }
    const nextInvNum = `#INV-${1049 + invoices.length}`;
    const paidVal = typeof paidAmount === "number" ? paidAmount : calcResult.total;
    const balanceVal = Math.max(0, calcResult.total - paidVal);

    const newInv: StoredInvoice = {
      id: `inv-${Date.now()}`,
      invoice_number: nextInvNum,
      guest_name: guestName.trim() || "Walk-in Guest",
      guest_phone: guestPhone.trim() || "+91 98765 00000",
      guest_email: guestEmail.trim() || "guest@hotelos.demo",
      room_number: customerType === "restaurant_walkin" ? "N/A" : selectedRoomNumber,
      room_type: customerType === "restaurant_walkin" ? "Restaurant Dining" : roomType,
      check_in: customerType === "restaurant_walkin" ? "" : checkInDate,
      check_out: customerType === "restaurant_walkin" ? "" : checkOutDate,
      nights: customerType === "restaurant_walkin" ? 0 : numberOfNights,
      customer_type: customerType,
      items: billItems,
      subtotal: calcResult.subtotal,
      discount: calcResult.discount,
      taxable_amount: calcResult.taxable_amount,
      service_charge: calcResult.service_charge,
      service_charge_rate: serviceChargeRate,
      tax: calcResult.tax,
      tax_rate: gstRate,
      total: calcResult.total,
      paid_amount: paidVal,
      balance: balanceVal,
      payment_method: paymentMethod,
      payment_status: balanceVal === 0 ? "Paid" : paidVal > 0 ? "Partially Paid" : "Pending",
      created_at: new Date().toISOString().split("T")[0],
    };

    saveInvoiceToStore(newInv);
    setInvoices(getInvoicesStore());
    setSelectedInvoice(newInv);
    setViewMode("invoice_details");
  };

  // Filtered Billing History
  const filteredHistory = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = `${inv.invoice_number} ${inv.guest_name} ${inv.room_number}`
        .toLowerCase()
        .includes(historySearch.toLowerCase());
      const matchStatus =
        historyStatusFilter === "All" || inv.payment_status === historyStatusFilter;
      const matchRoom =
        historyRoomFilter === "All" || inv.room_number === historyRoomFilter;
      return matchSearch && matchStatus && matchRoom;
    });
  }, [invoices, historySearch, historyStatusFilter, historyRoomFilter]);

  const historyRooms = useMemo(() => {
    return ["All", ...Array.from(new Set(invoices.map((i) => i.room_number)))];
  }, [invoices]);

  const filteredFoodMenu = useMemo(() => {
    return menuItems.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(foodSearch.toLowerCase());
      const matchCat = foodCategory === "All" || m.category === foodCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, foodSearch, foodCategory]);

  return (
    <div className="billing-page">
      {/* TOP TITLE BAR */}
      <div className="billing-top">
        <div className="billing-title-area">
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={`category-button ${viewMode === "new_bill" ? "active" : ""}`}
              onClick={() => {
                setCurrentStep(1);
                setViewMode("new_bill");
              }}
            >
              <Plus size={14} style={{ marginRight: "4px" }} /> New Bill Wizard
            </button>
            <button
              className={`category-button ${viewMode === "history" ? "active" : ""}`}
              onClick={() => setViewMode("history")}
            >
              <FileText size={14} style={{ marginRight: "4px" }} /> Billing History ({invoices.length})
            </button>
            {selectedInvoice && (
              <button
                className={`category-button ${viewMode === "invoice_details" ? "active" : ""}`}
                onClick={() => setViewMode("invoice_details")}
              >
                <Receipt size={14} style={{ marginRight: "4px" }} /> Invoice Preview ({selectedInvoice.invoice_number})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: BILLING HISTORY */}
      {viewMode === "history" && (
        <div>
          <div className="module-header">
            <div>
              <span className="eyebrow">INVOICE DIRECTORY</span>
              <h1>Billing History & Invoices</h1>
              <p>View, search, print and review all created guest bills and payment statements.</p>
            </div>
            <button
              className="primary-button"
              onClick={() => {
                setCurrentStep(1);
                setViewMode("new_bill");
              }}
            >
              <Plus size={16} /> Create New Bill
            </button>
          </div>

          <div className="metric-strip">
            <div>
              <span>Total Invoices</span>
              <strong>{invoices.length}</strong>
            </div>
            <div>
              <span>Total Revenue</span>
              <strong>
                {money(invoices.reduce((acc, i) => acc + (i.payment_status === "Paid" ? i.total : i.paid_amount), 0))}
              </strong>
            </div>
            <div>
              <span>Paid Invoices</span>
              <strong>{invoices.filter((i) => i.payment_status === "Paid").length}</strong>
            </div>
            <div>
              <span>Pending Balances</span>
              <strong>
                {money(invoices.reduce((acc, i) => acc + i.balance, 0))}
              </strong>
            </div>
          </div>

          <div className="toolbar">
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="filter-tabs">
                {(["All", "Paid", "Pending", "Partially Paid"] as const).map((st) => (
                  <button
                    key={st}
                    className={historyStatusFilter === st ? "active" : ""}
                    onClick={() => setHistoryStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="select-wrapper" style={{ width: "160px", height: "32px" }}>
                <select
                  value={historyRoomFilter}
                  onChange={(e) => setHistoryRoomFilter(e.target.value)}
                  style={{ fontSize: "11px", height: "100%" }}
                >
                  {historyRooms.map((rm) => (
                    <option key={rm} value={rm}>
                      {rm === "All" ? "All Rooms" : rm}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="module-search">
              <Search size={15} />
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search invoice #, guest, room..."
              />
            </div>
          </div>

          <div className="guest-table panel">
            <div
              className="guest-row guest-head"
              style={{ gridTemplateColumns: "1.2fr 1.3fr 0.9fr 0.9fr 1fr 1fr 90px" }}
            >
              <span>Invoice #</span>
              <span>Guest Details</span>
              <span>Room</span>
              <span>Date</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredHistory.length === 0 ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
                No invoices found matching criteria.
              </div>
            ) : (
              filteredHistory.map((inv) => (
                <div
                  className="guest-row"
                  key={inv.id}
                  style={{ gridTemplateColumns: "1.2fr 1.3fr 0.9fr 0.9fr 1fr 1fr 90px" }}
                >
                  <strong className="invoice-number" style={{ fontSize: "12px" }}>
                    {inv.invoice_number}
                  </strong>
                  <div>
                    <strong style={{ display: "block", color: "var(--text)" }}>{inv.guest_name}</strong>
                    <span style={{ fontSize: "9px", color: "var(--muted)" }}>{inv.guest_phone}</span>
                  </div>
                  <span>{inv.room_number}</span>
                  <span>{inv.created_at}</span>
                  <strong style={{ color: "var(--accent)" }}>{money(inv.total)}</strong>
                  <div>
                    <span
                      className={`status-badge ${
                        inv.payment_status === "Paid" ? "paid" : "pending"
                      }`}
                    >
                      {inv.payment_status}
                    </span>
                  </div>
                  <button
                    className="outline-button"
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setViewMode("invoice_details");
                    }}
                    style={{ height: "28px", fontSize: "10px", padding: "0 8px" }}
                  >
                    View Invoice
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: NEW BILL WIZARD (5 STEPS) */}
      {viewMode === "new_bill" && (
        <div>
          <div className="module-header" style={{ marginBottom: "12px" }}>
            <div>
              <span className="eyebrow">STEP {currentStep} OF 5</span>
              <h1>
                {currentStep === 1 && "Guest & Room Stay Details"}
                {currentStep === 2 && "Itemized Charges & Food Menu"}
                {currentStep === 3 && "Bill Adjustments, Taxes & Service Charges"}
                {currentStep === 4 && "Payment Method & Settlement"}
                {currentStep === 5 && "Review & Finalize Invoice"}
              </h1>
              <p>Follow the guided workflow to assemble an accurate hotel guest bill.</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="secondary-button" onClick={() => setViewMode("history")}>
                Cancel
              </button>
              {currentStep > 1 && (
                <button
                  className="secondary-button"
                  onClick={() => setCurrentStep((s) => (s - 1) as Step)}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {currentStep < 5 && (
                <button
                  className="primary-button"
                  onClick={handleNextStep}
                >
                  Next Step <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* STEP INDICATOR BAR */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {[
              { num: 1, title: "1. Guest & Stay" },
              { num: 2, title: "2. Charges" },
              { num: 3, title: "3. Adjustments" },
              { num: 4, title: "4. Payment" },
              { num: 5, title: "5. Review" },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setCurrentStep(st.num as Step)}
                style={{
                  padding: "10px",
                  borderRadius: "9px",
                  border: currentStep === st.num ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: currentStep === st.num ? "linear-gradient(135deg, rgba(113,128,255,0.18), rgba(89,104,232,0.06))" : "var(--surface)",
                  color: currentStep === st.num ? "var(--text)" : "var(--muted)",
                  fontWeight: currentStep === st.num ? 700 : 500,
                  fontSize: "11px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                {st.title}
              </button>
            ))}
          </div>

          {/* STEP 1: CUSTOMER & STAY */}
          {currentStep === 1 && (
            <div className="billing-layout">
              <div className="billing-main">
                <section className="billing-section">
                  <div className="section-heading">
                    <div><span className="section-kicker">BILL TYPE</span><h2>Who is this bill for?</h2></div>
                  </div>
                  <div className="filter-tabs" style={{ marginBottom: 16 }}>
                    <button className={customerType === "hotel_guest" ? "active" : ""} onClick={() => setCustomerType("hotel_guest")}>Hotel Guest</button>
                    <button className={customerType === "restaurant_walkin" ? "active" : ""} onClick={() => setCustomerType("restaurant_walkin")}>Restaurant Walk-in</button>
                  </div>
                  <p style={{ color: "var(--muted)", margin: 0, fontSize: 12 }}>
                    {customerType === "hotel_guest" ? "Accommodation, restaurant and service charges can be combined on one hotel guest invoice." : "Dining-only customer. No room, reservation or hotel stay is required."}
                  </p>
                </section>

                <section className="billing-section">
                  <div className="section-heading">
                    <div><span className="section-kicker">{customerType === "hotel_guest" ? "GUEST IDENTITY" : "DINING CUSTOMER"}</span><h2>{customerType === "hotel_guest" ? "Guest Information" : "Restaurant Customer"}</h2></div>
                    {customerType === "hotel_guest" && <div className="filter-tabs">
                      <button className={guestType === "walkin" ? "active" : ""} onClick={() => { setGuestType("walkin"); setGuestName("Walk-in Guest"); }}>Walk-in Guest</button>
                      <button className={guestType === "existing" ? "active" : ""} onClick={() => { setGuestType("existing"); setGuestName("Rahul Sharma"); setGuestPhone("+91 98765 43210"); setGuestEmail("rahul@example.com"); }}>Existing Guest</button>
                    </div>}
                  </div>
                  <div className="guest-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <div className="field"><label>{customerType === "hotel_guest" ? "Guest Full Name" : "Customer Name"}</label><input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={customerType === "hotel_guest" ? "e.g. Rahul Sharma" : "e.g. Rahul Sharma (optional)"} /></div>
                    <div className="field"><label>Phone Number</label><input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 98765 43210" /></div>
                  </div>
                  <div className="field" style={{ marginTop: 12 }}><label>Email Address</label><input value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="Optional" /></div>
                </section>

                {customerType === "hotel_guest" ? (
                  <section className="billing-section">
                    <div className="section-heading"><div><span className="section-kicker">ROOM ACCOMMODATION</span><h2>Room & Stay Dates</h2></div></div>
                    <div className="guest-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                      <div className="field"><label>Select Room</label><div className="select-wrapper"><select value={selectedRoomNumber} onChange={(e) => setSelectedRoomNumber(e.target.value)}>{ROOM_OPTIONS.map((r) => <option key={r.number} value={r.number}>{r.number} - {r.type} ({money(r.price)}/night) · {r.status}</option>)}</select></div></div>
                      <div className="field"><label>Room Category & Tariff</label><div className="field-display"><BedDouble size={16} /><span>{roomType} · {money(roomPricePerNight)}/night</span></div></div>
                    </div>
                    <div className="guest-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
                      <div className="field"><label>Check-in Date</label><input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} /></div>
                      <div className="field"><label>Check-out Date</label><input type="date" value={checkOutDate} min={checkInDate} onChange={(e) => setCheckOutDate(e.target.value)} /></div>
                    </div>
                  </section>
                ) : (
                  <section className="billing-section">
                    <div className="section-heading"><div><span className="section-kicker">DINING ONLY</span><h2>Restaurant Walk-in</h2></div><Utensils size={18} /></div>
                    <div className="field-display"><Utensils size={16} /><span>No room required. Add restaurant items in the Charges step.</span></div>
                  </section>
                )}
              </div>

              <aside className="billing-sidebar"><section className="summary-card-new">
                <div className="summary-top"><div><span className="section-kicker">{customerType === "hotel_guest" ? "STAY OVERVIEW" : "DINING OVERVIEW"}</span><h2>{customerType === "hotel_guest" ? "Duration Summary" : "Restaurant Bill"}</h2></div><Calendar size={18} /></div>
                <div className="summary-list">
                  <div><span>Customer</span><strong>{guestName || "Walk-in Customer"}</strong></div>
                  <div><span>Room</span><strong>{customerType === "hotel_guest" ? selectedRoomNumber : "N/A"}</strong></div>
                  {customerType === "hotel_guest" && <><div><span>Room Category</span><strong>{roomType}</strong></div><div><span>Stay Duration</span><strong style={{ color: "var(--accent)" }}>{numberOfNights} {numberOfNights === 1 ? "Night" : "Nights"}</strong></div><div><span>Estimated Room Charge</span><strong>{money(numberOfNights * roomPricePerNight)}</strong></div></>}
                  {customerType === "restaurant_walkin" && <div><span>Accommodation</span><strong>Not applicable</strong></div>}
                </div>
                <button className="generate-invoice" onClick={() => setCurrentStep(2)} style={{ marginTop: 16 }}>Proceed to Charges <ChevronRight size={16} /></button>
              </section></aside>
            </div>
          )}

          {/* STEP 2: CHARGES */}
          {currentStep === 2 && (
            <div className="billing-layout">
              <div className="billing-main">
                {/* CURRENT ITEMIZED CHARGES */}
                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">ITEMIZED BILL</span>
                      <h2>Current Added Charges</h2>
                    </div>
                    <span className="item-count">{billItems.length} items</span>
                  </div>

                  <div className="bill-list">
                    {billItems.map((item) => (
                      <div className="bill-row" key={item.id}>
                        <div className="bill-product">
                          <div className="bill-product-image">
                            {item.item_type === "Food" ? (
                              <Utensils size={17} />
                            ) : item.item_type === "Room" ? (
                              <BedDouble size={17} />
                            ) : (
                              <Receipt size={17} />
                            )}
                          </div>
                          <div className="bill-product-info">
                            <strong>{item.description}</strong>
                            <span>{item.item_type}</span>
                          </div>
                        </div>

                        <div className="quantity-box">
                          <button onClick={() => updateItemQty(item.id, -1)}>
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateItemQty(item.id, 1)}>
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="price-editor">
                          <strong>{money(item.quantity * item.unit_price)}</strong>
                        </div>

                        <button className="delete-button" onClick={() => removeItem(item.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* RESTAURANT MENU PICKER */}
                <section className="billing-section restaurant-section">
                  <div className="section-heading restaurant-heading">
                    <div>
                      <span className="section-kicker">RESTAURANT MENU</span>
                      <h2>Add Food & Dining Items</h2>
                      <p>Click any item to add it directly to the guest invoice.</p>
                    </div>

                    <div className="menu-search-box">
                      <Search size={15} />
                      <input
                        value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        placeholder="Search food..."
                      />
                    </div>
                  </div>

                  <div className="category-row">
                    {["All", "Main Course", "Starters", "Indian Bread", "Chinese", "Beverages", "Desserts"].map(
                      (cat) => (
                        <button
                          key={cat}
                          className={`category-button ${foodCategory === cat ? "active" : ""}`}
                          onClick={() => setFoodCategory(cat)}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  <div className="menu-grid-new">
                    {filteredFoodMenu.map((m) => (
                      <div
                        className="food-card"
                        key={m.id}
                        style={{ opacity: m.isAvailable ? 1 : 0.6 }}
                      >
                        <div className="food-image">
                          <img src={m.image} alt={m.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/food/chicken-biryani.svg"; }} />
                          <span className="food-category">{m.category}</span>
                        </div>
                        <div className="food-card-body">
                          <div>
                            <strong>{m.name}</strong>
                            <span>{money(m.price)}</span>
                          </div>
                          <button className="food-add" onClick={() => addFoodToBill(m)}>
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ADD CUSTOM / LAUNDRY / SERVICE CHARGE */}
                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">EXTRA CHARGES</span>
                      <h2>Add Custom Service Charge</h2>
                    </div>
                  </div>

                  <form onSubmit={handleAddCustomCharge} className="guest-grid" style={{ gridTemplateColumns: "1.2fr 0.8fr 0.8fr 0.8fr auto", alignItems: "end" }}>
                    <div className="field">
                      <label>Description</label>
                      <input
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        placeholder="e.g. Express Laundry"
                      />
                    </div>
                    <div className="field">
                      <label>Type</label>
                      <div className="select-wrapper">
                        <select
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value as any)}
                        >
                          <option value="Service">Service</option>
                          <option value="Laundry">Laundry</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </div>
                    </div>
                    <div className="field">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                    <div className="field">
                      <label>Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={customQty}
                        onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                      />
                    </div>
                    <button type="submit" className="primary-button" style={{ height: "39px" }}>
                      <Plus size={15} /> Add
                    </button>
                  </form>
                </section>
              </div>

              {/* SIDEBAR SUMMARY FOR STEP 2 */}
              <aside className="billing-sidebar">
                <section className="summary-card-new">
                  <div className="summary-top">
                    <div>
                      <span className="section-kicker">CHARGES SUMMARY</span>
                      <h2>Running Subtotal</h2>
                    </div>
                    <DollarSign size={18} />
                  </div>

                  <div className="summary-list">
                    <div>
                      <span>Total Items</span>
                      <strong>{billItems.length}</strong>
                    </div>
                    <div>
                      <span>Subtotal</span>
                      <strong style={{ fontSize: "16px", color: "var(--accent)" }}>
                        {money(calcResult.subtotal)}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="generate-invoice"
                    onClick={() => setCurrentStep(3)}
                    style={{ marginTop: "16px" }}
                  >
                    Proceed to Adjustments <ChevronRight size={16} />
                  </button>
                </section>
              </aside>
            </div>
          )}

          {/* STEP 3: ADJUSTMENTS */}
          {currentStep === 3 && (
            <div className="billing-layout">
              <div className="billing-main">
                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">TAX & DISCOUNTS</span>
                      <h2>Discounts, GST, and Service Charges</h2>
                      <p>Adjust bill taxes and promotional discounts. Calculations update automatically.</p>
                    </div>
                  </div>

                  <div className="guest-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div className="field">
                      <label>Discount Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>

                    <div className="field">
                      <label>GST Tax Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="28"
                        value={gstRate}
                        onChange={(e) => setGstRate(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>

                    <div className="field">
                      <label>Service Charge Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={serviceChargeRate}
                        onChange={(e) => setServiceChargeRate(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                </section>

                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">CALCULATION VERIFICATION</span>
                      <h2>Detailed Breakdown</h2>
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--green)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={14} /> FastAPI Calculation Synchronized
                    </span>
                  </div>

                  <div className="summary-list" style={{ padding: "10px 0" }}>
                    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>Subtotal of all items</span>
                      <strong>{money(calcResult.subtotal)}</strong>
                    </div>
                    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>Applied Discount</span>
                      <strong style={{ color: "var(--green)" }}>-{money(calcResult.discount)}</strong>
                    </div>
                    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>Taxable Amount</span>
                      <strong>{money(calcResult.taxable_amount)}</strong>
                    </div>
                    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>Service Charge ({serviceChargeRate}%)</span>
                      <strong>{money(calcResult.service_charge)}</strong>
                    </div>
                    <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <span>GST ({gstRate}%)</span>
                      <strong>{money(calcResult.tax)}</strong>
                    </div>
                    <div style={{ padding: "12px 0 0" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>Final Payable Total</span>
                      <strong style={{ fontSize: "20px", color: "var(--accent)" }}>{money(calcResult.total)}</strong>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="billing-sidebar">
                <section className="summary-card-new">
                  <div className="summary-top">
                    <div>
                      <span className="section-kicker">PAYABLE TOTAL</span>
                      <h2>Net Amount</h2>
                    </div>
                  </div>
                  <div className="total-card">
                    <span>Grand Total</span>
                    <strong>{money(calcResult.total)}</strong>
                  </div>
                  <button
                    className="generate-invoice"
                    onClick={() => setCurrentStep(4)}
                    style={{ marginTop: "16px" }}
                  >
                    Proceed to Payment <ChevronRight size={16} />
                  </button>
                </section>
              </aside>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {currentStep === 4 && (
            <div className="billing-layout">
              <div className="billing-main">
                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">SETTLEMENT</span>
                      <h2>Payment Method & Amount</h2>
                    </div>
                  </div>

                  <div className="payment-heading">Select Method</div>
                  <div className="payment-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    {(["UPI", "Card", "Cash", "Split"] as const).map((m) => (
                      <button
                        key={m}
                        className={`payment-button ${paymentMethod === m ? "active" : ""}`}
                        onClick={() => setPaymentMethod(m)}
                      >
                        {paymentMethod === m && <Check size={12} />} {m}
                      </button>
                    ))}
                  </div>

                  <div className="guest-grid" style={{ gridTemplateColumns: "1fr 1fr", marginTop: "16px" }}>
                    <div className="field">
                      <label>Amount Paid (₹)</label>
                      <input
                        type="number"
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                    <div className="field">
                      <label>Payment Status</label>
                      <div className="select-wrapper">
                        <select
                          value={paymentStatus}
                          onChange={(e) => setPaymentStatus(e.target.value as any)}
                        >
                          <option value="Paid">Fully Paid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Pending">Pending / Unpaid</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="billing-sidebar">
                <section className="summary-card-new">
                  <div className="summary-top">
                    <div>
                      <span className="section-kicker">PAYMENT STATUS</span>
                      <h2>Balance Details</h2>
                    </div>
                    <CreditCard size={18} />
                  </div>
                  <div className="summary-list">
                    <div>
                      <span>Total Invoice</span>
                      <strong>{money(calcResult.total)}</strong>
                    </div>
                    <div>
                      <span>Amount Paid</span>
                      <strong style={{ color: "var(--green)" }}>
                        {money(typeof paidAmount === "number" ? paidAmount : calcResult.total)}
                      </strong>
                    </div>
                    <div>
                      <span>Remaining Balance</span>
                      <strong style={{ color: "var(--amber)" }}>
                        {money(
                          Math.max(
                            0,
                            calcResult.total - (typeof paidAmount === "number" ? paidAmount : calcResult.total)
                          )
                        )}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="generate-invoice"
                    onClick={() => setCurrentStep(5)}
                    style={{ marginTop: "16px" }}
                  >
                    Review Final Invoice <ChevronRight size={16} />
                  </button>
                </section>
              </aside>
            </div>
          )}

          {/* STEP 5: REVIEW & GENERATE */}
          {currentStep === 5 && (
            <div className="billing-layout">
              <div className="billing-main">
                <section className="billing-section">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">FINAL CONFIRMATION</span>
                      <h2>Bill Review Before Generation</h2>
                      <p>Verify guest info, dates, charges, and settlement details.</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ background: "var(--surface)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>Guest & Room</span>
                      <strong style={{ display: "block", fontSize: "14px", marginTop: "4px" }}>{guestName || "Walk-in Guest"}</strong>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {selectedRoomNumber} ({roomType}) · {numberOfNights} Nights ({checkInDate} to {checkOutDate})
                      </span>
                    </div>

                    <div style={{ background: "var(--surface)", padding: "14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>Payment Summary</span>
                      <strong style={{ display: "block", fontSize: "14px", marginTop: "4px", color: "var(--accent)" }}>{money(calcResult.total)}</strong>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                        Method: {paymentMethod} · Status: {paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="bill-list">
                    {billItems.map((item) => (
                      <div className="bill-row" key={item.id} style={{ gridTemplateColumns: "1fr 100px 100px" }}>
                        <div>
                          <strong>{item.description}</strong>
                          <span style={{ fontSize: "9px", color: "var(--muted)" }}>{item.item_type}</span>
                        </div>
                        <span style={{ fontSize: "11px" }}>Qty: {item.quantity}</span>
                        <strong style={{ textAlign: "right" }}>{money(item.quantity * item.unit_price)}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="billing-sidebar">
                <section className="summary-card-new">
                  <div className="summary-top">
                    <div>
                      <span className="section-kicker">ACTION</span>
                      <h2>Generate Invoice</h2>
                    </div>
                    <CheckCircle2 size={20} style={{ color: "var(--green)" }} />
                  </div>

                  <button
                    className="generate-invoice"
                    onClick={handleGenerateInvoice}
                    style={{ height: "46px", fontSize: "12px", marginTop: "16px" }}
                  >
                    <Receipt size={18} /> Confirm & Generate Invoice
                  </button>
                </section>
              </aside>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: INVOICE DETAILS (PROFESSIONAL HOTEL INVOICE) */}
      {viewMode === "invoice_details" && selectedInvoice && (
        <div>
          <div className="billing-top" style={{ marginBottom: "12px" }}>
            <div className="billing-title-area">
              <button className="back-button" onClick={() => setViewMode("history")}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <span className="eyebrow">OFFICIAL INVOICE</span>
                <h1>Invoice {selectedInvoice.invoice_number}</h1>
                <p>Commercial Hotel Tax Invoice & Statement.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button className="outline-button" onClick={() => window.print()}>
                <Printer size={15} /> Print Invoice
              </button>
              <button className="outline-button" onClick={() => window.print()}>
                <Download size={15} /> Download PDF
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setCurrentStep(1);
                  setViewMode("new_bill");
                }}
              >
                <Plus size={15} /> New Bill
              </button>
            </div>
          </div>

          {/* PRINTABLE INVOICE CARD */}
          <div
            id="printable-invoice"
            style={{
              background: "#101622",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "36px",
              maxWidth: "880px",
              margin: "0 auto 30px",
              color: "#e8ebf2",
            }}
          >
            {/* INVOICE HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "24px",
                marginBottom: "24px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #7180ff, #5664df)",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      color: "#fff",
                      fontSize: "18px",
                    }}
                  >
                    H
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{hotelProfile.hotelName}</h2>
                    <span style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.1em" }}>
                      LUXURY HOSPITALITY & SUITES
                    </span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "11px", color: "var(--muted2)", lineHeight: 1.5 }}>
                  {hotelProfile.address}
                  <br />
                  Phone: {hotelProfile.phone} · Email: {hotelProfile.email}
                  <br />
                  GSTIN: {hotelProfile.gstin}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>
                  TAX INVOICE
                </span>
                <h2 style={{ margin: "4px 0", fontSize: "22px", color: "var(--accent)" }}>
                  {selectedInvoice.invoice_number}
                </h2>
                <span style={{ fontSize: "11px", color: "var(--muted2)", display: "block" }}>
                  Date: {selectedInvoice.created_at}
                </span>
                <span
                  className={`status-badge ${
                    selectedInvoice.payment_status === "Paid" ? "paid" : "pending"
                  }`}
                  style={{ marginTop: "8px", display: "inline-block" }}
                >
                  {selectedInvoice.payment_status}
                </span>
              </div>
            </div>

            {/* GUEST & ROOM INFO GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                padding: "16px",
                background: "var(--surface)",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                marginBottom: "24px",
              }}
            >
              <div>
                <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>
                  {selectedInvoice.room_number === "N/A" ? "CUSTOMER DETAILS" : "GUEST DETAILS"}
                </span>
                <strong style={{ display: "block", fontSize: "14px", color: "var(--text)", marginTop: "4px" }}>
                  {selectedInvoice.guest_name}
                </strong>
                <span style={{ fontSize: "11px", color: "var(--muted2)", display: "block" }}>
                  Phone: {selectedInvoice.guest_phone}
                </span>
                <span style={{ fontSize: "11px", color: "var(--muted2)", display: "block" }}>
                  Email: {selectedInvoice.guest_email || "N/A"}
                </span>
              </div>

              <div>
                <span style={{ fontSize: "9px", color: "var(--muted)", textTransform: "uppercase" }}>
                  {selectedInvoice.room_number === "N/A" ? "DINING CUSTOMER" : "ACCOMMODATION"}
                </span>
                <strong style={{ display: "block", fontSize: "14px", color: "var(--text)", marginTop: "4px" }}>
                  {selectedInvoice.room_number === "N/A" ? "Restaurant Walk-in · No Room" : `${selectedInvoice.room_number} (${selectedInvoice.room_type})`}
                </strong>
                {selectedInvoice.room_number !== "N/A" && <>
                  <span style={{ fontSize: "11px", color: "var(--muted2)", display: "block" }}>Check-in: {selectedInvoice.check_in} · Check-out: {selectedInvoice.check_out}</span>
                  <span style={{ fontSize: "11px", color: "var(--muted2)", display: "block" }}>Duration: {selectedInvoice.nights} {selectedInvoice.nights === 1 ? "Night" : "Nights"}</span>
                </>}
              </div>
            </div>

            {/* ITEMIZED CHARGES TABLE */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "24px",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid var(--border)",
                    color: "var(--muted)",
                    fontSize: "10px",
                    textTransform: "uppercase",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "10px 8px" }}>DESCRIPTION</th>
                  <th style={{ padding: "10px 8px" }}>TYPE</th>
                  <th style={{ padding: "10px 8px", textAlign: "center" }}>QTY</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>RATE</th>
                  <th style={{ padding: "10px 8px", textAlign: "right" }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 600 }}>{item.description}</td>
                    <td style={{ padding: "12px 8px", color: "var(--muted)" }}>{item.item_type}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right" }}>{money(item.unit_price)}</td>
                    <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: 700 }}>
                      {money(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* INVOICE TOTALS BREAKDOWN */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
              <div style={{ width: "280px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "var(--muted2)" }}>
                  <span>Subtotal</span>
                  <span>{money(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "var(--green)" }}>
                    <span>Discount</span>
                    <span>-{money(selectedInvoice.discount)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "var(--muted2)" }}>
                  <span>Taxable Amount</span>
                  <span>{money(selectedInvoice.taxable_amount)}</span>
                </div>
                {selectedInvoice.service_charge > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "var(--muted2)" }}>
                    <span>Service Charge ({selectedInvoice.service_charge_rate}%)</span>
                    <span>{money(selectedInvoice.service_charge)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "11px", color: "var(--muted2)" }}>
                  <span>GST ({selectedInvoice.tax_rate}%)</span>
                  <span>{money(selectedInvoice.tax)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 0 6px",
                    borderTop: "2px solid var(--border)",
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "var(--accent)",
                  }}
                >
                  <span>Grand Total</span>
                  <span>{money(selectedInvoice.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", color: "var(--green)" }}>
                  <span>Paid Amount ({selectedInvoice.payment_method})</span>
                  <span>{money(selectedInvoice.paid_amount)}</span>
                </div>
                {selectedInvoice.balance > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", color: "var(--red)" }}>
                    <span>Balance Due</span>
                    <span>{money(selectedInvoice.balance)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* INVOICE FOOTER */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "10px",
                color: "var(--muted)",
              }}
            >
              <div>
                <strong>Thank you for staying with {hotelProfile.hotelName}!</strong>
                <p style={{ margin: "2px 0 0" }}>This is a computer generated tax invoice.</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
