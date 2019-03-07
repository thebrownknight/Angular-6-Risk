import { Component, Input, Output, OnInit, OnChanges, OnDestroy, SimpleChange, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { AuthenticationService } from '../../../services/authentication.service';
import { MapService } from '../map.service';
import { Utils } from '../../../services/utils';

import { UserDetails, Player } from '../../../helpers/data-models';

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
    private _players = new BehaviorSubject<Player[]>([]);
    private loggedInUser: UserDetails;

    @Input()
    set players(players: Array<Player>) {
        this._players.next(players);
    }

    get players(): Array<Player> { return this._players.getValue(); }

    @Input() turnMapData: any; // Get the information from the map when a user interacts with it for their turn steps

    @Output() modeAndPlayer = new EventEmitter<any>();
    @Output() turnFormData = new EventEmitter<any>();   // Send information to map from header from user interactions

    profileManagerState = 'closed';
    fullLoggedInUserDetails: any = {};
    currentTurnPlayer: Player;
    isCurrentPlayer: Boolean;

    /* Player turn steps forms */
    troopsPlacementForm: FormGroup;
    attackSequenceForm: FormGroup;
    fortifyTroopsForm: FormGroup;

    /* Troops Placement variables */
    placementResults: Array<any> = [];
    troopsAcquired = -1;
    troopsLeftToPlace = -1;

    /* Attack Phase variables */
    attackCompleted = false;
    attackingTerritory: any;
    attackingTerritoryDice: Array<number> = [];
    defendingTerritory: any;
    attackResults: Array<any> = [];

    currentStep = '';

    constructor(
        private authService: AuthenticationService,
        private mapService: MapService,
        private formBuilder: FormBuilder,
        private utils: Utils
    ) {
        // Get and store user details for customized output on games lists
        this.loggedInUser = this.authService.getUserDetails();
    }

    ngOnInit() {
        this.initTroopsPlacementForm();
        this.initAttackSequenceForm();
        this.initFortifyTroopsForm();

        // Listen for changes
        // this.onTroopsPlacementFormChanges();

        this._players.subscribe(pl => {

            if (pl.length > 0) {
                // this.fullLoggedInUserDetails = pl.filter((elem) => {
                //     return elem.player._id === this.loggedInUser._id;
                // })[0];

                this.mapService.gameStateUpdates$.subscribe((gameState) => {
                    // console.log(gameState);

                    // We have the current game state now, update the current player
                    const ctpGameState = gameState.filter(elem => {
                        return (elem.status === 'CURRENTTURN' || elem.status === 'GETTROOPS'
                            || elem.status === 'ATTACK' || elem.status === 'FORTIFY');
                    })[0];

                    this.currentTurnPlayer = pl.map(player => {
                        if (player.playerInformation._id === ctpGameState.player) {
                            player.status = ctpGameState.status;
                        }
                        return player;
                    }).filter(p => p.playerInformation._id === ctpGameState.player)[0];

                    // console.log(this.currentTurnPlayer);

                    // Check to see if the logged in player is the current player
                    this.isCurrentPlayer = this.currentTurnPlayer.playerInformation._id === this.loggedInUser._id;

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
                if (this.troopsAcquired === -1) {
                    // We're getting the number of troops acquired for the first time
                    this.troopsAcquired = changes.turnMapData.currentValue.troopsAcquired;
                    this.troopsLeftToPlace = this.troopsAcquired;
                }
            }

            if (changes.turnMapData.currentValue.troopsPlacementTerritory) {
                this.troopsPlacementForm.patchValue({
                    troopsPlacementTerritory: changes.turnMapData.currentValue.troopsPlacementTerritory.id
                });
            }

            if (changes.turnMapData.currentValue.placementTerritories) {
                this.placementResults = changes.turnMapData.currentValue.placementTerritories;

                // Do the calculation for number of troops left to place
                let troopsAdded = 0;

                this.placementResults.forEach(result => {
                   troopsAdded += result.troopsAdded;
                });

                this.troopsLeftToPlace = this.troopsAcquired - troopsAdded;
            }

            if (changes.turnMapData.currentValue.attackingTerritory) {
                if (!this.utils.isEmpty(changes.turnMapData.currentValue.attackingTerritory)) {
                    this.attackingTerritory = changes.turnMapData.currentValue.attackingTerritory;
                    if (this.attackingTerritory) {
                        this.asForm.attackingTerritory.setValue(this.attackingTerritory.id);
                    }
                    if (this.attackingTerritoryDice.length === 0) {
                        const attackNumDice = changes.turnMapData.currentValue.attackingTerritory.troops > 3
                            ? 3 : changes.turnMapData.currentValue.attackingTerritory.troops - 1;
                        for (let i = 1; i <= attackNumDice; i++) {
                            this.attackingTerritoryDice.push(i);
                        }
                    }
                } else {
                    this.attackingTerritory = null;
                    this.attackingTerritoryDice = [];   // Reset the number of dice being rolled
                }
            }

            if (changes.turnMapData.currentValue.defendingTerritory) {
                if (!this.utils.isEmpty(changes.turnMapData.currentValue.defendingTerritory)) {
                    this.defendingTerritory = changes.turnMapData.currentValue.defendingTerritory;
                    if (this.defendingTerritory) {
                        this.asForm.defendingTerritory.setValue(this.defendingTerritory.id);
                    }
                } else {
                    this.defendingTerritory = null;
                }
            }

            if (changes.turnMapData.currentValue.attackResults && changes.turnMapData.currentValue.attackResults.length > 0) {
                // An attack has been completed, we can show the Finish button
                this.attackCompleted = true;
                this.attackResults = changes.turnMapData.currentValue.attackResults;
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
     * Undo troops placement.
     */
    undoTroopsPlacement(): void {
        this.turnFormData.emit({
            playerStep: this.currentStep,
            action: 'undo'
        });
    }

    /**
     * Reset troops placement.
     */
    resetTroopsPlacement(): void {
        this.turnFormData.emit({
            playerStep: this.currentStep,
            action: 'reset'
        });
    }

    /**
     * Finish troops placement and move on to the next step.
     */
    finishTroopsPlacement(): void {
        // this.currentStep = 'ATTACK';
        // this.turnFormData.emit({
        //     playerStep: this.currentStep
        // });
        this.turnFormData.emit({
            playerStep: this.currentStep,
            action: 'save'
        });
    }

    /**
     * Attack territory with chosen number of troops.
     */
    attackTerritory(): void {
        if (this.attackSequenceForm.valid) {
            console.log(this.attackSequenceForm.value);

            this.turnFormData.emit({
                playerStep: this.currentStep,
                action: 'attack',
                attackData: {
                    attackTerritory: this.attackingTerritory,
                    defendingTerritory: this.defendingTerritory,
                    numberOfDice: this.asForm.attackNumberOfDice.value
                }
            });
        }
    }

    /**
     * Cancel attack selection.
     */
    cancelAttackSelection(): void {
        this.turnFormData.emit({
            playerStep: this.currentStep,
            action: 'cancel'
        });
    }

    /**
     * Skip to step (or finish and change turns if at the end).
     */
    skipToStep(step: string): void {
        switch (step) {
            case 'fortify':
                this.turnFormData.emit({
                    playerStep: this.currentStep,
                    action: 'skip'
                });
                break;
        }
    }

    /**
     * Initialize the player forms.
     */
    private initTroopsPlacementForm() {
        this.troopsPlacementForm = this.formBuilder.group({
            placementTerritories: ['', Validators.required]
        });
    }
    private initAttackSequenceForm() {
        this.attackSequenceForm = this.formBuilder.group({
            attackingTerritory: ['', Validators.required],
            defendingTerritory: ['', Validators.required],
            attackNumberOfDice: [1, Validators.required]
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

                // Reduce the number of troops available
                this.troopsLeftToPlace = this.troopsAcquired - val;
            }
        });
    }

    ngOnDestroy() {
        this._players.unsubscribe();
    }
}
