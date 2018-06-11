import { InjectionToken } from '@angular/core';

export interface SocketConfig {
    url: string;
    options?: any;
    connectOnAppLoad?: boolean;
}

export const SOCKET_CONFIG_TOKEN = new InjectionToken<SocketConfig>('__SOCKET_IO_CONFIG__');
