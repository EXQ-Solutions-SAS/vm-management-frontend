import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { VmService } from '../../features/vms/services/vm.service';
import { API_ENDPOINTS, SOCKET_EVENTS } from '../constants/vm.constants';

@Injectable({ providedIn: 'root' })
export class RealTimeService {
  private socket: Socket;
  private vmService = inject(VmService);

  constructor() {
    this.socket = io(`${API_ENDPOINTS.WS_SERVER}/vms`, {
      withCredentials: true 
    });

    this.listenToChanges();
  }

  private listenToChanges() {
    this.socket.on(SOCKET_EVENTS.VM_UPDATED, (updatedVm) => {
      this.vmService.updateLocalVm(updatedVm);
    });

    this.socket.on(SOCKET_EVENTS.VM_CREATED, (newVm) => {
      this.vmService.addLocalVm(newVm);
    });
  }

  emitChange(event: string, data: any) {
    this.socket.emit(event, data);
  }
}