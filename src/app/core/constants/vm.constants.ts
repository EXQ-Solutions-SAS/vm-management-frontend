export const VM_MESSAGES = {
    SUCCESS: {
        CREATED: 'Instancia creada con éxito',
        UPDATED: 'Configuración actualizada',
        DELETED: 'Instancia eliminada correctamente',
        STATUS_CHANGED: (status: string) => `Instancia ${status.toLowerCase()}`,
    },
    ERROR: {
        SAVE: 'Error al guardar los cambios',
        DELETE: 'No se pudo eliminar la instancia',
        STATUS: 'Error al cambiar el estado de la VM',
        LOAD: 'Error al cargar las instancias del servidor',
    }
};

export const VM_FORM_DEFAULTS = {
    CPU: 1,
    RAM: 1,
    STORAGE: 10,
    OS: 'Ubuntu 22.04'
};

export const API_ENDPOINTS = {
    VMS: 'http://localhost:3000/vms',
    AUTH: 'http://localhost:3000/auth',
    WS_SERVER: 'http://localhost:3000'
};

export const AUTH_MESSAGES = {
    SUCCESS: '¡Bienvenido de nuevo!',
    ERROR: 'Credenciales inválidas o error de conexión',
    LOGOUT: 'Sesión cerrada correctamente'
};

export const SOCKET_EVENTS = {
    VM_UPDATED: 'vmUpdated',
    VM_CREATED: 'vmCreated',
    CONNECT: 'connect',
    DISCONNECT: 'disconnect'
};