import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';

import { MapService } from '../map.service';

@Component({
    selector: 'risk-map-header',
    styleUrls: ['./map-header.component.scss'],
    templateUrl: './map-header.component.html'
})
export class MapHeaderComponent implements OnInit, OnChanges {
    private _players = Array<any>();

    @Input()
    set players(players: Array<any>) {
        this._players = players;
    }

    get players(): Array<any> { return this._players; }

    currentTurnPlayer: any;

    constructor(private mapService: MapService) { }

    ngOnInit() {
        this.mapService.gameStateUpdates$.subscribe((gameState) => {
            console.log(gameState);
        });
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        console.log(changes);
    }
}
