import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Utensils,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
} from "lucide-react";
import type { MenuItem } from "../data/restaurantData";
import {
  PRESET_DISHES,
  getMenuItems,
  setMenuItemsStore,
} from "../data/restaurantData";

const money = (v: number) => `₹${v.toLocaleString("en-IN")}`;

type RestaurantProps = {
  onMenuItemsChange?: (items: MenuItem[]) => void;
};

export default function Restaurant({ onMenuItemsChange }: RestaurantProps) {
  const [items, setItems] = useState<MenuItem[]>(getMenuItems());
  const [category, setCategory] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<"All" | "Available" | "Unavailable">("All");
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Main Course");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">(150);
  const [formGstRate, setFormGstRate] = useState<number | "">(5);
  const [formIsAvailable, setFormIsAvailable] = useState(true);
  const [formImage, setFormImage] = useState("");
  const [imageMode, setImageMode] = useState<"preset" | "url" | "upload">("preset");

  const syncItems = (newItems: MenuItem[]) => {
    setItems(newItems);
    setMenuItemsStore(newItems);
    if (onMenuItemsChange) {
      onMenuItemsChange(newItems);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["All", "Main Course", "Starters", "Indian Bread", "Chinese", "Beverages", "Desserts", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = `${item.name} ${item.category} ${item.description}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      const matchesAvailability =
        availabilityFilter === "All" ||
        (availabilityFilter === "Available" && item.isAvailable) ||
        (availabilityFilter === "Unavailable" && !item.isAvailable);
      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [items, search, category, availabilityFilter]);

  const metrics = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.isAvailable).length;
    const unavailable = total - available;
    const avgPrice = total > 0 ? Math.round(items.reduce((s, i) => s + i.price, 0) / total) : 0;
    return { total, available, unavailable, avgPrice };
  }, [items]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("Main Course");
    setFormDescription("");
    setFormPrice(250);
    setFormGstRate(5);
    setFormIsAvailable(true);
    setFormImage(PRESET_DISHES[0].image);
    setImageMode("preset");
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPrice(item.price);
    setFormGstRate(item.gstRate);
    setFormIsAvailable(item.isAvailable);
    setFormImage(item.image);
    setImageMode("url");
    setIsModalOpen(true);
  };

  const handleToggleAvailability = (id: number) => {
    const updated = items.map((i) => (i.id === id ? { ...i, isAvailable: !i.isAvailable } : i));
    syncItems(updated);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      const updated = items.filter((i) => i.id !== id);
      syncItems(updated);
    }
  };

  const handlePresetSelect = (dishName: string) => {
    const preset = PRESET_DISHES.find((d) => d.name === dishName);
    if (preset) {
      setFormName(preset.name);
      setFormCategory(preset.category);
      setFormDescription(preset.description);
      setFormPrice(preset.price);
      setFormImage(preset.image);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setFormImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter a food name.");
      return;
    }

    const priceNum = typeof formPrice === "number" ? formPrice : Number(formPrice) || 0;
    const gstNum = typeof formGstRate === "number" ? formGstRate : Number(formGstRate) || 0;

    if (editingItem) {
      const updated = items.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: formName.trim(),
              category: formCategory,
              description: formDescription,
              price: priceNum,
              gstRate: gstNum,
              isAvailable: formIsAvailable,
              image: formImage || "/food/chicken-biryani.svg",
            }
          : i
      );
      syncItems(updated);
    } else {
      const newItem: MenuItem = {
        id: Date.now(),
        name: formName.trim(),
        category: formCategory,
        description: formDescription,
        price: priceNum,
        gstRate: gstNum,
        isAvailable: formIsAvailable,
        image: formImage || "/food/chicken-biryani.svg",
      };
      syncItems([...items, newItem]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="module-page">
      {/* HEADER */}
      <div className="module-header">
        <div>
          <span className="eyebrow">RESTAURANT & DINING</span>
          <h1>Restaurant Menu Management</h1>
          <p>Configure food items, dish pricing, dish availability, and images for hotel dining.</p>
        </div>
        <button className="primary-button" onClick={openAddModal}>
          <Plus size={16} /> Add Food Item
        </button>
      </div>

      {/* METRICS STRIP */}
      <div className="metric-strip">
        <div>
          <span>Total Dishes</span>
          <strong>{metrics.total}</strong>
        </div>
        <div>
          <span>Available Dishes</span>
          <strong>{metrics.available}</strong>
        </div>
        <div>
          <span>Out of Stock</span>
          <strong>{metrics.unavailable}</strong>
        </div>
        <div>
          <span>Average Dish Price</span>
          <strong>{money(metrics.avgPrice)}</strong>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="filter-tabs">
          {Array.from(new Set(categories)).map((cat) => (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="filter-tabs">
            {(["All", "Available", "Unavailable"] as const).map((st) => (
              <button
                key={st}
                className={availabilityFilter === st ? "active" : ""}
                onClick={() => setAvailabilityFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="module-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food item or category..."
            />
          </div>
        </div>
      </div>

      {/* FOOD ITEMS GRID */}
      {filteredItems.length === 0 ? (
        <div className="panel" style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <Utensils size={32} style={{ marginBottom: "12px", opacity: 0.6 }} />
          <h3>No food items found</h3>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>
            Try clearing search filters or add a new food item.
          </p>
        </div>
      ) : (
        <div className="menu-grid-new">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="food-card"
              style={{
                opacity: item.isAvailable ? 1 : 0.75,
                borderColor: item.isAvailable ? "var(--border)" : "#3a2323",
              }}
            >
              <div className="food-image">
                <img src={item.image} alt={item.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/food/chicken-biryani.svg"; }} />
                <span className="food-category">{item.category}</span>
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    padding: "3px 8px",
                    borderRadius: "999px",
                    fontSize: "9px",
                    fontWeight: 700,
                    background: item.isAvailable ? "rgba(78,214,154,0.85)" : "rgba(236,119,119,0.85)",
                    color: item.isAvailable ? "#0a291a" : "#2f0a0a",
                  }}
                >
                  {item.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>

              <div style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "14px", color: "var(--text)" }}>{item.name}</strong>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--accent)" }}>
                    {money(item.price)}
                  </span>
                </div>

                <p style={{ fontSize: "11px", color: "var(--muted)", margin: "0 0 12px", minHeight: "32px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.description || "Freshly prepared delicious hotel dining item."}
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--border)" }}>
                  <button
                    className="outline-button"
                    onClick={() => handleToggleAvailability(item.id)}
                    title="Toggle dish availability"
                    style={{ fontSize: "10px", padding: "0 8px" }}
                  >
                    {item.isAvailable ? (
                      <>
                        <ToggleRight size={15} style={{ color: "var(--green)" }} /> Disable
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={15} style={{ color: "var(--red)" }} /> Enable
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="table-action" onClick={() => openEditModal(item)} title="Edit Food">
                      <Edit3 size={13} />
                    </button>
                    <button className="table-action" onClick={() => handleDeleteItem(item.id)} title="Delete Food" style={{ color: "var(--red)" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT FOOD MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card"
            style={{ width: "min(560px, 95vw)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">{editingItem ? "EDIT DISH" : "ADD NEW DISH"}</span>
                <h2>{editingItem ? `Edit ${editingItem.name}` : "Create Food Item"}</h2>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSaveForm} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="two-fields">
                <label>
                  Food Name
                  <input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Chicken Biryani"
                  />
                </label>

                <label>
                  Category
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Starters">Starters</option>
                    <option value="Indian Bread">Indian Bread</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </label>
              </div>

              <div className="two-fields">
                <label>
                  Price (₹)
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="e.g. 250"
                  />
                </label>

                <label>
                  GST Rate (%)
                  <input
                    type="number"
                    min="0"
                    max="28"
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="5"
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe ingredients or taste profile..."
                  rows={2}
                />
              </label>

              {/* IMAGE SELECTION MODE */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted2)" }}>Food Image</span>
                  <div className="filter-tabs" style={{ gap: "4px" }}>
                    <button
                      type="button"
                      className={imageMode === "preset" ? "active" : ""}
                      onClick={() => setImageMode("preset")}
                      style={{ height: "26px", fontSize: "10px" }}
                    >
                      <Sparkles size={11} style={{ marginRight: "4px" }} /> Preset Dish
                    </button>
                    <button
                      type="button"
                      className={imageMode === "url" ? "active" : ""}
                      onClick={() => setImageMode("url")}
                      style={{ height: "26px", fontSize: "10px" }}
                    >
                      <ImageIcon size={11} style={{ marginRight: "4px" }} /> Image URL
                    </button>
                    <button
                      type="button"
                      className={imageMode === "upload" ? "active" : ""}
                      onClick={() => setImageMode("upload")}
                      style={{ height: "26px", fontSize: "10px" }}
                    >
                      <Upload size={11} style={{ marginRight: "4px" }} /> Upload
                    </button>
                  </div>
                </div>

                {imageMode === "preset" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", maxHeight: "140px", overflowY: "auto", padding: "4px" }}>
                    {PRESET_DISHES.map((d) => (
                      <button
                        key={d.name}
                        type="button"
                        onClick={() => handlePresetSelect(d.name)}
                        style={{
                          border: formImage === d.image ? "2px solid var(--accent)" : "1px solid var(--border)",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "#131923",
                          padding: 0,
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                      >
                        <img src={d.image} alt={d.name} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/food/chicken-biryani.svg"; }} style={{ width: "100%", height: "45px", objectFit: "cover" }} />
                        <span style={{ fontSize: "8px", padding: "3px", display: "block", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {imageMode === "url" && (
                  <input
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                )}

                {imageMode === "upload" && (
                  <div style={{ border: "1px dashed var(--border2)", borderRadius: "8px", padding: "14px", textAlign: "center", background: "#131923" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ fontSize: "11px" }}
                    />
                  </div>
                )}

                {/* IMAGE PREVIEW */}
                {formImage && (
                  <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={formImage}
                      alt="Preview"
                      style={{ width: "50px", height: "50px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/food/chicken-biryani.svg";
                      }}
                    />
                    <span style={{ fontSize: "10px", color: "var(--green)" }}>Image preview verified</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formIsAvailable}
                  onChange={(e) => setFormIsAvailable(e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "var(--accent)" }}
                />
                <label htmlFor="availCheck" style={{ margin: 0, fontSize: "11px", color: "var(--text)" }}>
                  Dish is available for ordering
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <CheckCircle2 size={15} /> {editingItem ? "Update Food Item" : "Save Food Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
