import { Component, Input, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AuthenticationService } from '../../../services/authentication.service';
import { MapService } from '../map.service';

import { UserDetails } from '../../../helpers/data-models';

@Component({
    selector: 'risk-map-header',
    styleUrls: ['./map-header.component.scss'],
    templateUrl: './map-header.component.html',
    animations: [
        trigger('toggleProfileManager', [
            state('opened', style({
                opacity: 1,
                height: '*'
            })),
            state('closed', style({
                opacity: 0,
                height: 0
            })),
            transition('closed <=> opened', [
                animate('300ms ease')
            ])
        ])
    ]
})
export class MapHeaderComponent implements OnInit, OnChanges {
    private _players = Array<any>();
    private loggedInUser: UserDetails;

    @Input()
    set players(players: Array<any>) {
        this._players = players;
    }

    get players(): Array<any> { return this._players; }

    profileManagerState = 'closed';
    fullLoggedInUserDetails: any = {};
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
        if (changes.players && changes.players.currentValue.length > 0) {
            this.fullLoggedInUserDetails = changes.players.currentValue.filter((elem) => {
                return elem.player._id === this.loggedInUser._id;
            })[0];
        }
    }

    /**
     * Toggle the profile manager dropdown.
     */
    toggleProfileManager() {
        this.profileManagerState = this.profileManagerState === 'closed' ? 'opened' : 'closed';
    }

    /**
     * Log the user out of the system.
     */
    logout(): void {
        this.authService.logout();
    }
}
