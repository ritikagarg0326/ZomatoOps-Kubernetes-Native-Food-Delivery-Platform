import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { Restaurant } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private restaurantService = inject(RestaurantService);
  private router = inject(Router);

  searchQuery = '';
  searchCity = '';
  featuredRestaurants = signal<Restaurant[]>([]);
  loading = signal(false);

  categories = [
    { name: 'Dining Out', icon: 'fas fa-utensils', route: '/dining', color: '#FF5722', bg: '#FBE9E7' },
    { name: 'Nightlife', icon: 'fas fa-cocktail', route: '/nightlife', color: '#7B1FA2', bg: '#F3E5F5' },
    { name: 'Cafes', icon: 'fas fa-coffee', route: '/dining?category=cafes', color: '#5D4037', bg: '#EFEBE9' },
    { name: 'Delivery', icon: 'fas fa-motorcycle', route: '/dining?category=delivery', color: '#0288D1', bg: '#E1F5FE' },
  ];

  cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];

  ngOnInit(): void {
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.loading.set(true);
    this.restaurantService.getRestaurants({ limit: 6 }).subscribe({
      next: (data) => { this.featuredRestaurants.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  search(): void {
    const params: Record<string, string> = {};
    if (this.searchQuery) params['search'] = this.searchQuery;
    if (this.searchCity) params['city'] = this.searchCity;
    this.router.navigate(['/dining'], { queryParams: params });
  }

  getPriceLabel(range: string): string {
    const map: Record<string, string> = { budget: '₹', moderate: '₹₹', expensive: '₹₹₹', luxury: '₹₹₹₹' };
    return map[range] ?? '₹₹';
  }
}
