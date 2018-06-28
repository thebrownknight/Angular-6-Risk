import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Utils } from './utils';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    constructor(private http: HttpClient, private utils: Utils) { }

    /**
     * Verify that the game code exists within the database.
     *
     * Params:
     * 1) code: string
     *
     * Returns Observable with game if code exists otherwise null.
     */
    public verifyGameCode(code: string): Observable<any> {
        return this.utils.sendRequest('get', '/api/games/code/' + code);
    }

    /**
     * Assign the territories randomly (for now) to the players.
     *
     * Params:
     * 1) players: Array<any> -- array of player objects in the game
     */
    public assignTerritories(players: Array<any>): Array<any> {
        return;
    }
}
