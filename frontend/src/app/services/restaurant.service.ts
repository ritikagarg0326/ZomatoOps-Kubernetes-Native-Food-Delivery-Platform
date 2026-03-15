import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Restaurant, MenuItem, Review, ReviewPayload } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private base = '/api/restaurants';

  constructor(private http: HttpClient) {}

  getRestaurants(filters?: {
    category?: string;
    city?: string;
    search?: string;
    price_range?: string;
    skip?: number;
    limit?: number;
  }): Observable<Restaurant[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params = params.set(k, String(v));
        }
      });
    }
    return this.http.get<Restaurant[]>(this.base + '/', { params });
  }

  getById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.base}/${id}`);
  }

  create(data: any): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.base + '/', data);
  }

  update(id: string, data: any): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.base}/${id}`, data);
  }

  // Menu
  getMenu(restaurantId: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.base}/${restaurantId}/menu`);
  }

  addMenuItem(restaurantId: string, item: any): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.base}/${restaurantId}/menu`, item);
  }

  // Reviews
  getReviews(restaurantId: string, skip = 0, limit = 20): Observable<Review[]> {
    const params = new HttpParams().set('skip', skip).set('limit', limit);
    return this.http.get<Review[]>(`${this.base}/${restaurantId}/reviews`, { params });
  }

  addReview(restaurantId: string, review: ReviewPayload): Observable<Review> {
    return this.http.post<Review>(`${this.base}/${restaurantId}/reviews`, review);
  }

  // Photos
  getPhotos(restaurantId: string): Observable<{ photos: string[] }> {
    return this.http.get<{ photos: string[] }>(`${this.base}/${restaurantId}/photos`);
  }

  addPhoto(restaurantId: string, url: string): Observable<Restaurant> {
    return this.http.post<Restaurant>(`${this.base}/${restaurantId}/photos`, { url });
  }
}
