export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  long_description: string | null
  price: number
  sale_price: number | null
  compare_at_price: number | null
  category_id: string | null
  image_url: string | null
  images: string[]
  colors: string[]
  features: string[]
  in_stock: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  points: number
  store_credit: number
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string | null
  guest_email: string | null
  first_name: string
  last_name: string
  phone: string
  address: string
  notes: string | null
  subtotal: number
  discount: number
  store_credit_used: number
  total: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  creator_code_id: string | null
  points_earned: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  creator_code?: CreatorCode
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  product_price: number
  quantity: number
  created_at: string
}

export interface CreatorCode {
  id: string
  code: string
  creator_name: string
  discount_percent: number
  is_active: boolean
  usage_count: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  image_url: string | null
  author: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface PointsTransaction {
  id: string
  user_id: string
  order_id: string | null
  points: number
  type: "earned" | "redeemed"
  description: string | null
  created_at: string
}

export interface StoreCreditTransaction {
  id: string
  user_id: string
  amount: number
  type: "redeemed" | "used"
  points_used: number | null
  order_id: string | null
  description: string | null
  created_at: string
}

export interface EmailSubscriber {
  id: string
  email: string
  subscribed_at: string
  is_active: boolean
}
