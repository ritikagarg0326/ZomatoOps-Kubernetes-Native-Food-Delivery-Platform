import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/models';

@Component({
  selector: 'app-restaurant-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './restaurant-layout.component.html',
  styleUrls: ['./restaurant-layout.component.scss']
})
export class RestaurantLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  restaurant = signal<Restaurant | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.restaurantService.getById(id).subscribe({
      next: (r) => { this.restaurant.set(r); this.loading.set(false); },
      error: () => { this.error.set('Restaurant not found'); this.loading.set(false); }
    });
  }

  getPriceLabel(range: string): string {
    return { budget: '₹', moderate: '₹₹', expensive: '₹₹₹', luxury: '₹₹₹₹' }[range] ?? '₹₹';
  }
}
