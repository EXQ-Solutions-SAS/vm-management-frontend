// src/app/core/services/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_ENDPOINTS, AUTH_MESSAGES } from '../constants/vm.constants';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private readonly API_URL = API_ENDPOINTS.AUTH;

  user = signal<{email: string, role: string} | null>(null);

  login(credentials: any) {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        this.user.set(res);
        this.toastService.show(AUTH_MESSAGES.SUCCESS);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  isAdmin() {
    return this.user()?.role === 'ADMIN';
  }

  logout() {
    this.user.set(null);
    this.toastService.show(AUTH_MESSAGES.LOGOUT);
    this.router.navigate(['/login']);
  }
}