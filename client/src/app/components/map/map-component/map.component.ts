import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../../../services/authentication.service';
import { AlertService } from '../../../services/alert.service';
import { MapService } from '../map.service';
import { DiceService } from '../dice.service';

import { Utils } from '../../../services/utils';
import { UserDetails, Territory, Alert, AlertType, TurnType, Record, Player } from '../../../helpers/data-models';

// jQuery declaration
declare var $: any;

// Game state update enum
const enum GameStateUpdateType {
    Cards,
    Territories,
    PlayerStatus
}

@Component({
  selector: 'risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [ MapService ]
//   providers: [
//       {
//           provide: MapConfig,
//           useClass: class ExtendMapConfig { }
//       }
//   ]
// have a clear/cancel button after user selects attacking territory
// make possible defending countries more prominent
// for history - URL structure (start=[beginning number]&end=[end number]&move=[specific move number])
})
export class MapComponent implements OnInit, OnDestroy {
    // private mapW = 708.11981;
    // private mapH = 465.85077;

    private tempNearbyTerritories: Array<string> = [];
    private loggedInUser: UserDetails;
    private _mapMode: string;
    private _currentPlayer: any;

    private _playerColorMap: any = {};
    private _playerUsernameMap: any = {};

    $mapArea: any;  // Reference to the jQuery Mapael object
    gamePlayers: Array<any> = [];   // Array of the players in the game
    gameState: any;

    mapDataForPlayersTurn: any = { };    // The information gathered from interacting with the map on a player's turn

    /* Turn specific variables */
    // Troops placement
    private _troopsAcquired = 0;
    private _placementTerritories: Array<any> = [];
    private _placementCounter = 0;

    // Attacking
    private _tempAttackingTerritory = '';
    private _tempDefendingTerritory = '';
    private _attacksArray: Array<any> = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
        private alertService: AlertService,
        private mapService: MapService,
        private diceService: DiceService,
        private utils: Utils
    ) {
        this.loggedInUser = this.authService.getUserDetails();
    }

    ngOnInit() {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                return this.mapService.verifyGameCode(params.get('code'));
            })
        ).subscribe((game) => {
            if (game) {
                // Assign turn order for the players
                // Only do this if the turnOrder is not set yet
                const nPlayersArr = [] as Array<Player>;
                if (game.players[0].turnOrder === -1) {
                    game.players.forEach(playerDetails => {
                        const playerObj = {} as Player;
                        playerObj.playerInformation = {} as UserDetails;

                        playerObj.status = playerDetails.status;
                        playerObj.color = playerDetails.color;
                        playerObj.icon = playerDetails.icon;
                        playerObj.turnOrder = playerDetails.turnOrder;
                        playerObj.playerInformation = playerDetails.player;

                        nPlayersArr.push(playerObj);
                    });
                    this.gamePlayers = this.mapService.assignTurnOrder(nPlayersArr);
                } else {
                    this.gamePlayers = this.utils.sortPlayers(nPlayersArr, 'asc');
                }

                // Send the map name, game ID, and game players to the
                // service to set the common game information to reference in the service
                this.mapService.setGameConfiguration({
                    map: game.map,
                    gameID: game._id,
                    players: this.gamePlayers
                });

                // Set the player usernames and colors in easily referenced maps
                this.gamePlayers.forEach(player => {
                    this._playerColorMap[player.player._id] = player.color;
                    this._playerUsernameMap[player.player._id] = player.player.username;
                });

                if (game.gameMeta) {
                    this.gameState = game.gameMeta.state;
                    this.mapService.emitGameState(this.gameState);

                    // Reformat the game log to display it
                    let formattedLog = game.gameMeta.log as Array<Record>;
                    formattedLog = formattedLog.map((record: Record) => {
                        const newRecord = {} as Record;
                        newRecord.turnType = record.turnType;
                        newRecord.playerDetails = this.gamePlayers.filter(x => x.player._id === record.playerDetails);
                        newRecord.data = record.data;

                        return newRecord;
                    });
                    console.log(formattedLog);
                    this.mapService.emitGameLog(formattedLog);
                    this.setupMap(false);
                } else {
                    this.setupMap(true);
                }
            } else {
                // Incorrect code, navigate back to the dashboard
                // This will also take care of redirecting back to the
                // login page if the user is not authorized
                this.router.navigate(['/dashboard']);
            }
        });
    }

    setupMap(assignNewTerritories: boolean) {
        this.$mapArea = $('.risk-board');
        this.$mapArea.mapael({
            map: {
                name: 'risk_board',
                zoom: {
                    enabled: true,
                    maxLevel: 15
                },
                defaultArea: {
                    eventHandlers: {
                        click: (e, id, mapElem) => {
                            this.mapClickActions(e, id, mapElem);
                        },
                        dblclick: (e, id, mapElem, textElem) => {
                            // console.log(id);
                            // this.$mapArea.trigger('zoom', {
                            //     area: id,
                            //     areaMargin: 10
                            // });
                            return;
                        }
                    },
                    attrs: {
                        fill: '#f4f4e8',
                        stroke: '#ffffff'
                    }
                },
                afterInit: ($self, paper, areas, plots, options) => {
                    // Initialize the new map info we're going to update with
                    const newData = {
                        areas: {},
                        legend: {
                            area: {
                                title: 'Players',
                                cssClass: 'areaLegend',
                                // exclusive: true,
                                slices: []
                            }
                        }
                    };

                    const newPlots = {};

                    if (assignNewTerritories) {
                        // We do the random distribution of territories to the players
                        this.gameState = this.mapService.assignTerritories(this.gamePlayers);
                    }

                    // Now we grab the territoryMeta from each player and fill the colors of the territories with the players' colors

                    // Loop through the players, grab the player colors and player usernames and store them in objects
                    // Update legend information here
                    this.gamePlayers.forEach(player => {
                        // playerColorMap[player.player._id] = player.color;
                        // playerUsernameMap[player.player._id] = player.player.username;

                        // const isLoggedIn = this.loggedInUser._id === player.player._id;

                        // Set the legend here too so we can save looping again
                        newData.legend.area.slices.push({
                            legendSpecificAttrs: {
                                fill: player.color
                            },
                            sliceValue: player.player.username,
                            label: player.player.username,
                            // clicked: isLoggedIn
                        });
                    });

                    // Since we don't have player information except for ID in the gameState, use the objects we created above
                    // to grab the player color and usernames to set value and fill
                    this.gameState.forEach(playerMeta => {
                        // console.log(playerMeta);
                        playerMeta.territoryMeta.forEach(territory => {
                            const playerId = playerMeta.player._id;
                            const territoryName = this.mapService.getName(territory.id);
                            const playerUsername = this._playerUsernameMap[playerId];

                            newData.areas[territory.id] = {
                                value: this._playerUsernameMap[playerId],
                                attrs: {
                                    fill: this._playerColorMap[playerId],
                                    cursor: 'pointer',
                                    stroke: '#FFFFFF',
                                    'stroke-width': 1
                                },
                                attrsHover: {
                                    fill: this.utils.lightDarkenColor(this._playerColorMap[playerId], -20)
                                },
                                tooltip: {
                                    content: this.generateTooltip(territoryName, playerUsername),
                                    offset: {
                                        left: 0,
                                        top: 20
                                    }
                                }
                            };

                            newPlots[territory.id + '_plot'] = {
                                type: 'circle',
                                size: 15,
                                plotsOn: territory.id,
                                attrs: {
                                    fill: '#FFFFFF',
                                    'fill-opacity': 0.8,
                                    stroke: '#B5B4B4',
                                    'stroke-width': 1
                                },
                                attrsHover: {
                                    fill: '#FFFFFF',
                                    'fill-opacity': 1,
                                    'stroke-width': 1
                                },
                                text: {
                                    content: territory.troops + '',
                                    position: 'inner',
                                    attrs: {
                                        'font-size': 8,
                                        fill: '#5A5A5A'
                                    },
                                    attrsHover: {
                                        fill: '#5A5A5A'
                                    }
                                }
                            };
                        });
                    });

                    // console.log(newData);

                    this.$mapArea.trigger('update', [{
                        mapOptions: newData,
                        newPlots: newPlots
                    }]);
                }
            },
            legend: {
                area: {
                    title: '',
                    slices: [
                        {}
                    ]
                }
            }
        });
    }

    clearZoom() {
        this.$mapArea.trigger('zoom', { level: 0 });
    }

    /**
     * Map click functionality broken out into its own function.
     * Used for reference when setting up event handlers.
     */
    private mapClickActions(e, id, mapElem) {
        if (this._mapMode) {
            // We perform different click actions on the map based on what step the player is on
            // whose turn it is
            const updatedOptions = {
                areas: {}
            };
            switch (this._mapMode) {
                // Clicks grab the name of the territory clicked and update the troops count based on the
                // number of troops selected in the dropdown
                case 'GETTROOPS':
                    // Increment the placement counter to update the changeset for undoing purposes
                    this._placementCounter++;

                    const originalColor = mapElem.originalAttrs.fill;
                    const tHighlightColor = '#44b57d';

                    updatedOptions.areas[id] = {
                        attrs: {
                            fill: tHighlightColor,
                            cursor: 'pointer'
                        },
                        attrsHover: {
                            fill: tHighlightColor
                        }
                    };

                    this.$mapArea.trigger('update', [{
                        mapOptions: updatedOptions
                    }]);

                    // console.log(mapElem);
                    mapElem.attr({
                        fill: tHighlightColor
                    });

                    // mapElem.originalAttrs.fill = tHighlightColor;
                    // mapElem.attrsHover.fill = tHighlightColor;

                    // Check to see if the territory already exists
                    if (!this._placementTerritories.some(t => t.id === id)) {
                        // We don't have it so add it to the array of territories the user
                        // has placed troops in
                        this._placementTerritories.push({
                            id: id,
                            name: this.mapService.getName(id),
                            totalTroops: this.updateTroopsCount(id, '1'),
                            troopsAdded: 1,
                            changeset: [this._placementCounter],
                            originalColor: originalColor
                        });
                    } else {
                        // Just update the record in the array with the new number of troops
                        this._placementTerritories.map(t => {
                            if (t.id === id) {
                                // console.log(t.changeset);
                                t.totalTroops = this.updateTroopsCount(id, '1');
                                t.troopsAdded = t.troopsAdded + 1;
                                t.changeset.push(this._placementCounter);
                            }
                            return t;
                        });
                    }

                    this.mapDataForPlayersTurn = {
                        troopsAcquired: this._troopsAcquired,
                        placementTerritories: this._placementTerritories
                    };

                    if (this._placementCounter === this._troopsAcquired) {
                        this.togglePlayerTerritories(this._currentPlayer, 'disable');
                    }
                    break;
                case 'ATTACK':
                    if (this._tempAttackingTerritory === '') {
                        console.log('ATTACKING');
                        this._tempAttackingTerritory = id;
                        this.resetHighlightedTerritories();
                        this.highlightNearbyTerritories(this._currentPlayer, id);

                        // Disable selection of user's territories
                        this.togglePlayerTerritories(this._currentPlayer, 'disable');

                        // Send the data to the map header to show user
                        this.mapDataForPlayersTurn = {
                            attackingTerritory: {
                                id: id,
                                name: this.mapService.getName(id),
                                color: this.getTerritoryColor(id),
                                troops: this.getNumTroops(id)
                            }
                        };
                    } else {
                        // We're choosing the defending territory
                        console.log('DEFENDING TERRITORY: ' + id);
                        this._tempDefendingTerritory = id;

                        this.mapDataForPlayersTurn = {
                            attackingTerritory: {
                                id: this._tempAttackingTerritory,
                                name: this.mapService.getName(this._tempAttackingTerritory),
                                color: this.getTerritoryColor(this._tempAttackingTerritory),
                                troops: this.getNumTroops(this._tempAttackingTerritory)
                            },
                            defendingTerritory: {
                                id: id,
                                name: this.mapService.getName(id),
                                color: this.getTerritoryColor(id),
                                troops: this.getNumTroops(id)
                            }
                        };
                    }
                    break;
                case 'FORTIFY':
                    break;
            }
        }
    }

    /**
     * Listen for event from child map header component that sets player's turn.
     */
    setMapModeAndPlayer(data: any) {
        this._mapMode = data.playerStep;
        this._currentPlayer = data.currentPlayer;

        // Set the map to gray out all other territories except the current player's
        // This should happen on any step
        this.disableOtherTerritories(data.currentPlayer);

        if (data.playerStep === 'GETTROOPS') {
            this._troopsAcquired = this.calculatePlayerTroops(data.currentPlayer);
            this.mapDataForPlayersTurn = {
                troopsAcquired: this._troopsAcquired
            };
        }
    }

    /**
     * Listen for event from child map header component for turn form data being
     * passed to the map component.
     */
    setTurnFormData(data: any) {
        if (data.playerStep === 'GETTROOPS') {
            // The only things we're listening for is undoing and resetting the player's troops placements
            switch (data.action) {
                case 'undo':
                    this.togglePlayerTerritories(this._currentPlayer, 'enable');

                    // Grab the latest changeset and revert it (we simply decrease the total troops and troops added)
                    this._placementTerritories.map(t => {
                        console.log(this._placementCounter);
                        if (t.changeset.includes(this._placementCounter)) {
                            // console.log(this._placementCounter);
                            // console.log(t.id + ' ' + t.changeset);
                            t.totalTroops = this.updateTroopsCount(t.id, '-1');
                            t.troopsAdded = t.troopsAdded - 1;
                            t.changeset.splice(-1);   // Remove the last changeset
                        }
                        return t;
                    });

                    // Update the placementCounter (aka the current changeset)
                    this._placementCounter--;

                    // Reset the color of territories that don't have troops added to them
                    this._placementTerritories.forEach(pt => {
                        if (pt.troopsAdded === 0) {
                            this.setTerritoryColor(pt.id, pt.originalColor);
                        }
                    });

                    // Filter out the territories that don't have any troops added
                    this._placementTerritories = this._placementTerritories.filter(t => {
                        return t.troopsAdded !== 0;
                    });

                    this.mapDataForPlayersTurn = {
                        placementTerritories: this._placementTerritories
                    };
                    break;
                case 'reset':
                    this.togglePlayerTerritories(this._currentPlayer, 'enable');

                    // Reset the map elements - troops count and territory color
                    this._placementTerritories.forEach(pt => {
                        this.updateTroopsCount(pt.id, -Math.abs(pt.troopsAdded) + '');
                        this.setTerritoryColor(pt.id, pt.originalColor);
                    });

                    // Reset the variables to keep track of clicked territories
                    this._placementTerritories = [];
                    this._placementCounter = 0;

                    this.mapDataForPlayersTurn = {
                        placementTerritories: this._placementTerritories
                    };
                    break;
                case 'save':
                    // Set the mapMode to ATTACK
                    this._mapMode = 'ATTACK';

                    // Update the game state with the updated troop counts
                    this.saveGameState(this._currentPlayer, this.gameState, this._mapMode);
                    this.mapService.emitGameState(this.gameState);

                    // Loop through the placement territories, add these to
                    // the game log
                    const deploymentRecords = [];

                    this._placementTerritories.forEach(territory => {
                        const record = {} as Record;
                        record.playerDetails = this._currentPlayer;
                        record.turnType = TurnType.Deploy;
                        record.data = {
                            id: territory.id,
                            territoryName: territory.name,
                            troopsAdded: territory.troopsAdded,
                            totalTroops: territory.totalTroops
                        };

                        deploymentRecords.push(record);
                    });

                    // Add the deployment to the game log so we can output
                    // this in the front-end
                    this.mapService.addToGameLog(deploymentRecords);

                    // Update game state and log in the db
                    this.mapService.updateGameMeta(this.gameState, deploymentRecords);

                    // CLEANUP
                    // Reset territory colors
                    this._placementTerritories.forEach(pt => {
                        this.setTerritoryColor(pt.id, pt.originalColor);
                    });

                    // Reset the variables to keep track of clicked territories
                    this._placementTerritories = [];
                    this._placementCounter = 0;

                    // Enable click actions on map again
                    this.togglePlayerTerritories(this._currentPlayer, 'enable');
                    break;
            }
        } else if (data.playerStep === 'ATTACK') {
            switch (data.action) {
                case 'cancel':
                    this._tempAttackingTerritory = '';
                    this._tempDefendingTerritory = '';
                    this.resetHighlightedTerritories();

                    // Re-enable territory selection for player's territories
                    this.togglePlayerTerritories(this._currentPlayer, 'enable');

                    this.mapDataForPlayersTurn = {
                        attackingTerritory: {},
                        defendingTerritory: {}
                    };
                    break;
                case 'skip':
                    this._tempAttackingTerritory = '';
                    this._tempDefendingTerritory = '';
                    this.resetHighlightedTerritories();

                    this._mapMode = 'FORTIFY';

                    // Update the game state with new player status
                    this.saveGameState(this._currentPlayer, this.gameState, this._mapMode);
                    this.mapService.emitGameState(this.gameState);
                    break;
                case 'attack':
                    console.log(data.attackData);
                    // Use the dice service to obtain the results of
                    // the attacker and defender rolling
                    const rollResult = this.diceService.attackRoll(
                        data.attackData.numberOfDice,
                        data.attackData.defendingTerritory.troops);

                    // Send an alert to the user to let them know what the rolls
                    // were. TODO: Send an alert to the defender too
                    let messageString = '<span class="attacker-rolls dice-rolls"><span class="dice-rolls-label">Attacker\'s Rolls: </span>'
                            + rollResult.attackerRolls.join(' ') + '</span>';
                    messageString += '<br><span class="defender-rolls dice-rolls"><span class="dice-rolls-label">Defender\'s Rolls: </span>'
                            + rollResult.defenderRolls.join(' ') + '</span>';
                    messageString += '<br> Attacker lost ' + rollResult.attackerInfo.losses + ' unit(s)';
                    messageString += '<br> Defender lost ' + rollResult.defenderInfo.losses + ' unit(s)';

                    this.alertService.alert(new Alert({
                        message: messageString,
                        iconClass: 'fa-user-nurse',
                        type: rollResult.attackerInfo.victories > rollResult.defenderInfo.victories ? AlertType.Success : AlertType.Error,
                        alertId: 'roll_result',
                        dismiss: false
                    }));

                    // Add the attack to the attacks array
                    this._attacksArray.push({
                        attack: this.getTerritoryDetails(this._tempAttackingTerritory),
                        defend: this.getTerritoryDetails(this._tempDefendingTerritory),
                        rollResult: rollResult
                    });
                    // Send the data to the map header to show user
                    this.mapDataForPlayersTurn = {
                        attackingTerritory: {},
                        defendingTerritory: {},
                        attackResults: this._attacksArray
                    };

                    // Update the map with the number of troops
                    // Attacking territory
                    const newAttackingTerritoryTroops = this.updateTroopsCount(
                        this._tempAttackingTerritory,
                        (rollResult.attackerInfo.losses * -1) + ''
                    );
                    // Defending territory
                    const newDefendingTerritoryTroops = this.updateTroopsCount(
                        this._tempDefendingTerritory,
                        (rollResult.defenderInfo.losses * -1) + ''
                    );

                    // Update game state
                    const updatedTerritories = [
                        { id: this._tempAttackingTerritory, troops: newAttackingTerritoryTroops },
                        { id: this._tempDefendingTerritory, troops: newDefendingTerritoryTroops }
                    ];
                    this.updateGameState(this.gameState, GameStateUpdateType.Territories, updatedTerritories);

                    console.log(this.gameState);

                    // Add the battle to the game log
                    // this.mapService.addToGameLog(this._currentPlayer, TurnType.Attack, )

                    // Clear out the temporary attack and defend territories
                    this._tempAttackingTerritory = '';
                    this._tempDefendingTerritory = '';
                    this.resetHighlightedTerritories();
                    break;
            }
        }
    }

    /**
     * Method to create a new Territory object that will be used when passing
     * back and forth between the map and the map header.
     */
    private getTerritoryDetails(id: string): Territory {
        const td = {} as Territory;
        td.id = id;
        td.name = this.mapService.getName(id);
        td.color = this.getTerritoryColor(id);
        td.troops = this.getNumTroops(id);
        td.owner = this.getTerritoryOwner(id);

        return td;
    }

    /**
     * Method to update the game state without saving it. Useful to keep game state locally until it's ready to be saved
     * in the DB.
     *
     * @param gameState The global game state - separated this to allow function to be testable
     * @param type The type of update to make (cards, territories, status)
     * @param data The data to be updated in the game state (cards, territories or status)
     */
    private updateGameState(gameState: any, type: GameStateUpdateType, data: any): Array<any> {
        switch (type) {
            /**
             * data will be an array with card information
             */
            case GameStateUpdateType.Cards:
                gameState = gameState.map(playerMeta => {
                    if (playerMeta.player._id === this._currentPlayer.player._id) {
                        playerMeta.cards = data;
                    }
                    return playerMeta;
                });
                break;
            /**
             * data will be in this format:
             * [{ id: 'greenland', troops: 4 }, { id: 'kamchatka', troops: 8 }]
             */
            case GameStateUpdateType.Territories:
                gameState = gameState.map(playerMeta => {
                    // Loop through the data and update the playerMeta territories with the updated territories
                    data.forEach(uTerritory => {
                        const tIndex = playerMeta.territoryMeta.findIndex(x => x.id === uTerritory.id);
                        if ( tIndex >= 0) {
                            playerMeta.territoryMeta[tIndex] = uTerritory;
                        }
                    });
                    return playerMeta;
                });
                break;
            /**
             * data will be a string of the player's status
             */
            case GameStateUpdateType.PlayerStatus:
                gameState = gameState.map(playerMeta => {
                    if (playerMeta.player._id === this._currentPlayer.player._id) {
                        playerMeta.status = data;
                    }
                    return playerMeta;
                });
                break;
        }

        return gameState;
    }

    /**
     * Method to save the game state for a specific user (all territories, cards, turn status) and update the user's status.
     * @param curPlayer
     * @param gameState
     * @param newStatus
     */
    private saveGameState(curPlayer: any, gameState: any, newStatus: string): void {
        this.gameState = gameState.map(playerMeta => {
            if (playerMeta.player._id === curPlayer.player._id) {
                playerMeta.status = newStatus;
                playerMeta.territoryMeta = playerMeta.territoryMeta.map(tm => {
                    // If the territory is one of the territories the player has added,
                    // update the troops count in the territoryMeta array
                    if (this._placementTerritories.some(e => e.id === tm.id)) {
                        const tPos = this._placementTerritories.map(pt => pt.id).indexOf(tm.id);
                        tm.troops = this._placementTerritories[tPos].totalTroops;
                    }

                    return tm;
                });
            }
            return playerMeta;
        });

        console.log(this.gameState);
    }

    /**
     * Helper method to get the owner of a territory.
     * @param territoryId ID of the territory.
     */
    private getTerritoryOwner(territoryId: string): UserDetails {
        let owner = {} as UserDetails;

        owner = this.gameState.filter((playerMeta) => {
            return playerMeta.territoryMeta.some(tm => tm.id === territoryId);
        })[0].player;

        return owner;
    }

    /**
     * Helper method to grab the current owner's color of the territory.
     * @param territoryId ID of the territory.
     */
    private getTerritoryColor(territoryId: string): string {
        const territoryOwner = this.getTerritoryOwner(territoryId);

        return this._playerColorMap[territoryOwner._id];
    }

    /**
     * Helper method to set a territory's color.
     * @param territoryId ID of the territory.
     * @param color Color to set the territory to.
     */
    private setTerritoryColor(territoryId: string, color: string): void {
        // Map update variables
        const newData = {
            areas: {}
        };

        newData.areas[territoryId] = {
            attrs: {
                fill: color
            },
            attrsHover: {
                fill: this.utils.lightDarkenColor(color, -20)
            }
        };

        this.$mapArea.trigger('update', [{
            mapOptions: newData,
            animDuration: 200
        }]);
    }

    /**
     * Helper method to enable/disable a player's territories.
     * Used when the player shouldn't perform
     */
    private togglePlayerTerritories(curPlayer: any, toggleState: string): void {
        const newData = {
            areas: {}
        };

        // Grab the player's territories
        const playerTerritories = this.gameState.filter(playerMeta => {
            return playerMeta.player._id === curPlayer.player._id;
        }).map(pm => pm.territoryMeta)[0];

        // console.log(curPlayer);

        if (toggleState === 'enable') {
            playerTerritories.forEach(territory => {
                newData.areas[territory.id] = {
                    eventHandlers: {
                        click: (e, id, mapElem) => {
                            this.mapClickActions(e, id, mapElem);
                        }
                    },
                    attrs: {
                        cursor: 'pointer'
                    }
                };
            });
        } else if (toggleState === 'disable') {
            let attrsObj = {}, attrsHoverObj = {};
            playerTerritories.forEach(territory => {
                if (this._placementTerritories.some(t => t.id === territory.id)) {
                    attrsObj = {
                        fill: '#44b57d',
                        cursor: 'auto'
                    };
                    attrsHoverObj = {
                        fill: '#44b57d'
                    };
                } else {
                    attrsObj = {
                        fill: curPlayer.color,
                        cursor: 'auto'
                    };
                    attrsHoverObj = {
                        fill: curPlayer.color
                    };
                }
                // this.setTerritoryColor(territory.id, fillColor);
                newData.areas[territory.id] = {
                    eventHandlers: {
                        click: (e, id, mapElem) => {
                            return;
                        }
                    },
                    attrs: attrsObj,
                    attrsHover: attrsHoverObj
                };
            });
        }

        this.$mapArea.trigger('update', [{
            mapOptions: newData
        }]);
    }

    /**
     * Helper method to disable all other territories except the current player's.
     * Used mainly to highlight the player's territories when distributing troops
     * or when fortifying.
     * @param curPlayer The player whose turn it is currently.
     */
    private disableOtherTerritories(curPlayer: any): void {
        // Map update variables
        const newData = {
            areas: {}
        };

        // Grab the territories of the other players
        const otherTerritoriesTemp = this.gameState.filter(playerMeta => {
            return playerMeta.player._id !== curPlayer.player._id;
        }).map(pm => {
            return pm.territoryMeta;
        });
        let otherTerritories = [];

        otherTerritoriesTemp.forEach(elem => {
            otherTerritories = otherTerritories.concat(elem);
        });

        // console.log(otherTerritories);

        otherTerritories.forEach(territory => {
            newData.areas[territory.id] = {
                eventHandlers: {
                    click: (e, id, mapElem) => {
                        return;
                    }
                },
                attrs: {
                    // fill: '#5f5f5f',
                    'fill-opacity': 0.2,
                    cursor: 'auto',
                    stroke: '#FFFFFF',
                    'stroke-width': 1
                }
            };
        });

        // console.log(newData);

        this.$mapArea.trigger('update', [{
            mapOptions: newData
        }]);
    }

    /**
     * Helper method to highlight nearby territories to attack when it's a player's turn to attack.
     * @param curPlayer Player whose turn it currently is.
     * @param territoryId The territory ID as a string.
     */
    private highlightNearbyTerritories(curPlayer: any, territoryId: string): void {
        // Get the territoryMeta objects of the other players in the game so we can highlight those
        let otherTerritories = [];
        const updatedOptions = {
            areas: {}
        };

        const otherTerritoriesTemp = this.gameState
            .filter(playerMeta => playerMeta.player._id !== curPlayer.player._id)
            .map(pm => pm.territoryMeta);

        otherTerritoriesTemp.forEach(elem => {
            otherTerritories = otherTerritories.concat(elem);
        });

        otherTerritories = otherTerritories.map(ot => ot.id);

        // Use the MapService to grab the nearbyTerritories from map configuration
        // We get back an array of territory IDs
        const nearbyTerritories = this.mapService.getNearbyTerritories(territoryId);

        // Loop over the nearbyTerritories, check it against the otherTerritories id property
        nearbyTerritories.forEach(tId => {
            if (otherTerritories.includes(tId)) {
                this.tempNearbyTerritories.push(tId);
                updatedOptions.areas[tId] = {
                    eventHandlers: {
                        click: (e, id, mapElem) => {
                            this.mapClickActions(e, id, mapElem);
                        }
                    },
                    attrs: {
                        'fill-opacity': 1,
                        cursor: 'pointer'
                    }
                };
            }
        });

        this.$mapArea.trigger('update', [{
            mapOptions: updatedOptions,
            animDuration: 300
        }]);
    }

    private resetHighlightedTerritories(): void {
        if (this.tempNearbyTerritories.length > 0) {
            const updatedOptions = {
                areas: {}
            };
            this.tempNearbyTerritories.forEach((territoryId) => {
                // Get the continent of the territory and get the default color to reset to
                updatedOptions.areas[territoryId] = {
                    eventHandlers: {
                        click: (e, id, mapElem) => {
                            return;
                        }
                    },
                    attrs: {
                        'fill-opacity': 0.2,
                        cursor: 'auto'
                    }
                };
            });

            this.$mapArea.trigger('update', [{
                mapOptions: updatedOptions
            }]);

            this.tempNearbyTerritories = [];
        }
    }

    private calculatePlayerTroops(curPlayer: any) {
        return Math.floor(curPlayer.territoryMeta.length / 3);
    }

    private generateTooltip(territoryName: string, occupant: string) {
        return '<span class="territory-name">' + territoryName + '</span><span class="occupant">' + occupant + '</span>';
    }

    // Helper method to get the number of troops
    // We're doing it here instead of the map service since the map data is going to change a lot
    // until it is saved in the DB through the map service
    private getNumTroops(territoryId: string): string {
        // First filter the game state for the current turn player, and then filter the territory meta for the territory ID
        // and grab the troops from the object
        let numTroops = '';

        // Check to see if the territory exists in the placementTerritories array
        if (this._placementTerritories.some(e => e.id === territoryId)) {
            // Grab the troops number from here
            numTroops = this._placementTerritories.filter(t => t.id === territoryId)[0].totalTroops;
        } else {
            // We have to look at the game state and grab the number from here
            numTroops = this.gameState.filter(playerMeta => {
                return playerMeta.territoryMeta.some(tm => tm.id === territoryId);
            })[0].territoryMeta.filter(territory => {
                return territory.id === territoryId;
            })[0].troops;
        }
        return numTroops;
    }

    /**
     * Helper method to update the troops count on the map and return back the updated number.
     */
    private updateTroopsCount(territoryId: string, numTroops: string): number {
        const curNumTroops = this.getNumTroops(territoryId);
        const updatedNumTroops = parseInt(curNumTroops, 10) + parseInt(numTroops, 10);

        // console.log(updatedNumTroops);

        // Map update variables
        const plotId = territoryId + '_plot';
        const newData = {
            plots: {}
        };

        newData.plots[plotId] = {
            value: updatedNumTroops,
            plotsOn: territoryId,
            text: {
                content: updatedNumTroops + ''
            }
        };

        this.$mapArea.trigger('update', [{
            mapOptions: newData
        }]);

        return updatedNumTroops;
    }

    /**
     * Helper method to reset the get troops variables.
     */
    private resetTroopsPlacementVars() {
        this._troopsAcquired = 0;
        this._placementTerritories = [];
        this._placementCounter = 0;
    }

    ngOnDestroy() {

    }

}
