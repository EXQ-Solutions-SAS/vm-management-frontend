import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { VmService } from '../services/vm.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public vmService = inject(VmService);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // CORRECCIÓN: Usar 'cores' y 'disk' que es lo que viene de Prisma
  totalCores = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.cores || 0), 0));
  totalRam = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.ram || 0), 0));
  totalStorage = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.disk || 0), 0));

  showModal = signal(false);
  isSubmitting = signal(false);

  // El formulario puede mantener nombres amigables, pero los mapearemos al enviar
  vmForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    cpu: [1, [Validators.required, Validators.min(1)]],
    ram: [1, [Validators.required, Validators.min(1)]],
    storage: [10, [Validators.required, Validators.min(10)]],
    os: ['Ubuntu 22.04', [Validators.required]] // Campo faltante requerido por Prisma
  });

  ngOnInit() {
    this.vmService.loadVms();
  }

  onCreateVm() {
    if (this.vmForm.invalid) return;
    this.isSubmitting.set(true);

    // MAPEÓ CRÍTICO: Transformar para que el Backend no explote
    const payload = {
      name: this.vmForm.value.name,
      cores: Number(this.vmForm.value.cpu), // cpu -> cores
      ram: Number(this.vmForm.value.ram),
      disk: Number(this.vmForm.value.storage), // storage -> disk
      os: this.vmForm.value.os
    };

    this.vmService.createVm(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  toggleVm(vm: any) { this.vmService.toggleStatus(vm); }
  logout() { this.authService.logout(); }
  openModal() { this.showModal.set(true); }
  closeModal() { 
    this.showModal.set(false); 
    this.vmForm.reset({ cpu: 1, ram: 1, storage: 10, os: 'Ubuntu 22.04' }); 
  }
}