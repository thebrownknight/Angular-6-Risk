import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class Utils {
    private token: string;

    constructor(private http: HttpClient) { }

    private getToken(): string {
        if (!this.token) {
            this.token = localStorage.getItem('risk-token');
        }
        return this.token;
    }

    public sendRequest(method: 'post'|'get', route: string, payload?: any, authenticate?: boolean): Observable<any> {
        let baseUrl;

        if (method === 'post') {
            if (authenticate) {
                baseUrl = this.http.post(route, payload, {
                    headers: { Authorization: `Bearer ${this.getToken()}` }
                });
            } else {
                baseUrl = this.http.post(route, payload);
            }
        } else {
            // GET request - this is always authorized
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

    public isEmpty(obj): boolean {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }

        return true;
    }

    public mergeObjects(obj1, obj2): any {
        const mergedObj = {};

        for (const key in obj1) {
            if (obj1.hasOwnProperty(key)) {
                if (obj2[key] !== undefined) {
                    mergedObj[key] = obj2[key];
                } else {
                    mergedObj[key] = obj1[key];
                }
            }
        }

        return mergedObj;
    }

    public formatDate(inputDate, withTime = false): string {
        if (inputDate === null || inputDate === undefined || inputDate === '') {
            return;
        }

        const months = ['January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            year = inputDate.getFullYear(),
            month = months[inputDate.getMonth()],
            date = inputDate.getDate(),
            hour = inputDate.getHours(),
            min = inputDate.getMinutes(),
            sec = inputDate.getSeconds();

        let formattedDate = month + ', ' + date + ' ' + year;
        if (withTime) {
            formattedDate += ' ' + hour + ':' + min;
        }

        return formattedDate;
    }

    public deepCopy<T>(o: T): T {
        return JSON.parse(JSON.stringify(o));
    }
}
