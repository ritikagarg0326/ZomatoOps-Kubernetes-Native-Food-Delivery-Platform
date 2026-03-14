import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__header">
          <h2>Create an account</h2>
          <p>Join millions of food lovers</p>
        </div>
        <form (ngSubmit)="onRegister()" #f="ngForm" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" name="name" [(ngModel)]="form.name" required placeholder="John Doe" />
          </div>
          <div class="form-group">
            <label>Email address</label>
            <input type="email" name="email" [(ngModel)]="form.email" required placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Phone number</label>
            <input type="tel" name="phone" [(ngModel)]="form.phone" required placeholder="+91 9876543210" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-field">
              <input [type]="showPw ? 'text' : 'password'" name="password" [(ngModel)]="form.password"
                     required minlength="6" placeholder="Min. 6 characters" />
              <button type="button" (click)="showPw = !showPw">
                <i class="fas" [class.fa-eye]="!showPw" [class.fa-eye-slash]="showPw"></i>
              </button>
            </div>
          </div>
          @if (error()) {
            <div class="alert alert--error"><i class="fas fa-exclamation-circle"></i> {{ error() }}</div>
          }
          <button type="submit" class="btn btn--primary btn--block btn--lg" [disabled]="loading()">
            @if (loading()) { <i class="fas fa-spinner fa-spin"></i> Creating account... }
            @else { Create account }
          </button>
        </form>
        <div class="auth-card__footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card {
      background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
      width: 100%; max-width: 440px;
      &__header { background: linear-gradient(135deg, var(--primary), #ff6f00);
        color: #fff; padding: 32px; text-align: center;
        h2 { font-size: 26px; font-weight: 700; margin-bottom: 6px; }
        p { opacity: .85; } }
      &__footer { padding: 20px 32px; text-align: center; border-top: 1px solid var(--border);
        font-size: 14px; color: var(--text-secondary);
        a { color: var(--primary); font-weight: 600; } }
    }
    .auth-form { padding: 28px 32px; }
    .password-field { position: relative;
      input { padding-right: 44px; }
      button { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--text-muted); font-size: 16px; } }
    .alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: var(--radius-sm);
      font-size: 14px; margin-bottom: 16px;
      &--error { background: var(--primary-light); color: var(--primary); } }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  form = { name: '', email: '', phone: '', password: '' };
  showPw = false;
  loading = signal(false);
  error = signal('');

  onRegister(): void {
    if (!this.form.name || !this.form.email || !this.form.phone || !this.form.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome aboard 🎉');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
