import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type SortDirection = 'asc' | 'desc';

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

    public objectContainsValue(obj, value: any): boolean {
        return Object.values(obj).indexOf(value) > -1;
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

    /**
     * Helper method to lighten/darken colors using JavaScript.
     * Use positive numbers for lightening, negative numbers for darkening.
     */
    /* tslint:disable:no-bitwise */
    public lightDarkenColor(color, amount) {
        let usePound = false;

        // If the first character of the color is a pound sign, set the flag
        if (color[0] === '#') {
            color = color.slice(1); // Set the color without the pound sign
            usePound = true;
        }

        // Convert the color to a base16 number
        const num = parseInt(color, 16);

        let r = (num >> 16) + amount;

        // We can't have greater than 255 or less than 0 for an rgb value
        if (r > 255) {
            r = 255;
        } else if (r < 0) {
            r = 0;
        }

        let b = ((num >> 8) & 0x00FF) + amount;

        if (b > 255) {
            b = 255;
        } else if (b < 0) {
            b = 0;
        }

        let g = (num & 0x0000FF) + amount;

        if (g > 255) {
            g = 255;
        } else if (g < 0) {
            g = 0;
        }

        return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
    }
    /* tslint:enable:no-bitwise */

    /**
     * Method to help sort the players by turnOrder.
     */
    public sortPlayers(playersObj: Array<any>, dir: SortDirection): Array<any> {
        switch (dir) {
            case 'asc':
                return playersObj.sort((a, b) => {
                    if (a.turnOrder < b.turnOrder) { return -1; }
                    if (a.turnOrder > b.turnOrder) { return 1; }

                    return 0;
                });
            case 'desc':
                return playersObj.sort((a, b) => {
                    if (a.turnOrder < b.turnOrder) { return 1; }
                    if (a.turnOrder > b.turnOrder) { return -1; }

                    return 0;
                });
        }
    }
}
