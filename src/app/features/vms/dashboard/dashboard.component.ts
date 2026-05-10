import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { VmService } from '../services/vm.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VirtualMachine } from '../interfaces/vm.interface';
import { ToastService } from '../../../core/services/toast.service';
import { VM_FORM_DEFAULTS, VM_MESSAGES } from '../../../core/constants/vm.constants';

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
    cpu: [VM_FORM_DEFAULTS.CPU, [Validators.required, Validators.min(1)]],
    ram: [VM_FORM_DEFAULTS.RAM, [Validators.required, Validators.min(1)]],
    storage: [VM_FORM_DEFAULTS.STORAGE, [Validators.required, Validators.min(10)]],
    os: [VM_FORM_DEFAULTS.OS, [Validators.required]]
  });

  ngOnInit() {
    this.vmService.loadVms();
  }

  onSaveVm() {
    if (this.vmForm.invalid) return;
    this.isSubmitting.set(true);

    const isEditing = !!this.editingVm();
    const payload = {
      name: this.vmForm.value.name!,
      cores: Number(this.vmForm.value.cpu),
      ram: Number(this.vmForm.value.ram),
      disk: Number(this.vmForm.value.storage),
      os: this.vmForm.value.os!
    };

    const request = isEditing
      ? this.vmService.updateVm(this.editingVm()!.id, payload)
      : this.vmService.createVm(payload);

    request.subscribe({
      next: () => {
        this.toastService.show(isEditing ? VM_MESSAGES.SUCCESS.UPDATED : VM_MESSAGES.SUCCESS.CREATED);
        this.closeModal();
      },
      error: () => {
        this.toastService.show(VM_MESSAGES.ERROR.SAVE, 'error');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteVm(id: string) {
    this.vmService.deleteVm(id).subscribe({
      next: () => this.toastService.show(VM_MESSAGES.SUCCESS.DELETED),
      error: () => this.toastService.show(VM_MESSAGES.ERROR.DELETE, 'error')
    });
  }

  toggleVm(vm: VirtualMachine) {
    this.vmService.toggleStatus(vm).subscribe({
      next: () => {
        const action = vm.status === 'ENCENDIDA' ? 'apagada' : 'encendida';
        this.toastService.show(VM_MESSAGES.SUCCESS.STATUS_CHANGED(action));
      },
      error: () => this.toastService.show(VM_MESSAGES.ERROR.STATUS, 'error')
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


  logout() { this.authService.logout(); }

  openModal() { this.showModal.set(true); }

  closeModal() {
    this.showModal.set(false);
    this.editingVm.set(null);
    this.isSubmitting.set(false);
    this.vmForm.reset({
      cpu: VM_FORM_DEFAULTS.CPU,
      ram: VM_FORM_DEFAULTS.RAM,
      storage: VM_FORM_DEFAULTS.STORAGE,
      os: VM_FORM_DEFAULTS.OS
    });
  }
}