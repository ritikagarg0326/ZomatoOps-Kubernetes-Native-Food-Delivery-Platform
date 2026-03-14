import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Cart, DeliveryAddress } from '../../models/models';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  cart = signal<Cart | null>(null);
  loading = signal(true);
  placing = signal(false);
  orderPlaced = signal(false);
  orderId = signal('');

  deliveryType = 'delivery';
  paymentMethod = 'cash_on_delivery';
  couponCode = '';
  couponApplied = signal(false);
  couponDiscount = signal(0);

  address: DeliveryAddress = {
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: ''
  };

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.address.full_name = user.name;
      this.address.phone = user.phone;
      if (user.address) this.address.address_line1 = user.address;
      if (user.city) this.address.city = user.city;
    }
    this.orderService.getCart().subscribe({
      next: (c) => { this.cart.set(c); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  applyCoupon(): void {
    if (this.couponCode.toUpperCase() === 'WELCOME50') {
      const cart = this.cart();
      if (cart) {
        const discount = Math.min(cart.subtotal * 0.5, 100);
        this.couponDiscount.set(discount);
        this.couponApplied.set(true);
        this.toast.success('Coupon applied! ₹' + discount.toFixed(0) + ' off');
      }
    } else {
      this.toast.error('Invalid coupon code');
    }
  }

  getFinalTotal(): number {
    const c = this.cart();
    if (!c) return 0;
    return Math.max(0, c.total - this.couponDiscount());
  }

  placeOrder(): void {
    const c = this.cart();
    if (!c) return;
    if (this.deliveryType === 'delivery' && !this.address.address_line1) {
      this.toast.error('Please enter delivery address');
      return;
    }
    this.placing.set(true);
    this.orderService.placeOrder({
      restaurant_id: c.restaurant_id,
      restaurant_name: c.restaurant_name,
      items: c.items.map(i => ({ item_id: i.item_id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url })),
      delivery_type: this.deliveryType,
      delivery_address: this.deliveryType === 'delivery' ? this.address : undefined,
      payment_method: this.paymentMethod,
      coupon_code: this.couponApplied() ? this.couponCode : undefined
    }).subscribe({
      next: (order) => {
        this.orderId.set(order.id);
        this.orderPlaced.set(true);
        this.placing.set(false);
        this.cart.set(null);
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to place order');
        this.placing.set(false);
      }
    });
  }

  clearCart(): void {
    this.orderService.clearCart().subscribe(() => {
      this.cart.set(null);
      this.toast.info('Cart cleared');
    });
  }
}
