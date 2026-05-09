// src/app/core/services/real-time.service.ts
import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { VmService } from '../../features/vms/services/vm.service';

@Injectable({ providedIn: 'root' })
export class RealTimeService {
  private socket: Socket;
  private vmService = inject(VmService);

  constructor() {
    // Conectamos al namespace de VMs que definimos en NestJS
    this.socket = io('http://localhost:3000/vms', {
      withCredentials: true // Importante para que pase por el Guard del Socket
    });

    this.listenToChanges();
  }

  private listenToChanges() {
    // Cuando una VM se actualiza en el back (por otro usuario o proceso)
    this.socket.on('vmUpdated', (updatedVm) => {
      this.vmService.updateLocalVm(updatedVm);
    });

    // Cuando se crea una nueva
    this.socket.on('vmCreated', (newVm) => {
      this.vmService.addLocalVm(newVm);
    });
  }

  // Método para emitir si lo necesitas (ej. avisar que estás editando)
  emitChange(event: string, data: any) {
    this.socket.emit(event, data);
  }
}