// src/app/features/vms/services/vm.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap, throwError } from 'rxjs';
import { VirtualMachine, VMStatus } from '../interfaces/vm.interface';

@Injectable({ providedIn: 'root' })
export class VmService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/vms';

  private _isLoading = signal(false);
  // State
  private _vms = signal<VirtualMachine[]>([]);

  // Selectores (Read-only)
  public vms = computed(() => this._vms());
  public isLoading = computed(() => this._isLoading());
  loadVms() {
    this._isLoading.set(true);
    this.http.get<VirtualMachine[]>(this.API_URL).subscribe({
      next: (vms) => {
        this._vms.set(vms);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false)
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

    // 1. Optimistic UI 
    this._vms.update(list =>
      list.map(item => item.id === vm.id ? { ...item, status: nextStatus } : item)
    );

    return this.http.put(`${this.API_URL}/${vm.id}`, { ...vm, status: nextStatus }).pipe(
      catchError(err => {
        // 2. Rollback en caso de error 
        this._vms.set(previousVms);
        return throwError(() => err);
      })
    );
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
    const previousVms = this._vms();
    // Optimistic UI 
    this._vms.update(list => list.filter(vm => vm.id !== id));

    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      catchError(err => {
        // Rollback 
        this._vms.set(previousVms);
        return throwError(() => err);
      })
    );
  }
}