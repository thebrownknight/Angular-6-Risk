import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utils } from './utils';
import { GamePayload } from '../helpers/data-models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private token: string;

    constructor(private http: HttpClient, private utils: Utils) { }

    /**
     * User games API endpoints.
     */
    // Get all games associated with the user
    public getUserGames(): Observable<any> {
        return this.utils.sendRequest('get', '/api/games');
    }
    public getPublicGames(): Observable<any> {
        return this.utils.sendRequest('get', '/api/games/public');
    }
    public createNewGame(gamePayload: GamePayload): Observable<any> {
        return this.utils.sendRequest('post', '/api/games/create', gamePayload, true);
    }
    public joinGame(joinGamePayload: any): Observable<any> {
        const routePayload = {
            playerIcon: joinGamePayload.playerIcon,
            playerColor: joinGamePayload.playerColor
        };

        return this.utils.sendRequest(
            'post',
            '/api/games/' + joinGamePayload.gameId + '/join', routePayload, true);
    }
    public startGame(gId: any): Observable<any> {
        return this.utils.sendRequest('post', '/api/games/' + gId + '/start', {}, true);
    }
    public deleteGame(gId: any): Observable<any> {
        return this.utils.sendRequest('get', '/api/games/' + gId + '/delete');
    }
}
