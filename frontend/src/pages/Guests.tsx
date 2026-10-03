import { useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  X,
  CheckCircle2,
} from "lucide-react";

type Guest = {
  id: number;
  name: string;
  room: string;
  phone: string;
  email: string;
  stay: string;
  status: "Checked In" | "Reserved" | "Checked Out";
  stayHistoryCount: number;
  totalBillingAmount: number;
};

const initialGuests: Guest[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    room: "Room 102",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    stay: "10 Feb - 12 Feb 2025",
    status: "Checked In",
    stayHistoryCount: 3,
    totalBillingAmount: 14850,
  },
  {
    id: 2,
    name: "Ananya Rao",
    room: "Room 201",
    phone: "+91 98450 11223",
    email: "ananya.rao@example.com",
    stay: "08 Feb - 11 Feb 2025",
    status: "Checked In",
    stayHistoryCount: 2,
    totalBillingAmount: 22400,
  },
  {
    id: 3,
    name: "Vikram Singh",
    room: "Room 204",
    phone: "+91 99887 12345",
    email: "vikram.singh@example.com",
    stay: "11 Feb - 13 Feb 2025",
    status: "Checked In",
    stayHistoryCount: 1,
    totalBillingAmount: 6900,
  },
  {
    id: 4,
    name: "Sneha Patil",
    room: "Room 301",
    phone: "+91 99123 45678",
    email: "sneha.patil@example.com",
    stay: "14 Feb - 18 Feb 2025",
    status: "Reserved",
    stayHistoryCount: 4,
    totalBillingAmount: 34500,
  },
];

const money = (v: number) => `₹${v.toLocaleString("en-IN")}`;

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newRoom, setNewRoom] = useState("Room 101");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filtered = useMemo(() => {
    return guests.filter((g) =>
      `${g.name} ${g.room} ${g.phone} ${g.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [guests, search]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const g: Guest = {
      id: Date.now(),
      name: newName.trim(),
      room: newRoom,
      phone: newPhone.trim() || "+91 98765 00000",
      email: newEmail.trim() || "guest@example.com",
      stay: "12 Feb - 15 Feb 2025",
      status: "Checked In",
      stayHistoryCount: 1,
      totalBillingAmount: 4500,
    };
    setGuests([g, ...guests]);
    setIsAddModalOpen(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div>
          <span className="eyebrow">GUEST DIRECTORY</span>
          <h1>Guest Profile Management</h1>
          <p>Track guest stays, contact profiles, reservation schedules, and billing histories.</p>
        </div>
        <button className="primary-button" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Guest Profile
        </button>
      </div>

      <div className="metric-strip">
        <div>
          <span>Total Guests</span>
          <strong>{guests.length}</strong>
        </div>
        <div>
          <span>Currently Checked In</span>
          <strong>{guests.filter((g) => g.status === "Checked In").length}</strong>
        </div>
        <div>
          <span>Reservations</span>
          <strong>{guests.filter((g) => g.status === "Reserved").length}</strong>
        </div>
        <div>
          <span>Lifetime Revenue</span>
          <strong>{money(guests.reduce((acc, g) => acc + g.totalBillingAmount, 0))}</strong>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-title">Guest Registry</div>
        <div className="module-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest name, room, or phone..."
          />
        </div>
      </div>

      <div className="guest-table panel">
        <div className="guest-row guest-head" style={{ gridTemplateColumns: "1.3fr 0.8fr 1.2fr 1fr 0.8fr 0.8fr 40px" }}>
          <span>Guest</span>
          <span>Room</span>
          <span>Contact Info</span>
          <span>Stay Dates</span>
          <span>Lifetime Value</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.map((g) => (
          <div className="guest-row" key={g.id} style={{ gridTemplateColumns: "1.3fr 0.8fr 1.2fr 1fr 0.8fr 0.8fr 40px" }}>
            <div className="guest-cell">
              <div className="guest-avatar">
                <UserRound size={15} />
              </div>
              <div>
                <strong>{g.name}</strong>
                <span>{g.stayHistoryCount} Previous Stays</span>
              </div>
            </div>

            <strong style={{ color: "var(--accent)" }}>{g.room}</strong>

            <div className="contact-cell">
              <span>
                <Phone size={12} /> {g.phone}
              </span>
              <span>
                <Mail size={12} /> {g.email}
              </span>
            </div>

            <span>{g.stay}</span>
            <strong style={{ fontSize: "11px" }}>{money(g.totalBillingAmount)}</strong>

            <div>
              <span className={`status-badge ${g.status === "Checked In" ? "paid" : "pending"}`}>
                {g.status}
              </span>
            </div>

            <button className="table-action" onClick={() => setEditing(g)}>
              <Edit3 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* EDIT GUEST MODAL */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">GUEST PROFILE</span>
                <h2>{editing.name}</h2>
              </div>
              <button className="modal-close" onClick={() => setEditing(null)}>
                <X size={17} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>
                Full Name
                <input
                  value={editing.name}
                  onChange={(e) =>
                    setGuests((gs) =>
                      gs.map((g) => (g.id === editing.id ? { ...g, name: e.target.value } : g))
                    )
                  }
                />
              </label>

              <label>
                Assigned Room
                <input
                  value={editing.room}
                  onChange={(e) =>
                    setGuests((gs) =>
                      gs.map((g) => (g.id === editing.id ? { ...g, room: e.target.value } : g))
                    )
                  }
                />
              </label>

              <label>
                Phone Number
                <input
                  value={editing.phone}
                  onChange={(e) =>
                    setGuests((gs) =>
                      gs.map((g) => (g.id === editing.id ? { ...g, phone: e.target.value } : g))
                    )
                  }
                />
              </label>

              <label>
                Email Address
                <input
                  value={editing.email}
                  onChange={(e) =>
                    setGuests((gs) =>
                      gs.map((g) => (g.id === editing.id ? { ...g, email: e.target.value } : g))
                    )
                  }
                />
              </label>

              <div className="modal-actions">
                <button className="secondary-button" onClick={() => setEditing(null)}>
                  Close
                </button>
                <button className="primary-button" onClick={() => setEditing(null)}>
                  <CheckCircle2 size={15} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD GUEST MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="eyebrow">NEW GUEST REGISTRATION</span>
                <h2>Register Guest</h2>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleAddGuest} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label>
                Full Name
                <input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />
              </label>

              <div className="two-fields">
                <label>
                  Phone Number
                  <input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>

                <label>
                  Room
                  <select value={newRoom} onChange={(e) => setNewRoom(e.target.value)}>
                    <option value="Room 101">Room 101</option>
                    <option value="Room 102">Room 102</option>
                    <option value="Room 201">Room 201</option>
                    <option value="Room 202">Room 202</option>
                    <option value="Room 301">Room 301</option>
                  </select>
                </label>
              </div>

              <label>
                Email Address
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="guest@example.com"
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={15} /> Register Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
