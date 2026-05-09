export type VMStatus = 'ENCENDIDA' | 'APAGADA'; // Tal cual el enum de Prisma

export interface VirtualMachine {
  id: string;
  name: string;
  cores: number;
  ram: number;
  disk: number;
  os: string;
  status: VMStatus;
  createdAt: Date;
  updatedAt: Date;
}
