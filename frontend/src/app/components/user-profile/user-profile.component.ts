import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { Order, User } from '../../models/models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  auth = inject(AuthService);
  private orderService = inject(OrderService);
  private toast = inject(ToastService);

  activeTab = 'profile';
  orders = signal<Order[]>([]);
  ordersLoading = signal(false);
  saving = signal(false);

  editForm: Partial<User> = {};

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.editForm = { name: user.name, phone: user.phone, address: user.address, city: user.city };
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersLoading.set(true);
    this.orderService.getOrders().subscribe({
      next: (data) => { this.orders.set(data); this.ordersLoading.set(false); },
      error: () => this.ordersLoading.set(false)
    });
  }

  saveProfile(): void {
    this.saving.set(true);
    this.auth.updateProfile(this.editForm).subscribe({
      next: () => { this.toast.success('Profile updated!'); this.saving.set(false); },
      error: () => { this.toast.error('Update failed'); this.saving.set(false); }
    });
  }

  cancelOrder(orderId: string): void {
    this.orderService.cancelOrder(orderId).subscribe({
      next: (updated) => {
        this.orders.update(orders => orders.map(o => o.id === updated.id ? updated : o));
        this.toast.success('Order cancelled');
      },
      error: () => this.toast.error('Could not cancel order')
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'orange', confirmed: 'blue', preparing: 'orange',
      out_for_delivery: 'blue', delivered: 'green', cancelled: 'red'
    };
    return map[status] ?? 'blue';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: 'fa-clock', confirmed: 'fa-check-circle', preparing: 'fa-fire',
      out_for_delivery: 'fa-motorcycle', delivered: 'fa-check-double', cancelled: 'fa-times-circle'
    };
    return map[status] ?? 'fa-circle';
  }
}
