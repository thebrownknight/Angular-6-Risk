import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';

import { AuthenticationService } from '../../../services/authentication.service';
import { MapService } from '../map.service';

import { UserDetails } from '../../../helpers/data-models';

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

    loggedInUser: UserDetails;
    currentTurnPlayer: any;

    constructor(
        private authService: AuthenticationService,
        private mapService: MapService
    ) {
        // Get and store user details for customized output on games lists
        this.loggedInUser = this.authService.getUserDetails();
    }

    ngOnInit() {
        this.mapService.gameStateUpdates$.subscribe((gameState) => {
            console.log(gameState);
        }, error => {
            console.log(error);
        });
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        console.log(changes);
    }
}
