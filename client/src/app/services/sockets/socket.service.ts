import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, Observer } from 'rxjs';
import { share } from 'rxjs/operators';

import * as io from 'socket.io-client';
import { SocketConfig, SOCKET_CONFIG_TOKEN } from './socket.config';

@Injectable()
export class SocketService {
    subscribersCounter = 0;
    ioSocket: any;
    private initialized = false;

    constructor(
        @Inject(SOCKET_CONFIG_TOKEN) private config: SocketConfig,
        @Inject(PLATFORM_ID) private platformId: any
    ) { }

    on(eventName: string, callback: Function) {
        if (!this.ioSocket) {
            return;
        }
        this.ioSocket.on(eventName, callback);
    }

    once(eventName: string, callback: Function) {
        if (!this.ioSocket) {
            return;
        }
        this.ioSocket.once(eventName, callback);
    }

    connect(token?: any) {
        if (isPlatformServer(this.platformId)) {
            return {};
        }
        console.log(this.initialized);

        if (!this.initialized) {
            // const {url = '', options} = this.config;
            const newConfig = Object.assign(this.config, { options: { query: token } });

            console.log(newConfig);

            this.ioSocket = io(newConfig.url, newConfig.options);
            this.initialized = true;
        } else {
            this.ioSocket = this.ioSocket.connect();
        }
        console.log(this.ioSocket);
        return this.ioSocket;
    }

    disconnect(close?: any) {
        if (!this.ioSocket) {
            return;
        }
        console.log('Disconnecting from the socket service...');
        this.initialized = false;

        return this.ioSocket.disconnect.apply(this.ioSocket, arguments);
    }

    emit(eventName: string, data?: any, callback?: Function) {
        if (!this.ioSocket) {
            return;
        }
        return this.ioSocket.emit.apply(this.ioSocket, arguments);
    }

    removeListener(eventName: string, callback?: Function) {
        if (!this.ioSocket) {
            return;
        }
        return this.ioSocket.removeListener.apply(this.ioSocket, arguments);
    }

    removeAllListeners(eventName?: string) {
        if (!this.ioSocket) {
            return;
        }
        return this.ioSocket.removeAllListeners.apply(this.ioSocket, arguments);
    }

    fromEvent<T>(eventName: string): Observable<T> {
        if (!this.ioSocket) {
            return;
        }
        this.subscribersCounter++;
        return Observable.create((observer: any) => {
            this.ioSocket.on(eventName, (data: T) => {
                observer.next(data);
            });
            return () => {
                if (this.subscribersCounter === 1) {
                    this.ioSocket.removeListener(eventName);
                }
            };
        }).pipe(share());
    }

    /* Creates a Promise for a one-time event */
    fromEventOnce<T>(eventName: string): Promise<T> {
        if (!this.ioSocket) {
            return;
        }
        return new Promise<T>(resolve => this.once(eventName, resolve));
    }
}
