import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/models';

@Component({
  selector: 'app-nightlife',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-header nightlife-header">
      <div class="container">
        <h1><i class="fas fa-cocktail"></i> Nightlife</h1>
        <p>Bars, clubs, lounges, and more — the night is yours</p>
      </div>
    </div>

    <div class="container page-content">
      <div class="filters">
        <div class="form-group">
          <input type="text" placeholder="Search bars & clubs..." [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" />
        </div>
        <div class="form-group">
          <select [(ngModel)]="cityFilter" (ngModelChange)="load()">
            <option value="">All Cities</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="spinner"><div class="spin"></div></div>
      } @else if (restaurants().length === 0) {
        <div class="empty-state">
          <i class="fas fa-glass-martini-alt"></i>
          <h3>No nightlife venues found</h3>
          <p>Check back later or <a routerLink="/add-restaurant">add your venue</a>!</p>
        </div>
      } @else {
        <div class="nightlife-grid">
          @for (r of restaurants(); track r.id) {
            <a [routerLink]="['/restaurant', r.id, 'home']" class="card nightlife-card">
              <div class="nightlife-card__img">
                <img [src]="r.cover_image_url || 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600'"
                     [alt]="r.name" loading="lazy" />
                <div class="nightlife-card__overlay">
                  <span class="rating"><i class="fas fa-star"></i> {{ r.average_rating }}</span>
                </div>
              </div>
              <div class="nightlife-card__body">
                <h3>{{ r.name }}</h3>
                <p class="type">{{ r.cuisine_types.join(' · ') }}</p>
                <p class="location"><i class="fas fa-map-marker-alt"></i> {{ r.location.address }}, {{ r.location.city }}</p>
                <div class="features">
                  @for (f of r.features.slice(0,3); track f) {
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
    .nightlife-header {
      background: linear-gradient(135deg, #1a0533, #4a148c);
      color: #fff;
      padding: 40px 0;
      h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; i { margin-right: 10px; } }
      p { opacity: .85; font-size: 16px; }
    }
    .page-content { padding: 32px 20px; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px;
      .form-group { margin: 0; flex: 1; } }
    .nightlife-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 580px) { grid-template-columns: 1fr; }
    }
    .nightlife-card {
      cursor: pointer;
      &__img { position: relative; height: 220px; overflow: hidden;
        img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; }
        &:hover img { transform: scale(1.05); }
      }
      &__overlay {
        position: absolute; bottom: 12px; right: 12px;
        .rating { background: rgba(0,0,0,.7); color: #fff; padding: 4px 10px; border-radius: 20px; font-size: 13px; font-weight: 700; }
      }
      &__body { padding: 16px;
        h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
        .type { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; }
        .location { font-size: 13px; color: var(--text-muted); margin-bottom: 10px; i { margin-right: 4px; color: #7B1FA2; } }
        .features { display: flex; gap: 6px; flex-wrap: wrap; .badge { font-size: 11px; } }
      }
    }
  `]
})
export class NightlifeComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  restaurants = signal<Restaurant[]>([]);
  loading = signal(false);
  searchQuery = '';
  cityFilter = '';
  private timer: any;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.restaurantService.getRestaurants({
      category: 'nightlife',
      search: this.searchQuery || undefined,
      city: this.cityFilter || undefined
    }).subscribe({
      next: d => { this.restaurants.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onSearch(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.load(), 400);
  }
}
