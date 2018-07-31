import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { AuthenticationService } from '../../../services/authentication.service';
import { MapService } from '../map.service';

import { Utils } from '../../../services/utils';
import { UserDetails } from '../../../helpers/data-models';

// jQuery declaration
declare var $: any;

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

    // Turn specific variables
    private _troopsAcquired = 0;
    private _placementTerritories: Array<any> = [];
    private _placementCounter = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthenticationService,
        private mapService: MapService,
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
                console.log(game);
                // Send the map name and game ID to the service to set the common game information to reference in the service
                this.mapService.setGameConfiguration({
                    map: game.map,
                    gameID: game._id
                });

                // Assign turn order for the players
                // Only do this if the turnOrder is not set yet
                if (game.players[0].turnOrder === -1) {
                    this.gamePlayers = this.mapService.assignTurnOrder(game.players);
                } else {
                    this.gamePlayers = this.utils.sortPlayers(game.players, 'asc');
                }

                // Set the player usernames and colors in easily referenced maps
                this.gamePlayers.forEach(player => {
                    this._playerColorMap[player.player._id] = player.color;
                    this._playerUsernameMap[player.player._id] = player.player.username;
                });

                if (game.gameMeta) {
                    this.gameState = game.gameMeta.state;
                    this.mapService.emitGameState(this.gameState);
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
                            console.log(id);
                            this.$mapArea.trigger('zoom', {
                                area: id,
                                areaMargin: 10
                            });
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
                    const tHighlightColor =
                        '#44b57d';

                    updatedOptions.areas[id] = {
                        attrs: {
                            fill: tHighlightColor
                        },
                        attrsHover: {
                            fill: tHighlightColor
                        }
                    };

                    this.$mapArea.trigger('update', [{
                        mapOptions: updatedOptions
                    }]);

                    // console.log(mapElem);
                    // mapElem.attr({
                    //     fill: tHighlightColor
                    // });

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
                                console.log(t.changeset);
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
                    break;
                case 'FORTIFY':
                    break;
            }
        }
        // const newData = {
        //     areas: {}
        // };

        /* Reset the color of the continent before we highlight the nearby areas */
        // First get the continent that the territory resides in
        // const continentId = this.mapService.getContinent(id);
        // const continentDefaultColor = this.mapService.getDefaultColorByContinent(continentId);

        // Second we check if there are already selected nearbyTerritories and if so,
        // we just reset them instead of the whole map
        // if (this.tempNearbyTerritories.length > 0) {
        //     this.tempNearbyTerritories.forEach((territoryId) => {
        //         // Get the continent of the territory and get the default color to reset to
        //         newData.areas[territoryId] = {
        //             attrs: {
        //                 fill: continentDefaultColor
        //             }
        //         };
        //     });
        // }

        // Set a reference to the nearby territories so we can reset them on click of a different
        // territory
        // this.tempNearbyTerritories = this.mapService.getNearbyTerritories(id);
        // this.tempNearbyTerritories.forEach((territoryId) => {
        //     newData.areas[territoryId] = {
        //         attrs: {
        //             fill: '#FF0000'
        //         }
        //     };
        // });

        // Finally we set the colors of all the territories to the correct ones based on the logic above
        // this.$mapArea.trigger('update', [{
        //     mapOptions: newData,
        //     animDuration: 200
        // }]);
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
     * Listen for event from child map header component for turn form data being passed
     * to the map component.
     */
    setTurnFormData(data: any) {
        if (data.playerStep === 'GETTROOPS') {
            // The only things we're listening for is undoing and resetting the player's troops placements
            if (data.action === 'undo') {
                this.togglePlayerTerritories(this._currentPlayer, 'enable');

                // Grab the latest changeset and revert it (we simply decrease the total troops and troops added)
                this._placementTerritories.map(t => {
                    if (t.changeset.includes(this._placementCounter)) {
                        t.totalTroops = this.updateTroopsCount(t.id, '-1');
                        t.troopsAdded = t.troopsAdded - 1;
                        t.changeset.splice(-1);   // Remove the last changeset

                        this._placementCounter--;   // Not sure if needed
                    }
                    return t;
                });

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
            }
        }
    }

    /**
     * Helper method to grab the current owner's color of the territory.
     * @param territoryId ID of the territory.
     */
    private getTerritoryColor(territoryId: string): string {
        // const tColor = '';

        // // First filter the game state for the current turn player, and then filter the territory meta for the territory ID
        // // and grab the troops from the object
        // return this.gameState.filter(playerMeta => {
        //     return playerMeta.player._id === this._currentPlayer.player._id;
        // })[0].territoryMeta.filter(territory => {
        //     return territory.id === territoryId;
        // })[0].troops;

        // return tColor;

        return '';
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

        console.log(newData);

        this.$mapArea.trigger('update', [{
            mapOptions: newData,
            animDuration: 200
        }]);

        // console.log(this.$mapArea);
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
                    console.log(territory.id);
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

        // console.log(newData);

        this.$mapArea.trigger('update', [{
            mapOptions: newData
        }]);

        // console.log(this.$mapArea);
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
                    cursor: 'none',
                    stroke: '#FFFFFF',
                    'stroke-width': 1
                }
            };
        });

        console.log(newData);

        this.$mapArea.trigger('update', [{
            mapOptions: newData
        }]);
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
                return playerMeta.player._id === this._currentPlayer.player._id;
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
