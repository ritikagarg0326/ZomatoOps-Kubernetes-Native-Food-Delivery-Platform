import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Review } from '../../../models/models';

@Component({
  selector: 'app-restaurant-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="reviews-page">
      <!-- Write a review -->
      @if (auth.isLoggedIn()) {
        <div class="card write-review">
          <h3>Write a Review</h3>
          <div class="star-rating">
            @for (s of [1,2,3,4,5]; track s) {
              <i class="fas fa-star" [class.active]="s <= newRating"
                 (click)="newRating = s" (mouseenter)="hover = s" (mouseleave)="hover = 0"
                 [class.hovered]="hover >= s"></i>
            }
            <span class="rating-label">{{ ratingLabels[newRating - 1] || 'Select rating' }}</span>
          </div>
          <div class="form-group">
            <label>Visit type</label>
            <select [(ngModel)]="visitType">
              <option value="">Select visit type</option>
              <option value="dine-in">Dine-in</option>
              <option value="delivery">Delivery</option>
              <option value="takeaway">Takeaway</option>
            </select>
          </div>
          <div class="form-group">
            <label>Title (optional)</label>
            <input type="text" [(ngModel)]="reviewTitle" placeholder="Great experience!" />
          </div>
          <div class="form-group">
            <label>Your review *</label>
            <textarea [(ngModel)]="reviewBody" rows="4" placeholder="Tell others about your experience..."
                      minlength="10"></textarea>
          </div>
          <button class="btn btn--primary" (click)="submitReview()" [disabled]="submitting() || newRating === 0">
            @if (submitting()) { <i class="fas fa-spinner fa-spin"></i> Submitting... }
            @else { <i class="fas fa-paper-plane"></i> Submit Review }
          </button>
        </div>
      } @else {
        <div class="card login-prompt">
          <i class="fas fa-star"></i>
          <p>Please <a [routerLink]="['/login']">log in</a> to write a review.</p>
        </div>
      }

      <!-- Reviews list -->
      <div class="reviews-list">
        <h3>{{ reviews().length }} Reviews</h3>
        @if (loading()) {
          <div class="spinner"><div class="spin"></div></div>
        } @else if (reviews().length === 0) {
          <div class="empty-state">
            <i class="fas fa-comment-slash"></i>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience!</p>
          </div>
        } @else {
          @for (r of reviews(); track r.id) {
            <div class="card review-card">
              <div class="review-card__header">
                <div class="reviewer-avatar">{{ r.user_name.charAt(0).toUpperCase() }}</div>
                <div>
                  <strong>{{ r.user_name }}</strong>
                  <p class="review-date">{{ r.created_at | date:'mediumDate' }}</p>
                </div>
                <div class="review-rating ml-auto">
                  <span class="rating"><i class="fas fa-star"></i> {{ r.rating }}</span>
                  @if (r.visit_type) {
                    <span class="badge badge--blue">{{ r.visit_type }}</span>
                  }
                </div>
              </div>
              @if (r.title) { <h4 class="review-title">{{ r.title }}</h4> }
              <p class="review-body">{{ r.body }}</p>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .reviews-page { max-width: 760px; }
    .write-review { padding: 24px; margin-bottom: 28px;
      h3 { font-size: 18px; font-weight: 700; margin-bottom: 18px; } }
    .star-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 16px;
      i { font-size: 28px; color: var(--border); cursor: pointer; transition: color .15s;
        &.active, &.hovered { color: #f39c12; } }
      .rating-label { font-size: 14px; color: var(--text-secondary); margin-left: 8px; }
    }
    .login-prompt { padding: 24px; text-align: center; margin-bottom: 28px;
      i { font-size: 36px; color: var(--border); display: block; margin-bottom: 12px; }
      a { color: var(--primary); font-weight: 600; }
    }
    .reviews-list h3 { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .review-card { padding: 20px; margin-bottom: 16px;
      &__header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 12px;
        strong { font-size: 15px; font-weight: 700; display: block; }
        .review-date { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .review-rating { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
      }
    }
    .reviewer-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary);
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; flex-shrink: 0; }
    .ml-auto { margin-left: auto; }
    .review-title { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
    .review-body { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
  `]
})
export class RestaurantReviewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);
  auth = inject(AuthService);
  private toast = inject(ToastService);

  reviews = signal<Review[]>([]);
  loading = signal(true);
  submitting = signal(false);

  newRating = 0;
  hover = 0;
  reviewTitle = '';
  reviewBody = '';
  visitType = '';
  ratingLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

  restaurantId = '';

  ngOnInit(): void {
    this.restaurantId = this.route.parent!.snapshot.paramMap.get('id')!;
    this.loadReviews();
  }

  loadReviews(): void {
    this.restaurantService.getReviews(this.restaurantId).subscribe({
      next: (data) => { this.reviews.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  submitReview(): void {
    if (this.newRating === 0 || this.reviewBody.length < 10) {
      this.toast.error('Please select a rating and write at least 10 characters.');
      return;
    }
    this.submitting.set(true);
    this.restaurantService.addReview(this.restaurantId, {
      rating: this.newRating,
      title: this.reviewTitle || undefined,
      body: this.reviewBody,
      visit_type: this.visitType || undefined
    }).subscribe({
      next: (review) => {
        this.reviews.update(r => [review, ...r]);
        this.newRating = 0;
        this.reviewTitle = '';
        this.reviewBody = '';
        this.visitType = '';
        this.submitting.set(false);
        this.toast.success('Review submitted!');
      },
      error: (err) => {
        this.toast.error(err.error?.detail || 'Could not submit review');
        this.submitting.set(false);
      }
    });
  }
}
