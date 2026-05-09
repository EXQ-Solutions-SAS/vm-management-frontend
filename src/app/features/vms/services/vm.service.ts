// src/app/features/vms/services/vm.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { VirtualMachine, VMStatus } from '../interfaces/vm.interface';

@Injectable({ providedIn: 'root' })
export class VmService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/vms';

  // State
  private _vms = signal<VirtualMachine[]>([]);

  // Selectores (Read-only)
  public vms = computed(() => this._vms());

  loadVms() {
    return this.http.get<VirtualMachine[]>(this.API_URL).subscribe(data => {
      this._vms.set(data);
    });
  }

  createVm(data: any) {
    return this.http.post<VirtualMachine>(this.API_URL, data).pipe(
      tap(newVm => {
        // Si quieres actualizar manual antes del socket:
        this._vms.update(list => [newVm, ...list]);
      })
    );
  }

  // --- OPTIMISTIC UI ---
  toggleStatus(vm: VirtualMachine) {
    const previousVms = this._vms();
    const nextStatus: VMStatus = vm.status === 'ENCENDIDA' ? 'APAGADA' : 'ENCENDIDA';

    // 1. Update UI al instante
    this._vms.update(list =>
      list.map(item => item.id === vm.id ? { ...item, status: nextStatus } : item)
    );

    // 2. Request al back
    this.http.patch(`${this.API_URL}/${vm.id}/status`, { status: nextStatus })
      .subscribe({
        error: (err) => {
          console.error('Fallo el cambio de estado, aplicando rollback...', err);
          // 3. Rollback si el server falla (Requerimiento 17)
          this._vms.set(previousVms);
        }
      });
  }

  updateLocalVm(updatedVm: VirtualMachine) {
    this._vms.update(list =>
      list.map(vm => vm.id === updatedVm.id ? updatedVm : vm)
    );
  }

  addLocalVm(newVm: VirtualMachine) {
    this._vms.update(list => [newVm, ...list]);
  }

  deleteVm(id: string) {
    this._vms.update(list => list.filter(vm => vm.id !== id));
  }
}