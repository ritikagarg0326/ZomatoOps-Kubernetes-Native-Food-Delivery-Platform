// ── Auth / User ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  address?: string;
  city?: string;
  created_at: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// ── Restaurant ───────────────────────────────────────────────────────────────

export interface Location {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  category: string;
  cuisine_types: string[];
  price_range: string;
  location: Location;
  phone?: string;
  email?: string;
  website?: string;
  cover_image_url?: string;
  photos: string[];
  features: string[];
  operating_hours?: OperatingHours;
  average_rating: number;
  total_reviews: number;
  owner_id?: string;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_available: boolean;
  allergens: string[];
  created_at: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  visit_type?: string;
  helpful_votes: number;
  created_at: string;
}

export interface ReviewPayload {
  rating: number;
  title?: string;
  body: string;
  visit_type?: string;
}

// ── Orders / Cart ────────────────────────────────────────────────────────────

export interface CartItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  special_instructions?: string;
  subtotal: number;
}

export interface Cart {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  taxes: number;
  total: number;
  updated_at: string;
}

export interface DeliveryAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  delivery_type: string;
  delivery_address?: DeliveryAddress;
  special_instructions?: string;
  payment_method: string;
  subtotal: number;
  delivery_fee: number;
  taxes: number;
  discount: number;
  total: number;
  status: string;
  estimated_delivery_mins?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderPayload {
  restaurant_id: string;
  restaurant_name: string;
  items: { item_id: string; name: string; price: number; quantity: number; image_url?: string }[];
  delivery_type: string;
  delivery_address?: DeliveryAddress;
  payment_method: string;
  coupon_code?: string;
}
