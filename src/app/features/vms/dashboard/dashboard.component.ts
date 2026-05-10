import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { VmService } from '../services/vm.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VirtualMachine } from '../interfaces/vm.interface';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  public vmService = inject(VmService);
  public authService = inject(AuthService);
  public toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  // CORRECCIÓN: Usar 'cores' y 'disk' que es lo que viene de Prisma
  totalCores = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.cores || 0), 0));
  totalRam = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.ram || 0), 0));
  totalStorage = computed(() => this.vmService.vms().reduce((acc, vm) => acc + (vm.disk || 0), 0));

  showModal = signal(false);
  isSubmitting = signal(false);
  editingVm = signal<VirtualMachine | null>(null); // Signal para saber si editamos

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

  onSaveVm() {
    if (this.vmForm.invalid) return;
    this.isSubmitting.set(true);

    const payload = {
      name: this.vmForm.value.name!,
      cores: Number(this.vmForm.value.cpu),
      ram: Number(this.vmForm.value.ram),
      disk: Number(this.vmForm.value.storage),
      os: this.vmForm.value.os!
    };

    const request = this.editingVm()
      ? this.vmService.updateVm(this.editingVm()!.id, payload) // PUT si hay edición
      : this.vmService.createVm(payload); // POST si es nueva

    request.subscribe({
      next: () => {
        this.toastService.show(this.editingVm() ? 'Configuración actualizada' : 'Instancia creada con éxito');
        this.closeModal();
      },
      error: () => {
        this.toastService.show('Error al guardar los cambios', 'error');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteVm(id: string) {
    this.vmService.deleteVm(id).subscribe({
      next: () => this.toastService.show('Instancia eliminada correctamente'),
      error: () => this.toastService.show('No se pudo eliminar la instancia', 'error')
    });
  }

  openEditModal(vm: VirtualMachine) {
    this.editingVm.set(vm);
    this.vmForm.patchValue({
      name: vm.name,
      cpu: vm.cores,
      ram: vm.ram,
      storage: vm.disk,
      os: vm.os
    });
    this.showModal.set(true);
  }

  toggleVm(vm: VirtualMachine) {
    this.vmService.toggleStatus(vm).subscribe({
      next: () => this.toastService.show(`Instancia ${vm.status === 'ENCENDIDA' ? 'apagada' : 'encendida'}`, 'success'),
      error: () => this.toastService.show('Error al cambiar el estado de la VM', 'error')
    });
  }

  logout() { this.authService.logout(); }

  openModal() { this.showModal.set(true); }

  closeModal() {
    this.showModal.set(false);
    this.editingVm.set(null);
    this.isSubmitting.set(false);
    this.vmForm.reset({
      cpu: 1,
      ram: 1,
      storage: 10,
      os: 'Ubuntu 22.04'
    });
  }
}