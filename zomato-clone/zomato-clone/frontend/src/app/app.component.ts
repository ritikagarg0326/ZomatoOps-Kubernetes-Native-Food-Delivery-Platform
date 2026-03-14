import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { OrderService } from './services/order.service';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  auth = inject(AuthService);
  orderService = inject(OrderService);
  toastService = inject(ToastService);

  mobileMenuOpen = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.orderService.getCart().subscribe();
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.mobileMenuOpen = false;
  }
}
