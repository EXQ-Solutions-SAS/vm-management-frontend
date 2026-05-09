import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = 'http://localhost:3000/auth';

  // El estado global del usuario
  user = signal<{email: string, role: string} | null>(null);

  login(credentials: any) {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        this.user.set(res); // Guardamos email y role en el signal
        this.router.navigate(['/dashboard']); // ¡Pa' dentro!
      })
    );
  }

  isAdmin() {
    return this.user()?.role === 'ADMIN';
  }

  logout() {
    // Aquí podrías llamar al endpoint de logout del back si existe
    this.user.set(null);
    this.router.navigate(['/login']);
  }
}