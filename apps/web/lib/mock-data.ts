export type MockShop = {
  id: string;
  name: string;
  slug: string;
  address: string;
  prep_time_mins: number;
  image_url: string;
  is_open: boolean;
  lat: number;
  lng: number;
};

export type MockMenuItem = {
  id: string;
  shop_id: string;
  name: string;
  category: string;
  price: number;
  temp_options: ('hot' | 'cold' | 'both')[];
  image_url: string;
};

export const MOCK_SHOPS: MockShop[] = [
  {
    id: "shop-1",
    name: "Gobi Coffee",
    slug: "gobi-coffee",
    address: "Seoul Street 12, Ulaanbaatar",
    prep_time_mins: 5,
    image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800",
    is_open: true,
    lat: 47.9155,
    lng: 106.9100,
  },
  {
    id: "shop-2",
    name: "Ulaanbaatar Roasters",
    slug: "ub-roasters",
    address: "Peace Avenue 45, Ulaanbaatar",
    prep_time_mins: 8,
    image_url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
    is_open: true,
    lat: 47.9180,
    lng: 106.9250,
  },
  {
    id: "shop-3",
    name: "Steppe Brew",
    slug: "steppe-brew",
    address: "Chinggis Square, Ulaanbaatar",
    prep_time_mins: 10,
    image_url: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800",
    is_open: false,
    lat: 47.9184,
    lng: 106.9170,
  }
];

export const MOCK_MENU: MockMenuItem[] = [
  { id: "m1", shop_id: "shop-1", name: "Americano", category: "coffee", price: 5000, temp_options: ["hot", "cold"], image_url: "https://images.unsplash.com/photo-1551030173-122aabc4489c?auto=format&fit=crop&q=80&w=400" },
  { id: "m2", shop_id: "shop-1", name: "Caramel Macchiato", category: "coffee", price: 8500, temp_options: ["hot", "cold"], image_url: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&q=80&w=400" },
  { id: "m3", shop_id: "shop-1", name: "Matcha Latte", category: "tea", price: 9000, temp_options: ["hot", "cold"], image_url: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=400" },
  { id: "m4", shop_id: "shop-1", name: "Croissant", category: "food", price: 6000, temp_options: ["both"], image_url: "https://images.unsplash.com/photo-1555507036-ab1e4006aa07?auto=format&fit=crop&q=80&w=400" },
  { id: "m5", shop_id: "shop-2", name: "Pour Over (Ethiopia)", category: "coffee", price: 12000, temp_options: ["hot"], image_url: "https://images.unsplash.com/photo-1495474472201-49660ff10a88?auto=format&fit=crop&q=80&w=400" },
  { id: "m6", shop_id: "shop-2", name: "Flat White", category: "coffee", price: 7500, temp_options: ["hot"], image_url: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=400" }
];

export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';

export type MockOrder = {
  id: string;
  shop_id: string;
  customer_name: string;
  status: OrderStatus;
  total_amount: number;
  items: { name: string; qty: number; temp: string }[];
  scheduled_pickup_at: string;
  created_at: string;
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ord-1", shop_id: "shop-1", customer_name: "Bold", status: "paid", total_amount: 15000,
    items: [{ name: "Americano", qty: 1, temp: "hot" }, { name: "Croissant", qty: 1, temp: "both" }],
    scheduled_pickup_at: new Date(Date.now() + 15 * 60000).toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: "ord-2", shop_id: "shop-1", customer_name: "Saran", status: "preparing", total_amount: 8500,
    items: [{ name: "Caramel Macchiato", qty: 1, temp: "cold" }],
    scheduled_pickup_at: new Date(Date.now() + 5 * 60000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: "ord-3", shop_id: "shop-1", customer_name: "Tuvshin", status: "ready", total_amount: 9000,
    items: [{ name: "Matcha Latte", qty: 1, temp: "hot" }],
    scheduled_pickup_at: new Date(Date.now() - 2 * 60000).toISOString(),
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  }
];
