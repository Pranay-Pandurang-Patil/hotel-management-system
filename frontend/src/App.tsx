import "./App.css";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  BedDouble,
  Users,
  Utensils,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";

import Billing from "./pages/Billing";
import Rooms from "./pages/Rooms";
import Guests from "./pages/Guests";
import Restaurant from "./pages/Restaurant";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import { loadRooms, getRoomCounts } from "./data/roomData";
import LoginPage from "./pages/LoginPage";

type Page =
  | "Dashboard"
  | "Billing"
  | "Rooms"
  | "Guests"
  | "Restaurant"
  | "Payments"
  | "Reports"
  | "Settings";

type NavItem = {
  label: Page;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Billing", icon: Receipt },
  { label: "Rooms", icon: BedDouble },
  { label: "Guests", icon: Users },
  { label: "Restaurant", icon: Utensils },
  { label: "Payments", icon: CreditCard },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: SettingsIcon },
];

function StatCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon size={18} />
        </div>
        <div className={`stat-change ${positive ? "positive" : "negative"}`}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {change}
        </div>
      </div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "12M">("7D");

  const revenueData = useMemo(() => {
    if (timeRange === "7D") {
      return {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [48250, 56100, 42800, 68400, 75200, 89300, 81500],
        formatted: ["₹48.2k", "₹56.1k", "₹42.8k", "₹68.4k", "₹75.2k", "₹89.3k", "₹81.5k"],
      };
    } else if (timeRange === "30D") {
      return {
        labels: ["W1", "W2", "W3", "W4"],
        values: [320000, 385000, 412000, 460000],
        formatted: ["₹3.20L", "₹3.85L", "₹4.12L", "₹4.60L"],
      };
    } else {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        values: [1250000, 1420000, 1380000, 1550000, 1680000, 1820000, 1950000, 1890000, 2050000, 2180000, 2350000, 2580000],
        formatted: ["₹12.5L", "₹14.2L", "₹13.8L", "₹15.5L", "₹16.8L", "₹18.2L", "₹20.5L", "₹21.8L", "₹23.5L", "₹25.8L"],
      };
    }
  }, [timeRange]);

  const maxVal = Math.max(...revenueData.values);
  const minVal = Math.min(...revenueData.values);
  const points = useMemo(() => {
    return revenueData.values
      .map((val, index) => {
        const x = (index / (revenueData.values.length - 1)) * 100;
        const normalized = maxVal === minVal ? 50 : ((val - minVal) / (maxVal - minVal)) * 60 + 20;
        const y = 100 - normalized;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [revenueData, maxVal, minVal]);

  const transactions = [
    ["#INV-1048", "Rahul Sharma", "Room 301", "₹4,850", "Paid"],
    ["#INV-1047", "Ananya Rao", "Room 202", "₹7,200", "Paid"],
    ["#INV-1046", "Vikram Singh", "Room 203", "₹3,450", "Pending"],
    ["#INV-1045", "Sneha Patil", "Room 108", "₹5,600", "Paid"],
  ];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW & ANALYTICS</span>
          <h1>Hotel Operations Dashboard</h1>
          <p>Real-time monitor of hotel revenue, room occupancy, and guest billing activities.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate("Billing")}>
          <Receipt size={16} /> New Bill Wizard
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Today's Revenue" value="₹48,250" change="12.5%" positive icon={Receipt} />
        <StatCard title="Occupied Rooms" value={`${getRoomCounts(loadRooms()).occupied} / ${getRoomCounts(loadRooms()).total}`} change="Live" positive icon={BedDouble} />
        <StatCard title="Today's Guests" value="67" change="8.4%" positive icon={Users} />
        <StatCard title="Pending Payments" value="₹12,480" change="4.1%" positive={false} icon={CreditCard} />
      </div>

      <div className="dashboard-grid">
        {/* REVENUE CHART */}
        <div className="panel revenue-panel">
          <div className="panel-header">
            <div>
              <h2>Revenue Trend Overview</h2>
              <p>Financial revenue performance across selected timeline</p>
            </div>
            <div className="filter-tabs">
              {(["7D", "30D", "12M"] as const).map((r) => (
                <button
                  key={r}
                  className={timeRange === r ? "active" : ""}
                  onClick={() => setTimeRange(r)}
                  style={{ height: "26px", fontSize: "10px" }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-area" style={{ height: "230px" }}>
            <div className="chart-grid-lines">
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg className="revenue-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7080ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#7080ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,100 ${points} 100,100`} fill="url(#areaFill)" />
              <polyline
                points={points}
                fill="none"
                stroke="#7482ff"
                strokeWidth="2.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className="chart-labels"
              style={{
                gridTemplateColumns: `repeat(${revenueData.labels.length}, 1fr)`,
              }}
            >
              {revenueData.labels.map((lbl, idx) => (
                <div key={lbl} style={{ textAlign: "center" }}>
                  <span style={{ display: "block" }}>{lbl}</span>
                  <strong style={{ fontSize: "8px", color: "var(--accent)" }}>
                    {revenueData.formatted[idx]}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OCCUPANCY PANEL */}
        <div className="panel occupancy-panel">
          <div className="panel-header">
            <div>
              <h2>Live Room Occupancy</h2>
              <p>Occupancy ratio across hotel floors</p>
            </div>
          </div>
          <div className="occupancy-content">
            <div className="occupancy-ring">
              <div className="occupancy-inner">
                <strong>{Math.round((getRoomCounts(loadRooms()).occupied / Math.max(1, getRoomCounts(loadRooms()).total)) * 100)}%</strong>
                <span>Occupied</span>
              </div>
            </div>
            <div className="occupancy-details">
              <div>
                <span className="dot occupied" />
                <span>Occupied</span>
                <strong>{getRoomCounts(loadRooms()).occupied}</strong>
              </div>
              <div>
                <span className="dot available" />
                <span>Available</span>
                <strong>{getRoomCounts(loadRooms()).available}</strong>
              </div>
              <div>
                <span className="dot" style={{ background: "var(--amber)" }} />
                <span>Housekeeping</span>
                <strong>{getRoomCounts(loadRooms()).cleaning + getRoomCounts(loadRooms()).maintenance}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="panel transactions-panel">
        <div className="panel-header">
          <div>
            <h2>Recent Billing Transactions</h2>
            <p>Latest guest payments and generated invoices</p>
          </div>
          <button className="text-button" onClick={() => onNavigate("Billing")}>
            View all invoices <ChevronRight size={13} style={{ verticalAlign: "middle" }} />
          </button>
        </div>

        <div className="transactions-table">
          <div className="transaction-row transaction-head">
            <span>Invoice #</span>
            <span>Guest Name</span>
            <span>Room</span>
            <span>Amount</span>
            <span>Payment Status</span>
          </div>

          {transactions.map((t) => (
            <div className="transaction-row" key={t[0]}>
              <span className="invoice-number">{t[0]}</span>
              <span>{t[1]}</span>
              <span>{t[2]}</span>
              <strong>{t[3]}</strong>
              <span className={`status-badge ${t[4].toLowerCase()}`}>{t[4]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(() =>
    sessionStorage.getItem("hotelos_authenticated") === "true" ||
    localStorage.getItem("hotelos_remember") === "true",
  );
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Payment pending", description: "₹12,480 is awaiting settlement.", time: "8 min ago", unread: true },
    { id: 2, title: "Housekeeping update", description: "3 rooms are ready for inspection.", time: "24 min ago", unread: true },
    { id: 3, title: "Restaurant alert", description: "Chicken Biryani stock is running low.", time: "1 hr ago", unread: true },
    { id: 4, title: "Upcoming arrivals", description: "6 guests are arriving in the next 2 hours.", time: "2 hrs ago", unread: false },
  ]);

  const navigate = (page: Page) => {
    setActivePage(page);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  const unreadCount = notifications.filter((item) => item.unread).length;
  const markAllRead = () => setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
  const logout = () => {
    sessionStorage.removeItem("hotelos_authenticated");
    localStorage.removeItem("hotelos_remember");
    setAuthenticated(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">HotelOS</div>
            <div className="brand-subtitle">GRAND HOTEL SYSTEM</div>
          </div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-label">MAIN NAVIGATION</div>
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  className={`nav-item ${activePage === item.label ? "active" : ""}`}
                  onClick={() => navigate(item.label)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="hotel-status">
            <span className="online-dot" />
            <div>
              <strong>Hotel Server Online</strong>
              <span>FastAPI + SQLite Active</span>
            </div>
          </div>
          <button className="nav-item logout" onClick={logout}>
            <LogOut size={18} />
            <span>Administrator Logout</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>

          <div className="topbar-search">
            <Search size={16} />
            <input placeholder="Search guest, invoice #, room or food..." />
          </div>

          <div className="topbar-right">
            <div className="notification-wrap">
              <button className="notification-button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Open notifications">
                <Bell size={18} />
                {unreadCount > 0 && <span>{unreadCount}</span>}
              </button>
              {notificationsOpen && (
                <div className="notification-panel">
                  <div className="notification-panel-header"><div><strong>Notifications</strong><small>{unreadCount} unread</small></div><button onClick={markAllRead}>Mark all read</button></div>
                  <div className="notification-list">
                    {notifications.map((item) => <button key={item.id} className={`notification-item ${item.unread ? "unread" : ""}`} onClick={() => setNotifications((items) => items.map((n) => n.id === item.id ? { ...n, unread: false } : n))}><span className="notification-dot" /><div><strong>{item.title}</strong><p>{item.description}</p><small>{item.time}</small></div></button>)}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile">
              <div className="avatar">AD</div>
              <div className="user-info">
                <strong>Hotel Manager</strong>
                <span>System Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <section className="content">
          {activePage === "Dashboard" && <Dashboard onNavigate={navigate} />}
          {activePage === "Billing" && <Billing />}
          {activePage === "Rooms" && <Rooms />}
          {activePage === "Guests" && <Guests />}
          {activePage === "Restaurant" && <Restaurant />}
          {activePage === "Payments" && <Payments />}
          {activePage === "Reports" && <Reports />}
          {activePage === "Settings" && <SettingsPage />}
        </section>
      </main>
    </div>
  );
}

export default App;
