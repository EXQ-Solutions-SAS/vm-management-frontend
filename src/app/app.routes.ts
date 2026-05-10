import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/vms/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard'; // Asegúrate de importar tu guard

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
    // Opcional: podrías poner un "publicGuard" para que no entren al login si ya están logueados
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] // <--- AQUÍ: El candado para que nadie entre sin token
  },
  { 
    path: '', 
    redirectTo: 'dashboard', // Cambiamos a dashboard para que el guard decida si lo deja pasar o lo manda al login
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];