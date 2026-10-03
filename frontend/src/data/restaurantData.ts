export type MenuItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  gstRate: number; // e.g. 5%
  isAvailable: boolean;
  image: string;
};

export const PRESET_DISHES = [
  {
    name: "Chicken Biryani",
    category: "Main Course",
    price: 350,
    gstRate: 5,
    description: "Aromatic basmati rice cooked with succulent chicken and spices",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Paneer Tikka",
    category: "Starters",
    price: 280,
    gstRate: 5,
    description: "Grilled cottage cheese cubes marinated in spiced yogurt",
    image: "https://images.unsplash.com/photo-1773419808002-bab9e1f840a0?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Butter Naan",
    category: "Indian Bread",
    price: 80,
    gstRate: 5,
    description: "Traditional soft tandoori flatbread brushed with fresh butter",
    image: "https://images.unsplash.com/photo-1678527040378-ca2285fbee57?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Crispy Samosa",
    category: "Starters",
    price: 120,
    gstRate: 5,
    description: "Golden fried pastry stuffed with spiced potatoes and green peas",
    image: "https://images.unsplash.com/photo-1572099107898-46f22b3af4f9?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Gulab Jamun",
    category: "Desserts",
    price: 140,
    gstRate: 5,
    description: "Soft milk dumplings soaked in cardamom infused sugar syrup",
    image: "https://images.unsplash.com/photo-1758910536889-43ce7b3199fd?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Masala Dosa",
    category: "Main Course",
    price: 220,
    gstRate: 5,
    description: "Crispy rice crepe filled with spiced potato masala, served with chutney",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/MASALA_DOSA.jpg?width=900"
  },
  {
    name: "Veg Hakka Noodles",
    category: "Chinese",
    price: 260,
    gstRate: 5,
    description: "Wok-tossed noodles with crunchy vegetables and oriental sauces",
    image: "https://images.unsplash.com/photo-1617622141675-d3005b9067c5?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Fresh Lime Soda",
    category: "Beverages",
    price: 120,
    gstRate: 5,
    description: "Refreshing sparkling drink made with fresh lemon and mint",
    image: "https://images.unsplash.com/photo-1621330716555-5cad596c4562?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Butter Chicken",
    category: "Main Course",
    price: 390,
    gstRate: 5,
    description: "Tender chicken pieces simmered in rich creamy tomato butter gravy",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&fm=jpg&q=80&w=1200"
  },
  {
    name: "Dal Makhani",
    category: "Main Course",
    price: 290,
    gstRate: 5,
    description: "Slow-cooked black lentils in cream and butter with aromatic spices",
    image: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Dal-makhani.jpg?width=900"
  }
];

export const initialMenuItems: MenuItem[] = PRESET_DISHES.map((dish, index) => ({
  id: index + 1,
  name: dish.name,
  category: dish.category,
  description: dish.description,
  price: dish.price,
  gstRate: dish.gstRate,
  isAvailable: true,
  image: dish.image,
}));

const STORAGE_KEY = "hotelos_menu_items_v4_photos";

export function getMenuItems(): MenuItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch { /* use defaults */ }
  return initialMenuItems;
}

export function setMenuItemsStore(items: MenuItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* keep current-session state in the page */ }
}
