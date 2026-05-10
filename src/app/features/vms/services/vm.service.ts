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

    // 1. Optimistic UI: Update UI al instante (Requisito 17) [cite: 17]
    this._vms.update(list =>
      list.map(item => item.id === vm.id ? { ...item, status: nextStatus } : item)
    );

    // 2. Request al back usando PUT y la ruta correcta /vms/{id} (Requisito 44) 
    // Mandamos el objeto completo o solo el cambio, pero por PUT como pide la guía
    this.http.put(`${this.API_URL}/${vm.id}`, { ...vm, status: nextStatus })
      .subscribe({
        next: (updatedVm) => {
          console.log('Estado actualizado en servidor:', updatedVm);
          // Opcional: Podrías actualizar con la respuesta real del server si fuera necesario
        },
        error: (err) => {
          console.error('Fallo el cambio de estado, aplicando rollback...', err);
          // 3. Rollback si el server falla (Requerimiento 17) [cite: 17]
          this._vms.set(previousVms);

          // Aquí podrías disparar un Toast de error (Requisito 19) [cite: 19]
        }
      });
  }

  updateVm(id: string, payload: any) {
    // Según Requisito 44 de la guía de IFX
    return this.http.put<VirtualMachine>(`${this.API_URL}/${id}`, payload).pipe(
      tap(updatedVm => {
        this._vms.update(list =>
          list.map(vm => vm.id === id ? updatedVm : vm)
        );
      })
    );
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
    // 1. Guardamos el estado previo para el rollback (Requisito 17) 
    const previousVms = this._vms();

    // 2. Optimistic UI: Borramos de la lista local inmediatamente 
    this._vms.update(list => list.filter(vm => vm.id !== id));

    // 3. Petición al Backend usando el endpoint DELETE /vms/{id} (Requisito 45) 
    this.http.delete(`${this.API_URL}/${id}`).subscribe({
      next: () => {
        console.log('VM eliminada correctamente del servidor');
        // No necesitamos hacer nada más porque el signal ya se actualizó
      },
      error: (err) => {
        console.error('Error al eliminar la VM, restaurando estado...', err);
        // 4. Rollback: Si el servidor falla, devolvemos la VM a la lista 
        this._vms.set(previousVms);

        // Bonus: Aquí deberías mostrar un Toast de error (Requisito 19) [cite: 19]
      }
    });
  }
}