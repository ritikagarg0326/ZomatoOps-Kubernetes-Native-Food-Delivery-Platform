import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-restaurant',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './add-restaurant.component.html',
  styleUrls: ['./add-restaurant.component.scss']
})
export class AddRestaurantComponent {
  private restaurantService = inject(RestaurantService);
  private router = inject(Router);
  private toast = inject(ToastService);

  saving = signal(false);
  step = signal(1);

  form = {
    name: '',
    description: '',
    category: 'dining',
    cuisine_types: '',
    price_range: 'moderate',
    phone: '',
    email: '',
    website: '',
    cover_image_url: '',
    features: '',
    location: {
      address: '',
      city: '',
      state: '',
      zip_code: ''
    },
    operating_hours: {
      monday: '09:00-22:00',
      tuesday: '09:00-22:00',
      wednesday: '09:00-22:00',
      thursday: '09:00-22:00',
      friday: '09:00-23:00',
      saturday: '09:00-23:00',
      sunday: '10:00-21:00'
    }
  };

  categories = ['dining', 'nightlife', 'cafes', 'delivery'];
  priceRanges = [
    { value: 'budget', label: '₹ Budget' },
    { value: 'moderate', label: '₹₹ Moderate' },
    { value: 'expensive', label: '₹₹₹ Expensive' },
    { value: 'luxury', label: '₹₹₹₹ Luxury' }
  ];

  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  nextStep(): void { this.step.update(s => Math.min(s + 1, 3)); }
  prevStep(): void { this.step.update(s => Math.max(s - 1, 1)); }

  onSubmit(): void {
    this.saving.set(true);
    const payload = {
      ...this.form,
      cuisine_types: this.form.cuisine_types.split(',').map(s => s.trim()).filter(Boolean),
      features: this.form.features.split(',').map(s => s.trim()).filter(Boolean),
    };

    this.restaurantService.create(payload).subscribe({
      next: (r) => {
        this.toast.success('Restaurant listed successfully!');
        this.router.navigate(['/restaurant', r.id, 'home']);
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Failed to create restaurant');
        this.saving.set(false);
      }
    });
  }
}
