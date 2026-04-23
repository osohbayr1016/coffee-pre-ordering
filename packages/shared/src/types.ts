// ── Order ─────────────────────────────────────────────
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'cancelled'

export type Order = {
  id:                 string
  customer_id:        string
  shop_id:            string
  status:             OrderStatus
  total_amount:       number
  qpay_invoice_id:    string | null
  scheduled_pickup_at:string
  note:               string | null
  created_at:         string
}

// ── Shop ──────────────────────────────────────────────
export type CoffeeShop = {
  id:                  string
  owner_id:            string
  name:                string
  slug:                string
  address:             string
  qpay_merchant_id:    string
  subscription_status: 'active' | 'inactive' | 'trial'
  prep_time_mins:      number
  is_open:             boolean
}

// ── Menu Item ─────────────────────────────────────────
export type MenuItem = {
  id:           string
  shop_id:      string
  name:         string
  category:     string
  price:        number
  temp_options: Array<'hot' | 'cold' | 'both'>
  image_url:    string | null
  is_available: boolean
  prep_time_mins?: number
}

// ── User ──────────────────────────────────────────────
export type UserRole = 'customer' | 'shop_owner' | 'admin'

export type User = {
  id:           string
  phone:        string | null
  email:        string | null
  role:         UserRole
  display_name: string | null
  created_at:   string
}

// ── API Response helpers ──────────────────────────────
export type ApiResponse<T> = {
  data:    T
  success: true
} | {
  error:   string
  success: false
}
