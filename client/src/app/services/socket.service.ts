import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { SocketMessage, SocketEvent } from '../helpers/data-models';

import * as socketIo from 'socket.io-client';

const SERVER_URL = "http://localhost:3000";

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket;

    public initSocket(): void {
        this.socket = socketIo(SERVER_URL);
    }

    public send(message: SocketMessage): void {
        this.socket.emit('message', message);
    }

    public onMessage(): Observable<SocketMessage> {
        return new Observable<SocketMessage>(observer => {
            this.socket.on('message', (data: SocketMessage) => observer.next(data));
        });
    }

    public onEvent(sEvent: SocketEvent): Observable<any> {
        return new Observable<any>(observer => {
            this.socket.on(sEvent, () => observer.next());
        });
    }
}
