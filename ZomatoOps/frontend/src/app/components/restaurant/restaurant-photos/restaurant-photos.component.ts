import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService } from '../../../services/restaurant.service';

@Component({
  selector: 'app-restaurant-photos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photos-page">
      <h2>Photos ({{ photos().length }})</h2>

      @if (loading()) {
        <div class="spinner"><div class="spin"></div></div>
      } @else if (photos().length === 0) {
        <div class="empty-state">
          <i class="fas fa-images"></i>
          <h3>No photos yet</h3>
          <p>Be the first to add photos of this restaurant.</p>
        </div>
      } @else {
        <div class="photos-grid">
          @for (photo of photos(); track $index) {
            <div class="photo-item" (click)="openLightbox(photo)">
              <img [src]="photo" alt="Restaurant photo" loading="lazy" />
              <div class="photo-item__overlay">
                <i class="fas fa-expand-alt"></i>
              </div>
            </div>
          }
        </div>
      }

      <!-- Lightbox -->
      @if (lightboxUrl()) {
        <div class="lightbox" (click)="closeLightbox()">
          <button class="lightbox__close" (click)="closeLightbox()">
            <i class="fas fa-times"></i>
          </button>
          <img [src]="lightboxUrl()!" (click)="$event.stopPropagation()" alt="Full size photo" />
          <div class="lightbox__nav">
            <button (click)="$event.stopPropagation(); prevPhoto()"><i class="fas fa-chevron-left"></i></button>
            <span>{{ lightboxIndex() + 1 }} / {{ photos().length }}</span>
            <button (click)="$event.stopPropagation(); nextPhoto()"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .photos-page h2 { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 480px) { grid-template-columns: 1fr; }
    }
    .photo-item { position: relative; aspect-ratio: 4/3; overflow: hidden; border-radius: var(--radius-sm); cursor: pointer;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
      &__overlay { position: absolute; inset: 0; background: rgba(0,0,0,.3); opacity: 0; display: flex;
        align-items: center; justify-content: center; transition: opacity .2s;
        i { color: #fff; font-size: 24px; } }
      &:hover { img { transform: scale(1.05); } .photo-item__overlay { opacity: 1; } }
    }
    .lightbox { position: fixed; inset: 0; background: rgba(0,0,0,.92); z-index: 9000;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      img { max-width: 90vw; max-height: 80vh; border-radius: var(--radius-sm); object-fit: contain; }
      &__close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,.2); border: none;
        color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 18px; cursor: pointer; }
      &__nav { display: flex; align-items: center; gap: 24px; margin-top: 20px; color: #fff;
        button { background: rgba(255,255,255,.2); border: none; color: #fff; width: 40px; height: 40px;
          border-radius: 50%; font-size: 16px; cursor: pointer; &:hover { background: rgba(255,255,255,.3); } }
        span { font-size: 14px; }
      }
    }
  `]
})
export class RestaurantPhotosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private restaurantService = inject(RestaurantService);

  photos = signal<string[]>([]);
  loading = signal(true);
  lightboxUrl = signal<string | null>(null);
  lightboxIndex = signal(0);

  ngOnInit(): void {
    const id = this.route.parent!.snapshot.paramMap.get('id')!;
    this.restaurantService.getPhotos(id).subscribe({
      next: ({ photos }) => { this.photos.set(photos); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openLightbox(url: string): void {
    this.lightboxIndex.set(this.photos().indexOf(url));
    this.lightboxUrl.set(url);
  }

  closeLightbox(): void { this.lightboxUrl.set(null); }

  prevPhoto(): void {
    const i = (this.lightboxIndex() - 1 + this.photos().length) % this.photos().length;
    this.lightboxIndex.set(i);
    this.lightboxUrl.set(this.photos()[i]);
  }

  nextPhoto(): void {
    const i = (this.lightboxIndex() + 1) % this.photos().length;
    this.lightboxIndex.set(i);
    this.lightboxUrl.set(this.photos()[i]);
  }
}
