import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/models';

@Component({
  selector: 'app-dining',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <div class="container">
        <h1><i class="fas fa-utensils"></i> Dining Out</h1>
        <p>Discover restaurants perfect for every occasion</p>
      </div>
    </div>

    <div class="container page-content">
      <!-- Filters -->
      <div class="filters">
        <div class="form-group">
          <input type="text" placeholder="Search restaurants..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
        </div>
        <div class="form-group">
          <select [(ngModel)]="priceFilter" (ngModelChange)="loadRestaurants()">
            <option value="">All Prices</option>
            <option value="budget">Budget (₹)</option>
            <option value="moderate">Moderate (₹₹)</option>
            <option value="expensive">Expensive (₹₹₹)</option>
            <option value="luxury">Luxury (₹₹₹₹)</option>
          </select>
        </div>
        <div class="form-group">
          <select [(ngModel)]="cityFilter" (ngModelChange)="loadRestaurants()">
            <option value="">All Cities</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>
      </div>

      <!-- Results count -->
      @if (!loading()) {
        <p class="results-count">{{ restaurants().length }} restaurants found</p>
      }

      @if (loading()) {
        <div class="spinner"><div class="spin"></div></div>
      } @else if (restaurants().length === 0) {
        <div class="empty-state">
          <i class="fas fa-store-slash"></i>
          <h3>No dining restaurants found</h3>
          <p>Try adjusting your filters or <a routerLink="/add-restaurant">add one</a>!</p>
        </div>
      } @else {
        <div class="restaurant-list">
          @for (r of restaurants(); track r.id) {
            <a [routerLink]="['/restaurant', r.id, 'home']" class="card restaurant-list-card">
              <img [src]="r.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'"
                   [alt]="r.name" loading="lazy" />
              <div class="info">
                <div class="info__top">
                  <h3>{{ r.name }}</h3>
                  <span class="rating"><i class="fas fa-star"></i> {{ r.average_rating }}</span>
                </div>
                <p class="cuisine">{{ r.cuisine_types.join(', ') }}</p>
                <p class="desc">{{ r.description }}</p>
                <div class="meta">
                  <span><i class="fas fa-map-marker-alt"></i> {{ r.location.city }}</span>
                  <span><i class="fas fa-tag"></i> {{ getPriceLabel(r.price_range) }}</span>
                  <span><i class="fas fa-comments"></i> {{ r.total_reviews }} reviews</span>
                </div>
                <div class="features">
                  @for (f of r.features.slice(0,4); track f) {
                    <span class="badge badge--blue">{{ f }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header {
      background: linear-gradient(135deg, #FF5722, #e23744);
      color: #fff;
      padding: 40px 0;
      h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; i { margin-right: 10px; } }
      p { opacity: .85; font-size: 16px; }
    }
    .page-content { padding: 32px 20px; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;
      .form-group { margin: 0; flex: 1; min-width: 200px; }
    }
    .results-count { color: var(--text-secondary); margin-bottom: 20px; font-size: 14px; }
    .restaurant-list { display: flex; flex-direction: column; gap: 20px; }
    .restaurant-list-card {
      display: flex; gap: 20px; padding: 0; cursor: pointer;
      img { width: 220px; height: 160px; object-fit: cover; flex-shrink: 0;
        @media (max-width: 600px) { width: 100%; height: 200px; } }
      .info { padding: 16px; flex: 1;
        &__top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        h3 { font-size: 18px; font-weight: 700; }
        .cuisine { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; }
        .desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .meta { display: flex; gap: 16px; font-size: 13px; color: var(--text-muted); margin-bottom: 10px; flex-wrap: wrap;
          i { margin-right: 4px; color: var(--primary); } }
        .features { display: flex; gap: 6px; flex-wrap: wrap;
          .badge { font-size: 11px; padding: 3px 8px; } }
      }
      @media (max-width: 600px) { flex-direction: column; }
    }
  `]
})
export class DiningComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private route = inject(ActivatedRoute);

  restaurants = signal<Restaurant[]>([]);
  loading = signal(false);
  searchQuery = '';
  priceFilter = '';
  cityFilter = '';
  private searchTimer: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.cityFilter = params['city'] || '';
      this.loadRestaurants();
    });
  }

  loadRestaurants(): void {
    this.loading.set(true);
    this.restaurantService.getRestaurants({
      category: 'dining',
      search: this.searchQuery || undefined,
      price_range: this.priceFilter || undefined,
      city: this.cityFilter || undefined,
    }).subscribe({
      next: (data) => { this.restaurants.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadRestaurants(), 400);
  }

  getPriceLabel(range: string): string {
    const map: Record<string, string> = { budget: '₹', moderate: '₹₹', expensive: '₹₹₹', luxury: '₹₹₹₹' };
    return map[range] ?? '₹₹';
  }
}
