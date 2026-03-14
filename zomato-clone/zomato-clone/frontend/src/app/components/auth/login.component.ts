import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-card__header">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" name="email" [(ngModel)]="email" required placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-field">
              <input [type]="showPw ? 'text' : 'password'" name="password" [(ngModel)]="password"
                     required placeholder="••••••••" />
              <button type="button" (click)="showPw = !showPw">
                <i class="fas" [class.fa-eye]="!showPw" [class.fa-eye-slash]="showPw"></i>
              </button>
            </div>
          </div>

          @if (error()) {
            <div class="alert alert--error"><i class="fas fa-exclamation-circle"></i> {{ error() }}</div>
          }

          <button type="submit" class="btn btn--primary btn--block btn--lg" [disabled]="loading()">
            @if (loading()) { <i class="fas fa-spinner fa-spin"></i> Signing in... }
            @else { Sign in }
          </button>
        </form>

        <div class="auth-card__footer">
          Don't have an account? <a routerLink="/register">Sign up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card {
      background: #fff; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
      width: 100%; max-width: 440px; overflow: hidden;
      &__header { background: linear-gradient(135deg, var(--primary), var(--primary-dark));
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
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  email = '';
  password = '';
  showPw = false;
  loading = signal(false);
  error = signal('');

  onLogin(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Invalid email or password');
        this.loading.set(false);
      }
    });
  }
}
