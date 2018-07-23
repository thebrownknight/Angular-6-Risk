import { Component, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChange, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
export class MapHeaderComponent implements OnInit, OnChanges, OnDestroy {
    private _players = new BehaviorSubject<any[]>([]);
    private loggedInUser: UserDetails;

    @Input()
    set players(players: Array<any>) {
        this._players.next(players);
    }

    get players(): Array<any> { return this._players.getValue(); }

    @Input() turnMapData: any; // Get the information from the map when a user interacts with it for their turn steps

    @Output() modeAndPlayer = new EventEmitter<any>();
    @Output() turnFormData = new EventEmitter<any>();

    profileManagerState = 'closed';
    fullLoggedInUserDetails: any = {};
    currentTurnPlayer: any;
    isCurrentPlayer: Boolean;

    /* Player turn steps forms */
    troopsPlacementForm: FormGroup;
    attackSequenceForm: FormGroup;
    fortifyTroopsForm: FormGroup;

    /* Troops Placement variables */
    troopsPlacementArray: Array<number> = [];

    currentStep = '';

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

        // Listen for changes
        this.onTroopsPlacementFormChanges();

        this._players.subscribe(pl => {

            if (pl.length > 0) {
                this.fullLoggedInUserDetails = pl.filter((elem) => {
                    return elem.player._id === this.loggedInUser._id;
                })[0];

                this.mapService.gameStateUpdates$.subscribe((gameState) => {
                    // console.log(gameState);

                    // We have the current game state now, update the current player
                    this.currentTurnPlayer = gameState.filter(elem => {
                        let modElem = {};
                        if (elem.status === 'CURRENTTURN' || elem.status === 'GETTROOPS'
                            || elem.status === 'ATTACK' || elem.status === 'FORTIFY') {

                            modElem = pl.filter(el => {
                                return el.player._id === elem.player._id;
                            })[0];

                            // Set the icon and color for the current turn player since we don't have this information in the gameState
                            // ...(nor should we)
                            elem['icon'] = modElem['icon'];
                            elem['color'] = modElem['color'];

                            return elem;
                        }
                    })[0];

                    // console.log(this.currentTurnPlayer);

                    // Check to see if the logged in player is the current player
                    this.isCurrentPlayer = this.currentTurnPlayer.player._id === this.loggedInUser._id;

                    if (this.isCurrentPlayer) {
                        // Set the current step to be one of the 3 steps of a turn
                        this.currentStep = this.currentTurnPlayer.status === 'CURRENTTURN' ? 'GETTROOPS' : this.currentTurnPlayer.status;

                        // Emit the current step so the main map component can adjust
                        this.modeAndPlayer.emit({ playerStep: this.currentStep, currentPlayer: this.currentTurnPlayer });
                    }
            }, error => {
                console.log(error);
            });

            }
        });
    }

    /* Convenience getters for forms */
    get tpForm() {
        return this.troopsPlacementForm.controls;
    }
    get asForm() {
        return this.attackSequenceForm.controls;
    }
    get ftForm() {
        return this.fortifyTroopsForm.controls;
    }

    ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
        if (changes.turnMapData) {
            // Set the array to loop over the number of troops left to assign
            if (changes.turnMapData.currentValue.troopsAcquired) {
                if (this.troopsPlacementArray.length === 0) {
                    for (let i = 1; i <= changes.turnMapData.currentValue.troopsAcquired; i++) {
                        this.troopsPlacementArray.push(i);
                    }
                }
            }

            if (changes.turnMapData.currentValue.troopsPlacementTerritory) {
                this.troopsPlacementForm.patchValue({
                    troopsPlacementTerritory: changes.turnMapData.currentValue.troopsPlacementTerritory.id
                });
            }
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
            troopsPlacementTerritory: ['', Validators.required],
            numberOfTroops: [undefined, Validators.required]
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

    private onTroopsPlacementFormChanges() {
        this.troopsPlacementForm.get('numberOfTroops').valueChanges.subscribe(val => {
            if (val) {
                this.turnFormData.emit({
                    playerStep: this.currentStep,
                    troopsPlacementTerritory: this.troopsPlacementForm.get('troopsPlacementTerritory').value,
                    numberOfTroops: val
                });
            }
        });
    }

    ngOnDestroy() {
        this._players.unsubscribe();
    }
}
