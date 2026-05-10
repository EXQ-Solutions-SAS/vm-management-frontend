import { Component, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AUTH_MESSAGES } from '../../../core/constants/vm.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {},
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set(AUTH_MESSAGES.ERROR);
      }
    });
  }
}