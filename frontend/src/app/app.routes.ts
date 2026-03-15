import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dining',
    loadComponent: () => import('./components/dining/dining.component').then(m => m.DiningComponent)
  },
  {
    path: 'nightlife',
    loadComponent: () => import('./components/nightlife/nightlife.component').then(m => m.NightlifeComponent)
  },
  {
    path: 'get-the-app',
    loadComponent: () => import('./components/get-the-app/get-the-app.component').then(m => m.GetTheAppComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent)
  },
  {
    path: 'add-restaurant',
    canActivate: [authGuard],
    loadComponent: () => import('./components/add-restaurant/add-restaurant.component').then(m => m.AddRestaurantComponent)
  },
  {
    path: 'order',
    canActivate: [authGuard],
    loadComponent: () => import('./components/order/order.component').then(m => m.OrderComponent)
  },
  {
    path: 'restaurant/:id',
    loadComponent: () => import('./components/restaurant/restaurant-layout.component').then(m => m.RestaurantLayoutComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./components/restaurant/restaurant-home/restaurant-home.component').then(m => m.RestaurantHomeComponent)
      },
      {
        path: 'menu',
        loadComponent: () => import('./components/restaurant/restaurant-menu/restaurant-menu.component').then(m => m.RestaurantMenuComponent)
      },
      {
        path: 'photos',
        loadComponent: () => import('./components/restaurant/restaurant-photos/restaurant-photos.component').then(m => m.RestaurantPhotosComponent)
      },
      {
        path: 'reviews',
        loadComponent: () => import('./components/restaurant/restaurant-review/restaurant-review.component').then(m => m.RestaurantReviewComponent)
      },
      {
        path: 'order',
        loadComponent: () => import('./components/restaurant/restaurant-order/restaurant-order.component').then(m => m.RestaurantOrderComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
