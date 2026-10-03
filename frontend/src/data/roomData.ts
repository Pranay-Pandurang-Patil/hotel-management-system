export type RoomStatus = "Occupied" | "Available" | "Reserved" | "Cleaning" | "Maintenance";

export type Room = {
  id: number;
  number: string;
  type: string;
  floor: string;
  price: number;
  status: RoomStatus;
  guest?: string;
  checkOut?: string;
};

export const initialRooms: Room[] = [
  { id: 1, number: "101", type: "Standard Deluxe", floor: "Ground Floor", price: 2200, status: "Available" },
  { id: 2, number: "102", type: "Standard Deluxe", floor: "Ground Floor", price: 2200, status: "Occupied", guest: "Rahul Sharma", checkOut: "2026-10-04" },
  { id: 3, number: "103", type: "Deluxe Suite", floor: "Ground Floor", price: 3000, status: "Cleaning" },
  { id: 4, number: "201", type: "Deluxe Suite", floor: "First Floor", price: 3000, status: "Occupied", guest: "Ananya Rao", checkOut: "2026-10-05" },
  { id: 5, number: "202", type: "Executive Suite", floor: "First Floor", price: 4800, status: "Available" },
  { id: 6, number: "203", type: "Deluxe Suite", floor: "First Floor", price: 3000, status: "Maintenance" },
  { id: 7, number: "204", type: "Deluxe Suite", floor: "First Floor", price: 3000, status: "Occupied", guest: "Vikram Singh", checkOut: "2026-10-03" },
  { id: 8, number: "301", type: "Presidential Suite", floor: "Second Floor", price: 6500, status: "Reserved", guest: "Sneha Patil", checkOut: "2026-10-06" },
  { id: 9, number: "302", type: "Deluxe Suite", floor: "Second Floor", price: 3000, status: "Available" },
];

export function getRoomCounts(rooms: Room[] = initialRooms) {
  return {
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === "Occupied").length,
    available: rooms.filter((r) => r.status === "Available").length,
    reserved: rooms.filter((r) => r.status === "Reserved").length,
    cleaning: rooms.filter((r) => r.status === "Cleaning").length,
    maintenance: rooms.filter((r) => r.status === "Maintenance").length,
  };
}

export function persistRooms(rooms: Room[]) {
  localStorage.setItem("hotelos_rooms_v2", JSON.stringify(rooms));
}

export function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem("hotelos_rooms_v2");
    if (!raw) return initialRooms;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : initialRooms;
  } catch {
    return initialRooms;
  }
}
