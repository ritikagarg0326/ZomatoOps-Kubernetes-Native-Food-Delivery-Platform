import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../services/restaurant.service';
import { MenuItem } from '../../../models/models';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="menu-page">
      <div class="menu-header">
        <h2>Menu</h2>
        <div class="menu-filters">
          <button class="filter-btn" [class.active]="!vegOnly" (click)="vegOnly = false">All</button>
          <button class="filter-btn veg" [class.active]="vegOnly" (click)="vegOnly = true">
            <span class="veg-dot"></span> Veg Only
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="spinner"><div class="spin"></div></div>
      } @else if (groupedMenu().length === 0) {
        <div class="empty-state">
          <i class="fas fa-utensils"></i>
          <h3>No menu items yet</h3>
        </div>
      } @else {
        @for (group of groupedMenu(); track group.category) {
          <div class="menu-section">
            <h3 class="menu-section__title">{{ group.category }}</h3>
            <div class="menu-items">
              @for (item of group.items; track item.id) {
                <div class="card menu-item" [class.unavailable]="!item.is_available">
                  <div class="menu-item__info">
                    <div class="menu-item__top">
                      @if (item.is_vegetarian) {
                        <span class="veg-icon" title="Vegetarian"><span class="veg-dot"></span></span>
                      }
                      <h4>{{ item.name }}</h4>
                    </div>
                    <p class="desc">{{ item.description }}</p>
                    @if (item.allergens.length > 0) {
                      <p class="allergens"><i class="fas fa-exclamation-triangle"></i> {{ item.allergens.join(', ') }}</p>
                    }
                    <span class="price">₹{{ item.price }}</span>
                  </div>
                  <div class="menu-item__image">
                    @if (item.image_url) {
                      <img [src]="item.image_url" [alt]="item.name" loading="lazy" />
                    }
                    @if (item.is_available) {
                      <a [routerLink]="['../order']" class="add-btn btn btn--primary btn--sm">
                        <i class="fas fa-plus"></i> Add
                      </a>
                    } @else {
                      <span class="unavailable-badge">Unavailable</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .menu-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
      h2 { font-size: 24px; font-weight: 700; } }
    .menu-filters { display: flex; gap: 8px; }
    .filter-btn { padding: 7px 16px; border-radius: 20px; border: 2px solid var(--border); background: #fff;
      font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; transition: all .2s;
      &.active { border-color: var(--success); color: var(--success); background: #e8f5e9; }
      &.veg { display: flex; align-items: center; gap: 6px; } }
    .veg-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--success); border: 2px solid #1b5e20; display: inline-block; }
    .veg-icon { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px;
      border: 2px solid var(--success); border-radius: 3px; margin-right: 6px; flex-shrink: 0; }
    .menu-section { margin-bottom: 36px;
      &__title { font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px;
        border-bottom: 2px solid var(--border); color: var(--text-primary); } }
    .menu-items { display: flex; flex-direction: column; gap: 14px; }
    .menu-item {
      display: flex; justify-content: space-between; padding: 18px; gap: 16px;
      &.unavailable { opacity: .6; }
      &__top { display: flex; align-items: center; margin-bottom: 6px; }
      h4 { font-size: 16px; font-weight: 700; }
      .desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.5; }
      .allergens { font-size: 12px; color: var(--warning); margin-bottom: 8px; i { margin-right: 4px; } }
      .price { font-size: 16px; font-weight: 700; color: var(--text-primary); }
      &__image { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
        img { width: 100px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); } }
      .unavailable-badge { font-size: 12px; color: var(--primary); font-weight: 600; }
    }
  `]
})
export class RestaurantMenuComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  vegOnly = false;

  groupedMenu = computed(() => {
    const items = this.menuItems().filter(i => !this.vegOnly || i.is_vegetarian);
    const map = new Map<string, MenuItem[]>();
    items.forEach(i => {
      if (!map.has(i.category)) map.set(i.category, []);
      map.get(i.category)!.push(i);
    });
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  });

  ngOnInit(): void {
    const id = this.route.parent!.snapshot.paramMap.get('id')!;
    this.restaurantService.getMenu(id).subscribe({
      next: (data) => { this.menuItems.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
