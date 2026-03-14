import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../services/restaurant.service';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { MenuItem, Restaurant, CartItem } from '../../../models/models';

@Component({
  selector: 'app-restaurant-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="order-page">
      @if (!auth.isLoggedIn()) {
        <div class="card auth-prompt">
          <i class="fas fa-lock"></i>
          <h3>Sign in to order</h3>
          <p>Please log in to add items to your cart and place an order.</p>
          <a routerLink="/login" class="btn btn--primary">Sign in</a>
        </div>
      } @else {
        <div class="order-layout">
          <!-- Menu items -->
          <div class="order-items">
            <h2>Add Items</h2>
            @if (loading()) {
              <div class="spinner"><div class="spin"></div></div>
            } @else {
              @for (group of groupedMenu(); track group.category) {
                <div class="menu-section">
                  <h3>{{ group.category }}</h3>
                  @for (item of group.items; track item.id) {
                    @if (item.is_available) {
                      <div class="card order-item">
                        @if (item.image_url) {
                          <img [src]="item.image_url" [alt]="item.name" />
                        }
                        <div class="order-item__info">
                          @if (item.is_vegetarian) {
                            <span class="veg-dot-small"></span>
                          }
                          <h4>{{ item.name }}</h4>
                          <p>{{ item.description }}</p>
                          <span class="price">₹{{ item.price }}</span>
                        </div>
                        <div class="order-item__controls">
                          @if (getQuantity(item.id) === 0) {
                            <button class="add-btn btn btn--primary btn--sm" (click)="addItem(item)">
                              <i class="fas fa-plus"></i> ADD
                            </button>
                          } @else {
                            <div class="qty-control">
                              <button (click)="decreaseItem(item.id)"><i class="fas fa-minus"></i></button>
                              <span>{{ getQuantity(item.id) }}</span>
                              <button (click)="addItem(item)"><i class="fas fa-plus"></i></button>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  }
                </div>
              }
            }
          </div>

          <!-- Cart summary -->
          <div class="cart-sidebar">
            <div class="card cart-card">
              <h3>Your Order</h3>
              @if (localCart().length === 0) {
                <div class="empty-cart">
                  <i class="fas fa-shopping-basket"></i>
                  <p>No items yet</p>
                </div>
              } @else {
                <div class="cart-items">
                  @for (item of localCart(); track item.item_id) {
                    <div class="cart-item">
                      <div class="qty-control">
                        <button (click)="decreaseItem(item.item_id)"><i class="fas fa-minus"></i></button>
                        <span>{{ item.quantity }}</span>
                        <button (click)="increaseExistingItem(item.item_id)"><i class="fas fa-plus"></i></button>
                      </div>
                      <span class="name">{{ item.name }}</span>
                      <span class="subtotal">₹{{ item.subtotal }}</span>
                    </div>
                  }
                </div>
                <div class="cart-total">
                  <span>Subtotal</span>
                  <strong>₹{{ cartSubtotal() }}</strong>
                </div>
                <button class="btn btn--primary btn--block btn--lg" (click)="proceedToCheckout()" [disabled]="syncing()">
                  @if (syncing()) { <i class="fas fa-spinner fa-spin"></i> Syncing... }
                  @else { Proceed to Checkout <i class="fas fa-arrow-right"></i> }
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .auth-prompt { padding: 60px 24px; text-align: center;
      i { font-size: 48px; color: var(--border); margin-bottom: 16px; display: block; }
      h3 { font-size: 20px; margin-bottom: 8px; }
      p { color: var(--text-secondary); margin-bottom: 20px; } }
    .order-layout { display: grid; grid-template-columns: 1fr 320px; gap: 28px;
      @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .order-items h2 { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
    .menu-section { margin-bottom: 28px;
      h3 { font-size: 16px; font-weight: 700; color: var(--text-secondary); margin-bottom: 12px;
        text-transform: uppercase; letter-spacing: .5px; } }
    .order-item { display: flex; align-items: center; gap: 14px; padding: 14px; margin-bottom: 10px;
      img { width: 70px; height: 60px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
      &__info { flex: 1;
        h4 { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
        p { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; line-height: 1.4; }
        .price { font-size: 15px; font-weight: 700; } }
      &__controls { flex-shrink: 0; }
    }
    .veg-dot-small { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--success); margin-right: 6px; }
    .add-btn { white-space: nowrap; }
    .qty-control { display: flex; align-items: center; gap: 0; border: 2px solid var(--primary); border-radius: 8px; overflow: hidden;
      button { background: var(--primary); border: none; color: #fff; width: 32px; height: 32px; cursor: pointer; font-size: 13px; transition: background .2s; &:hover { background: var(--primary-dark); } }
      span { padding: 0 14px; font-weight: 700; font-size: 15px; color: var(--primary); min-width: 36px; text-align: center; } }
    .cart-card { padding: 20px; position: sticky; top: 140px;
      h3 { font-size: 17px; font-weight: 700; margin-bottom: 16px; }  }
    .empty-cart { text-align: center; padding: 24px 0; color: var(--text-muted);
      i { font-size: 36px; margin-bottom: 10px; display: block; } }
    .cart-items { margin-bottom: 16px; }
    .cart-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border);
      .qty-control { transform: scale(0.85); transform-origin: left; }
      .name { flex: 1; font-size: 14px; }
      .subtotal { font-weight: 700; font-size: 14px; }
    }
    .cart-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 15px; margin-bottom: 14px;
      strong { font-size: 18px; color: var(--primary); } }
  `]
})
export class RestaurantOrderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private restaurantService = inject(RestaurantService);
  private orderService = inject(OrderService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  menuItems = signal<MenuItem[]>([]);
  restaurant = signal<Restaurant | null>(null);
  localCart = signal<CartItem[]>([]);
  loading = signal(true);
  syncing = signal(false);

  restaurantId = '';

  groupedMenu = computed(() => {
    const map = new Map<string, MenuItem[]>();
    this.menuItems().filter(i => i.is_available).forEach(i => {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  cartSubtotal = computed(() => this.localCart().reduce((s, i) => s + i.subtotal, 0));

  ngOnInit(): void {
    this.restaurantId = this.route.parent!.snapshot.paramMap.get('id')!;
    this.restaurantService.getMenu(this.restaurantId).subscribe({
      next: (data) => { this.menuItems.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.restaurantService.getById(this.restaurantId).subscribe(r => this.restaurant.set(r));
    // Load existing cart
    const existingCart = this.orderService.cart();
    if (existingCart?.restaurant_id === this.restaurantId) {
      this.localCart.set([...existingCart.items]);
    }
  }

  getQuantity(itemId: string): number {
    return this.localCart().find(i => i.item_id === itemId)?.quantity ?? 0;
  }

  addItem(menuItem: MenuItem): void {
    const existing = this.localCart().find(i => i.item_id === menuItem.id);
    if (existing) {
      this.localCart.update(cart => cart.map(i =>
        i.item_id === menuItem.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i
      ));
    } else {
      this.localCart.update(cart => [...cart, {
        item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        image_url: menuItem.image_url,
        subtotal: menuItem.price
      }]);
    }
  }

  increaseExistingItem(itemId: string): void {
    const item = this.menuItems().find(i => i.id === itemId);
    if (item) this.addItem(item);
  }

  decreaseItem(itemId: string): void {
    this.localCart.update(cart =>
      cart.map(i => i.item_id === itemId
        ? { ...i, quantity: i.quantity - 1, subtotal: (i.quantity - 1) * i.price }
        : i
      ).filter(i => i.quantity > 0)
    );
  }

  proceedToCheckout(): void {
    if (this.localCart().length === 0) return;
    const r = this.restaurant();
    if (!r) return;
    this.syncing.set(true);
    this.orderService.upsertCart(this.restaurantId, r.name, this.localCart()).subscribe({
      next: () => {
        this.syncing.set(false);
        this.router.navigate(['/order']);
      },
      error: () => {
        this.toast.error('Failed to sync cart');
        this.syncing.set(false);
      }
    });
  }
}
