import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { Restaurant } from '../../../models/models';

@Component({
  selector: 'app-restaurant-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (restaurant() !== null) {
      <div class="restaurant-home">
        <!-- Left: Details -->
        <div class="details-col">
          <div class="card info-card">
            <h3><i class="fas fa-info-circle"></i> About</h3>
            <p>{{ restaurant()!.description || 'No description available.' }}</p>
          </div>

          <div class="card info-card">
            <h3><i class="fas fa-clock"></i> Hours</h3>
            @if (restaurant()!.operating_hours) {
              <div class="hours-list">
                @for (entry of getHoursEntries(restaurant()!); track entry.day) {
                  <div class="hours-row" [class.today]="entry.isToday">
                    <span>{{ entry.day }}</span>
                    <span [class.closed]="entry.hours === 'Closed'">{{ entry.hours }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="card info-card">
            <h3><i class="fas fa-concierge-bell"></i> Amenities</h3>
            <div class="features-list">
              @for (f of restaurant()!.features; track f) {
                <span class="feature-pill"><i class="fas fa-check"></i> {{ f }}</span>
              }
            </div>
          </div>
        </div>

        <!-- Right: Contact + Rating -->
        <div class="sidebar-col">
          <div class="card info-card">
            <h3><i class="fas fa-phone-alt"></i> Contact</h3>
            @if (restaurant()!.phone) {
              <p><i class="fas fa-phone"></i> <a [href]="'tel:' + restaurant()!.phone">{{ restaurant()!.phone }}</a></p>
            }
            @if (restaurant()!.email) {
              <p><i class="fas fa-envelope"></i> <a [href]="'mailto:' + restaurant()!.email">{{ restaurant()!.email }}</a></p>
            }
            @if (restaurant()!.website) {
              <p><i class="fas fa-globe"></i>
                <a [href]="restaurant()!.website" target="_blank" rel="noopener">Website</a>
              </p>
            }
          </div>

          <div class="card info-card">
            <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
            <p>{{ restaurant()!.location.address }}</p>
            <p>{{ restaurant()!.location.city }}, {{ restaurant()!.location.state }} {{ restaurant()!.location.zip_code }}</p>
          </div>

          <div class="card info-card rating-summary">
            <h3><i class="fas fa-star"></i> Rating</h3>
            <div class="big-rating">{{ restaurant()!.average_rating }}</div>
            <div class="stars">
              @for (s of getStars(restaurant()!.average_rating); track $index) {
                <i class="fas fa-star" [style.color]="s === 'empty' ? '#ddd' : '#f39c12'"></i>
              }
            </div>
            <p>Based on {{ restaurant()!.total_reviews }} reviews</p>
            <a [routerLink]="['../reviews']" class="btn btn--ghost btn--sm btn--block" style="margin-top:12px">
              Read all reviews
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .restaurant-home { display: grid; grid-template-columns: 1fr 340px; gap: 28px;
      @media (max-width: 900px) { grid-template-columns: 1fr; } }
    .info-card { padding: 22px; margin-bottom: 20px;
      h3 { font-size: 16px; font-weight: 700; margin-bottom: 14px; color: var(--text-primary);
        i { color: var(--primary); margin-right: 8px; } }
      p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 6px;
        i { width: 18px; color: var(--primary); margin-right: 6px; }
        a { color: var(--primary); } }
    }
    .hours-list { display: flex; flex-direction: column; gap: 6px; }
    .hours-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0;
      border-bottom: 1px solid var(--border);
      span:first-child { font-weight: 600; }
      &.today { background: var(--primary-light); margin: 0 -8px; padding: 6px 8px; border-radius: 6px; }
      .closed { color: var(--primary); }
    }
    .features-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .feature-pill { background: var(--bg); border: 1px solid var(--border); border-radius: 20px;
      padding: 5px 12px; font-size: 13px; font-weight: 500;
      i { color: var(--success); margin-right: 5px; font-size: 11px; } }
    .rating-summary { text-align: center;
      .big-rating { font-size: 52px; font-weight: 700; color: var(--primary); line-height: 1; margin: 8px 0 4px; }
      .stars i { font-size: 18px; margin: 0 2px; }
      p { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
    }
  `]
})
export class RestaurantHomeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  restaurant = signal<Restaurant | null>(null);

  ngOnInit(): void {
    const id = this.route.parent!.snapshot.paramMap.get('id')!;
    this.restaurantService.getById(id).subscribe(r => this.restaurant.set(r));
  }

  getHoursEntries(r: Restaurant): { day: string; hours: string; isToday: boolean }[] {
    if (!r.operating_hours) return [];
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const todayIdx = new Date().getDay();
    return days.map((d, i) => ({
      day: d.charAt(0).toUpperCase() + d.slice(1),
      hours: (r.operating_hours as any)[d] ?? 'Closed',
      isToday: i === todayIdx
    }));
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(rating >= i ? 'full' : rating >= i - 0.5 ? 'half' : 'empty');
    }
    return stars;
  }
}
