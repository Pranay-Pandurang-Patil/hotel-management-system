import { useMemo, useState } from "react";
import { CalendarCheck, CheckCircle2, Edit3, Plus, Search, UserRound, X, Trash2 } from "lucide-react";
import { loadRooms, persistRooms, type Room, type RoomStatus } from "../data/roomData";

const money = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const blankRoom: Room = { id: 0, number: "", type: "Standard Deluxe", floor: "Ground Floor", price: 2200, status: "Available" };

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>(loadRooms());
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Room | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Room>(blankRoom);

  const counts = useMemo(() => ({
    All: rooms.length,
    Occupied: rooms.filter((r) => r.status === "Occupied").length,
    Available: rooms.filter((r) => r.status === "Available").length,
    Reserved: rooms.filter((r) => r.status === "Reserved").length,
    Cleaning: rooms.filter((r) => r.status === "Cleaning").length,
    Maintenance: rooms.filter((r) => r.status === "Maintenance").length,
  }), [rooms]);

  const filtered = useMemo(() => rooms.filter((room) => {
    const matchesFilter = filter === "All" || room.status === filter;
    const q = search.toLowerCase();
    return matchesFilter && `${room.number} ${room.type} ${room.floor} ${room.guest ?? ""}`.toLowerCase().includes(q);
  }), [rooms, filter, search]);

  const openEdit = (room: Room) => { setEditing(room); setForm({ ...room }); setIsAdding(false); };
  const openAdd = () => { setEditing(null); setForm({ ...blankRoom, id: Date.now() }); setIsAdding(true); };
  const closeModal = () => { setEditing(null); setIsAdding(false); };

  const saveRoom = () => {
    const number = form.number.trim();
    if (!number) return alert("Enter a room number.");
    if (!/^[A-Za-z0-9-]+$/.test(number)) return alert("Room number can contain letters, numbers and hyphens only.");
    const duplicate = rooms.some((r) => r.number.toLowerCase() === number.toLowerCase() && r.id !== form.id);
    if (duplicate) return alert(`Room ${number} already exists.`);
    if (form.price <= 0) return alert("Room tariff must be greater than zero.");
    const next = isAdding ? [...rooms, { ...form, number }] : rooms.map((r) => r.id === form.id ? { ...form, number } : r);
    setRooms(next); persistRooms(next); closeModal();
  };

  const deleteRoom = () => {
    if (!editing) return;
    if (editing.status === "Occupied" || editing.status === "Reserved") return alert("Occupied or reserved rooms cannot be deleted. Change the room status first.");
    if (!confirm(`Delete room ${editing.number}?`)) return;
    const next = rooms.filter((r) => r.id !== editing.id); setRooms(next); persistRooms(next); closeModal();
  };

  return (
    <div className="module-page">
      <div className="module-header">
        <div><span className="eyebrow">HOTEL ROOM BOARD</span><h1>Room & Housekeeping Operations</h1><p>Manage the actual room inventory, room numbers, tariffs, occupancy and housekeeping state.</p></div>
        <button className="primary-button" onClick={openAdd}><Plus size={16} /> Add Room</button>
      </div>

      <div className="metric-strip">
        <div><span>Total Rooms</span><strong>{rooms.length}</strong></div>
        <div><span>Occupied</span><strong>{counts.Occupied}</strong></div>
        <div><span>Available</span><strong>{counts.Available}</strong></div>
        <div><span>Reserved</span><strong>{counts.Reserved}</strong></div>
        <div><span>Attention</span><strong>{counts.Cleaning + counts.Maintenance}</strong></div>
      </div>

      <div className="toolbar">
        <div className="filter-tabs">{Object.keys(counts).map((key) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{key} <b>{counts[key as keyof typeof counts]}</b></button>)}</div>
        <div className="module-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search room number, type or guest..." /></div>
      </div>

      <div className="room-grid">
        {filtered.map((room) => <div className="room-card" key={room.id}>
          <div className="room-card-top"><div className="room-number"><span>ROOM NUMBER</span><strong>{room.number}</strong></div><span className={`room-status ${room.status.toLowerCase()}`}>{room.status}</span></div>
          <div className="room-type">{room.type} · {room.floor}</div><div className="room-divider" />
          {room.guest ? <div className="room-guest"><UserRound size={16} /><div><strong>{room.guest}</strong><span>Checkout: {room.checkOut || "N/A"}</span></div></div> : <div className="room-guest muted"><CalendarCheck size={16} /><div><strong>{room.status === "Available" ? "Ready for booking" : room.status === "Cleaning" ? "Housekeeping in progress" : room.status === "Reserved" ? "Reserved for guest" : "Maintenance required"}</strong><span>{room.status === "Available" ? "Vacant room" : "Needs attention"}</span></div></div>}
          <div className="room-card-footer"><strong>{money(room.price)} <small>/ night</small></strong><button onClick={() => openEdit(room)}><Edit3 size={13} /> Edit Room</button></div>
        </div>)}
      </div>

      {(editing || isAdding) && <div className="modal-backdrop" onClick={closeModal}><div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><div><span className="eyebrow">{isAdding ? "ROOM INVENTORY" : `ROOM ${editing?.number}`}</span><h2>{isAdding ? "Add New Room" : "Edit Room"}</h2></div><button className="modal-close" onClick={closeModal}><X size={17} /></button></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="two-fields"><label>Room Number<input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="e.g. 104" /></label><label>Floor<select value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}><option>Ground Floor</option><option>First Floor</option><option>Second Floor</option><option>Third Floor</option></select></label></div>
          <div className="two-fields"><label>Room Type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Standard Deluxe</option><option>Deluxe Suite</option><option>Executive Suite</option><option>Presidential Suite</option></select></label><label>Price / Night<input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label></div>
          <label>Room Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}><option>Available</option><option>Occupied</option><option>Reserved</option><option>Cleaning</option><option>Maintenance</option></select></label>
          {(form.status === "Occupied" || form.status === "Reserved") && <div className="two-fields"><label>Guest Name<input value={form.guest ?? ""} onChange={(e) => setForm({ ...form, guest: e.target.value })} placeholder="Guest name" /></label><label>Expected Checkout<input type="date" value={form.checkOut ?? ""} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></label></div>}
          <div className="modal-actions"><button className="secondary-button" onClick={closeModal}>Cancel</button>{editing && <button className="secondary-button" onClick={deleteRoom}><Trash2 size={15} /> Delete</button>}<button className="primary-button" onClick={saveRoom}><CheckCircle2 size={15} /> {isAdding ? "Add Room" : "Save Room"}</button></div>
        </div>
      </div></div>}
    </div>
  );
}
