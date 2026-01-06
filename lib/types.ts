export interface Catalog {
  id: string
  title: string
  file_url: string
  created_at: string
  category?: string
}

export interface OrderItem {
  reference_number: string
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  customer_name: string
  email: string
  phone: string
  business_name: string
  items: OrderItem[]
  created_at: string
}

