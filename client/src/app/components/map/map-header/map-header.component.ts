import { Component, Input, Output, OnInit, OnChanges, SimpleChange, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private isCurrentPlayer: Boolean;

    @Input()
    set players(players: Array<any>) {
        this._players = players;
    }

    get players(): Array<any> { return this._players; }

    @Output() playerTurnStep = new EventEmitter<string>();

    profileManagerState = 'closed';
    fullLoggedInUserDetails: any = {};
    currentTurnPlayer: any;

    /* Player turn steps forms */
    troopsPlacementForm: FormGroup;
    attackSequenceForm: FormGroup;
    fortifyTroopsForm: FormGroup;

    constructor(
        private authService: AuthenticationService,
        private mapService: MapService,
        private formBuilder: FormBuilder
    ) {
        // Get and store user details for customized output on games lists
        this.loggedInUser = this.authService.getUserDetails();
    }

    ngOnInit() {
        this.initTroopsPlacementForm();
        this.initAttackSequenceForm();
        this.initFortifyTroopsForm();

        this.mapService.gameStateUpdates$.subscribe((gameState) => {
            console.log(gameState);

            setTimeout(() => {
                // We have the current game state now, update the current player
                this.currentTurnPlayer = gameState.filter(elem => {
                    let modElem = {};
                    if (elem.status === 'CURRENTTURN') {
                        if (this.players.length > 0) {
                            modElem = this.players.filter(player => {
                                return player.player._id === elem._id;
                            })[0];
                            elem['icon'] = modElem['icon'];
                            elem['color'] = modElem['color'];
                        }
                        return elem;
                    }
                })[0];

                console.log(this.currentTurnPlayer);

                // Check to see if the logged in player is the current player
                this.isCurrentPlayer = this.currentTurnPlayer.player._id === this.loggedInUser._id;
            }, 500);
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

    /**
     * Initialize the player forms.
     */
    private initTroopsPlacementForm() {
        this.troopsPlacementForm = this.formBuilder.group({
            numberOfTroops: [2, Validators.required]
        });
    }
    private initAttackSequenceForm() {
        this.attackSequenceForm = this.formBuilder.group({
            attackingTerritory: ['', Validators.required],
            defendingTerritory: ['', Validators.required],
            attackNumberOfPlayers: [2, Validators.required]
        });
    }
    private initFortifyTroopsForm() {
        this.fortifyTroopsForm = this.formBuilder.group({
            movingTerritory: ['', Validators.required],
            fortifiedTerritory: ['', Validators.required],
            fortifyNumberOfPlayers: [2, Validators.required]
        });
    }
}
