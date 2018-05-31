import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Router } from '@angular/router';

import { appConfig } from '../app.config';
import { UserDetails, TokenPayload } from '../helpers/data-models';

// Login and register endpoints expect a TokenPayload during the request
// and return a TokenResponse object
interface TokenResponse {
  token: string;
}

// providedIn parameter set to 'root' means this Injectable will be registered as a singleton
// in the application and we don't need to add it to the providers of the root module
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
    private token: string;

    constructor(private http: HttpClient, private router: Router) { }

    /********************
     * Private methods
     ********************/
    private saveToken(token: string): void {
      localStorage.setItem('risk-token', token);
      this.token = token;
    }

    private getToken(): string {
      if (!this.token) {
        this.token = localStorage.getItem('risk-token');
      }
      return this.token;
    }

    private request(method: 'post'|'get', type: string, params?: any): Observable<any> {
      let baseUrl;

      if (method === 'post') {
        baseUrl = this.http.post(`/api/users/${type}`, params);
      } else {
          let urlString = `/api/users/${type}`;
          if (params != null) {
              urlString += '/?';
              for (const key in params) {
                  if (params.hasOwnProperty(key)) {
                      urlString += key + '=' + params[key] + '&';
                  }
              }
              urlString = urlString.slice(0, -1);
          }
        baseUrl = this.http.get(urlString, {
          headers: { Authorization: `Bearer ${this.getToken()}` }
        });
      }

      const request = baseUrl.pipe(
        map((data: any) => {
          if (data.token) {
            this.saveToken(data.token);
          }
          return data;
        })
      );

      return request;
    }

    /********************
     * Public methods
     ********************/
    public getUserDetails(): UserDetails {
      const token = this.getToken();
      let payload;
      // JWT token is made up of 3 separate strings, separated by a '.':
      // 1. Header - an encoded JSON object containing the type and the hashing algorithm used
      // 2. Payload - an encoded JSON object containing the data, the real body of the token
      // 3. Signature - an encrypted hash of the header and payload, using the "secret" key
      if (token) {
        // Grab the actual payload of the JWT token
        payload = token.split('.')[1];
        // Decode the payload using window.atob() to decode the Base64 string
        payload = window.atob(payload);
        return JSON.parse(payload);
      } else {
        return null;
      }
    }

    public isLoggedIn(): boolean {
      const user = this.getUserDetails();
      if (user) {
        return user.exp > Date.now() / 1000;
      } else {
        return false;
      }
    }

    // API Endpoints
    public register(user: TokenPayload): Observable<any> {
      return this.request('post', 'register', user);
    }

    public login(user: TokenPayload): Observable<any> {
      return this.request('post', 'login', user);
    }

    public profile(): Observable<any> {
      return this.request('get', 'profile');
    }

    /**
     * Async validation endpoint for username.
     */
    public validateUsername(username): Observable<any> {
        const baseUrl = '/api/users/validateusername';
        const queryUrl = `?username=${username}`;

        return this.http.get(baseUrl + queryUrl);
    }

    public logout(): void {
      this.token = '';
      window.localStorage.removeItem('risk-token');
      this.router.navigateByUrl('/login');
    }

}
