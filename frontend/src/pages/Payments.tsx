import { CreditCard, Download, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";

const initialPayments = [
  ["PAY-2081", "#INV-1048", "Rahul Sharma", "₹4,850", "UPI", "12 Feb 2025", "Paid"],
  ["PAY-2080", "#INV-1047", "Ananya Rao", "₹7,200", "Card", "11 Feb 2025", "Paid"],
  ["PAY-2079", "#INV-1046", "Vikram Singh", "₹3,450", "Cash", "13 Feb 2025", "Pending"],
  ["PAY-2078", "#INV-1045", "Sneha Patil", "₹5,600", "UPI", "13 Feb 2025", "Paid"],
  ["PAY-2077", "#INV-1044", "Arjun Mehta", "₹2,980", "Card", "10 Feb 2025", "Paid"],
];

export default function Payments() {
  const [payments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    return payments.filter(
      (p) => (status === "All" || p[6] === status) && p.join(" ").toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search, status]);

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">TRANSACTIONS & SETTLEMENTS</span>
          <h1>Payment History & Collections</h1>
          <p>Monitor revenue collections, pending guest balances, and payment gateway methods.</p>
        </div>
        <button className="primary-button" onClick={() => window.print()}>
          <Download size={15} /> Export Statement
        </button>
      </div>

      <div className="metric-strip">
        <div>
          <span>Collected Today</span>
          <strong>₹21,680</strong>
        </div>
        <div>
          <span>Pending Balances</span>
          <strong>₹3,450</strong>
        </div>
        <div>
          <span>UPI Share</span>
          <strong>42%</strong>
        </div>
        <div>
          <span>Card Share</span>
          <strong>35%</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={status === "All" ? "active" : ""} onClick={() => setStatus("All")}>
            All
          </button>
          <button className={status === "Paid" ? "active" : ""} onClick={() => setStatus("Paid")}>
            Paid
          </button>
          <button className={status === "Pending" ? "active" : ""} onClick={() => setStatus("Pending")}>
            Pending
          </button>
        </div>

        <div className="module-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction ID, invoice # or guest..."
          />
        </div>
      </div>

      <div className="payment-table panel">
        <div className="payment-row payment-head">
          <span>Payment ID</span>
          <span>Invoice Ref</span>
          <span>Guest</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Date</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.map((p) => (
          <div className="payment-row" key={p[0]}>
            <div>
              <strong>{p[0]}</strong>
              <span>
                <CreditCard size={12} /> Transaction
              </span>
            </div>
            <span className="invoice-number">{p[1]}</span>
            <strong>{p[2]}</strong>
            <strong style={{ color: "var(--accent)" }}>{p[3]}</strong>
            <span className="method-pill">{p[4]}</span>
            <span>{p[5]}</span>
            <span className={`status-badge ${p[6] === "Paid" ? "paid" : "pending"}`}>{p[6]}</span>
            <button className="table-action" onClick={() => alert(`Payment ${p[0]} verified via ${p[4]}`)}>
              <Eye size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
