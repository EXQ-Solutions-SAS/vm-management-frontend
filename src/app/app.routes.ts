import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/vms/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard'; // Asegúrate de importar tu guard

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] // <--- AQUÍ: El candado para que nadie entre sin token
  },
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];