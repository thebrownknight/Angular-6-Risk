import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SlidePanelService {
    private _stateSource: Subject<string> = new Subject<string>();
    public state$: Observable<string> = this._stateSource.asObservable();

    public toggle(state: string): void {
        console.log('Sliding ' + state);
        this._stateSource.next(state);
    }
}
