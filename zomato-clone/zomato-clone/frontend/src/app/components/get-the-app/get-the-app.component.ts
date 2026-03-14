import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-get-the-app',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-page">
      <div class="app-hero">
        <div class="container app-hero__content">
          <div class="app-hero__text">
            <h1>Get the <span>Zomato</span> app</h1>
            <p>Order food, discover restaurants, and get exclusive app-only deals — all in one place.</p>
            <div class="app-hero__qr">
              <div class="qr-placeholder"><i class="fas fa-qrcode"></i></div>
              <div>
                <p class="qr-label">Scan the QR code to<br/>download the app</p>
              </div>
            </div>
            <div class="store-buttons">
              <a href="#" class="store-btn store-btn--google">
                <i class="fab fa-google-play"></i>
                <div><span>Get it on</span><strong>Google Play</strong></div>
              </a>
              <a href="#" class="store-btn store-btn--apple">
                <i class="fab fa-apple"></i>
                <div><span>Download on the</span><strong>App Store</strong></div>
              </a>
            </div>
          </div>
          <div class="app-hero__mockup">
            <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=380" alt="App mockup" />
          </div>
        </div>
      </div>

      <div class="features-section">
        <div class="container">
          <h2>Everything you need, in your pocket</h2>
          <div class="features-grid">
            @for (f of features; track f.title) {
              <div class="feature-card">
                <div class="feature-card__icon" [style.background]="f.bg">
                  <i [class]="f.icon" [style.color]="f.color"></i>
                </div>
                <h3>{{ f.title }}</h3>
                <p>{{ f.desc }}</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="stats-section">
        <div class="container stats-grid">
          @for (s of stats; track s.label) {
            <div class="stat-card">
              <strong>{{ s.value }}</strong>
              <span>{{ s.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-hero {
      background: linear-gradient(135deg, #e23744, #ff6f00);
      padding: 60px 0;
      &__content { display: flex; align-items: center; gap: 60px;
        @media (max-width: 768px) { flex-direction: column; text-align: center; } }
      &__text {
        flex: 1; color: #fff;
        h1 { font-size: 44px; font-weight: 700; margin-bottom: 16px; span { color: #ffe082; } }
        p { font-size: 18px; opacity: .9; margin-bottom: 32px; }
      }
      &__qr { display: flex; align-items: center; gap: 16px; margin-bottom: 28px;
        @media (max-width: 768px) { justify-content: center; }
        .qr-placeholder { width: 80px; height: 80px; background: #fff; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          i { font-size: 52px; color: #333; } }
        .qr-label { font-size: 14px; line-height: 1.5; color: rgba(255,255,255,.85); }
      }
      &__mockup {
        flex: 0 0 280px;
        img { border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
        @media (max-width: 768px) { max-width: 200px; }
      }
    }
    .store-buttons { display: flex; gap: 12px; flex-wrap: wrap;
      @media (max-width: 768px) { justify-content: center; } }
    .store-btn {
      display: flex; align-items: center; gap: 12px;
      background: rgba(255,255,255,.15); border: 2px solid rgba(255,255,255,.3);
      color: #fff; padding: 12px 20px; border-radius: 12px;
      transition: all .2s; cursor: pointer;
      &:hover { background: rgba(255,255,255,.25); }
      i { font-size: 28px; }
      div span { display: block; font-size: 11px; opacity: .8; }
      div strong { font-size: 16px; }
    }
    .features-section { padding: 72px 0;
      h2 { text-align: center; font-size: 30px; font-weight: 700; margin-bottom: 40px; } }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px;
      @media (max-width: 768px) { grid-template-columns: 1fr; } }
    .feature-card { text-align: center; padding: 32px 24px;
      &__icon { width: 72px; height: 72px; border-radius: 50%; display: flex;
        align-items: center; justify-content: center; margin: 0 auto 16px;
        i { font-size: 28px; } }
      h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
      p { font-size: 14px; color: var(--text-secondary); line-height: 1.7; }
    }
    .stats-section { background: var(--secondary); padding: 48px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
      @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } }
    .stat-card { text-align: center; color: #fff;
      strong { display: block; font-size: 36px; font-weight: 700; color: var(--primary); margin-bottom: 4px; }
      span { font-size: 14px; color: #888; }
    }
  `]
})
export class GetTheAppComponent {
  features = [
    { icon: 'fas fa-search', color: '#e23744', bg: '#fdecea', title: 'Discover Restaurants', desc: 'Find the best restaurants, cafes, and bars near you with powerful search filters.' },
    { icon: 'fas fa-motorcycle', color: '#0288d1', bg: '#e1f5fe', title: 'Fast Delivery', desc: 'Order food online and get it delivered to your doorstep in under 45 minutes.' },
    { icon: 'fas fa-tag', color: '#27ae60', bg: '#e8f5e9', title: 'Exclusive Deals', desc: 'Get app-only discounts and offers on your favourite restaurants every day.' },
    { icon: 'fas fa-star', color: '#f39c12', bg: '#fff8e1', title: 'Reviews & Ratings', desc: 'Read honest reviews from millions of food lovers to pick the best spot.' },
    { icon: 'fas fa-clock', color: '#7b1fa2', bg: '#f3e5f5', title: 'Real-time Tracking', desc: 'Track your order in real-time from the restaurant kitchen to your door.' },
    { icon: 'fas fa-heart', color: '#e91e63', bg: '#fce4ec', title: 'Save Favourites', desc: 'Bookmark your favourite places and reorder with a single tap.' },
  ];

  stats = [
    { value: '10M+', label: 'App Downloads' },
    { value: '5000+', label: 'Restaurant Partners' },
    { value: '50+', label: 'Cities Covered' },
    { value: '4.8★', label: 'App Store Rating' },
  ];
}
