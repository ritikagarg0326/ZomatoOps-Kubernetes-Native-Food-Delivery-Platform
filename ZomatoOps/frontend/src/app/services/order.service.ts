import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItem, Order, OrderPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private base = '/api/orders';

  cartCount = signal<number>(0);
  cart = signal<Cart | null>(null);

  constructor(private http: HttpClient) {}

  // ── Cart ──────────────────────────────────────────────────────────────────

  getCart(): Observable<Cart | null> {
    return this.http.get<Cart | null>(this.base + '/cart').pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartCount.set(cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0);
      })
    );
  }

  upsertCart(restaurantId: string, restaurantName: string, items: CartItem[]): Observable<Cart> {
    return this.http.put<Cart>(this.base + '/cart', {
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      items: items.map(i => ({
        item_id: i.item_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image_url: i.image_url,
        special_instructions: i.special_instructions
      }))
    }).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartCount.set(cart.items.reduce((s, i) => s + i.quantity, 0));
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.base + '/cart').pipe(
      tap(() => {
        this.cart.set(null);
        this.cartCount.set(0);
      })
    );
  }

  // ── Orders ────────────────────────────────────────────────────────────────

  placeOrder(payload: OrderPayload): Observable<Order> {
    return this.http.post<Order>(this.base + '/', payload).pipe(
      tap(() => {
        this.cart.set(null);
        this.cartCount.set(0);
      })
    );
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base + '/');
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  cancelOrder(id: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/cancel`, {});
  }

  // ── Local cart helpers ───────────────────────────────────────────────────

  addItemToLocalCart(
    restaurantId: string,
    restaurantName: string,
    newItem: { item_id: string; name: string; price: number; image_url?: string }
  ): CartItem[] {
    const current = this.cart();
    let items: CartItem[] = current?.restaurant_id === restaurantId
      ? [...(current?.items ?? [])]
      : [];

    const existing = items.find(i => i.item_id === newItem.item_id);
    if (existing) {
      existing.quantity++;
      existing.subtotal = existing.quantity * existing.price;
    } else {
      items.push({
        ...newItem,
        quantity: 1,
        subtotal: newItem.price
      });
    }
    return items;
  }

  removeItemFromLocalCart(itemId: string): CartItem[] {
    const current = this.cart();
    if (!current) return [];
    return current.items
      .map(i => i.item_id === itemId ? { ...i, quantity: i.quantity - 1, subtotal: (i.quantity - 1) * i.price } : i)
      .filter(i => i.quantity > 0);
  }
}
