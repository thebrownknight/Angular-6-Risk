import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GamePayload } from '../helpers/data-models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    private token: string;

    constructor(private http: HttpClient) { }

    /**
     * User games API endpoints.
     */
    // Get all games associated with the user
    public getUserGames(): Observable<any> {
        return this.request('get', '/api/games');
    }
    public getPublicGames(): Observable<any> {
        return this.request('get', '/api/games/public');
    }
    public createNewGame(gamePayload: GamePayload): Observable<any> {
        return this.request('post', '/api/games/create', gamePayload);
    }

    private getToken(): string {
        if (!this.token) {
            this.token = localStorage.getItem('risk-token');
        }
        return this.token;
    }

    // Private helper method to create requests
    private request(method: 'post'|'get', route: string, payload?): Observable<any> {
        let baseUrl;

        if (method === 'post') {
            baseUrl = this.http.post(route, payload);
        } else {
            baseUrl = this.http.get(route, {
                headers: { Authorization: `Bearer ${this.getToken()}` }
            });
        }

        const request = baseUrl.pipe(
            map((data: any) => {
                return data;
            })
        );

        return request;
    }
}