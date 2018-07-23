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

    $mapArea: any;  // Reference to the jQuery Mapael object
    gamePlayers: Array<any> = [];   // Array of the players in the game
    gameState: any;

    mapDataForPlayersTurn: any = { };    // The information gathered from interacting with the map on a player's turn

    // Turn specific variables
    private _troopsAcquired = 0;

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
                            if (this._mapMode) {
                                // We perform different click actions on the map based on what step the player is on
                                // whose turn it is
                                switch (this._mapMode) {
                                    // Clicks grab the name of the territory clicked and update the troops count based on the
                                    // number of troops selected in the dropdown
                                    case 'GETTROOPS':
                                        // const updatedArea = {
                                        //     areas: {}
                                        // };
                                        // updatedArea.areas[id] = {
                                        //     attrs: {
                                        //         stroke: '#5F5F5F',
                                        //         'stroke-width': 3
                                        //     }
                                        // };

                                        // this.$mapArea.trigger('update', [{
                                        //     mapOptions: updatedArea
                                        // }]);
                                        this.mapDataForPlayersTurn = {
                                            troopsAcquired: this._troopsAcquired,
                                            troopsPlacementTerritory: {
                                                id: id,
                                                name: this.mapService.getName(id)
                                            }
                                        };
                                        break;
                                    case 'ATTACK':
                                        break;
                                    case 'FORTIFY':
                                        break;
                                }
                            }
                            const newData = {
                                areas: {}
                            };

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
                        },
                        dblclick: (e, id, mapElem, textElem) => {
                            console.log(id);
                            this.$mapArea.trigger('zoom', {
                                area: id,
                                areaMargin: 10
                            });
                        }
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
                    const playerColorMap = {}, playerUsernameMap = {};

                    // Loop through the players, grab the player colors and player usernames and store them in objects
                    // Update legend information here
                    this.gamePlayers.forEach(player => {
                        playerColorMap[player.player._id] = player.color;
                        playerUsernameMap[player.player._id] = player.player.username;

                        const isLoggedIn = this.loggedInUser._id === player.player._id;

                        // Set the legend here too so we can save looping again
                        newData.legend.area.slices.push({
                            attrs: {
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
                            const playerUsername = playerUsernameMap[playerId];

                            newData.areas[territory.id] = {
                                value: playerUsernameMap[playerId],
                                attrs: {
                                    fill: playerColorMap[playerId],
                                    cursor: 'pointer',
                                    stroke: '#FFFFFF',
                                    'stroke-width': 1
                                },
                                attrsHover: {
                                    fill: this.utils.lightDarkenColor(playerColorMap[playerId], -20)
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

                    console.log(newData);

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
            this.updateTroopsCount(data.troopsPlacementTerritory, data.numberOfTroops);
        }
    }

    private disableOtherTerritories(curPlayer: any) {
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

        console.log(otherTerritories);

        otherTerritories.forEach(territory => {
            newData.areas[territory.id] = {
                eventHandlers: {
                    click: (e, id, mapElem) => {
                        return;
                    }
                },
                attrs: {
                    fill: '#5F5F5F',
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
        return this.gameState.filter(playerMeta => {
            return playerMeta.player._id === this._currentPlayer.player._id;
        })[0].territoryMeta.filter(territory => {
            return territory.id === territoryId;
        })[0].troops;
    }

    private updateTroopsCount(territoryId: string, numTroops: string) {
        const curNumTroops = this.getNumTroops(territoryId);
        const updatedNumTroops = parseInt(curNumTroops, 10) + parseInt(numTroops, 10);

        console.log(updatedNumTroops);

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
    }

    ngOnDestroy() {

    }

}