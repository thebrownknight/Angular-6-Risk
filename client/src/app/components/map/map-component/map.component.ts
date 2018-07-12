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

    $mapArea: any;  // Reference to the jQuery Mapael object
    gamePlayers: Array<any> = [];   // Array of the players in the game
    gameState: any;

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
                // console.log(game);
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

                    if (assignNewTerritories) {
                        // We do the random distribution of territories to the players
                        this.gameState = this.mapService.assignTerritories(this.gamePlayers);
                    }

                    // Now we grab the territoryMeta from each player and fill the colors of the territories with the players' colors
                    const playerColorMap = {}, playerUsernameMap = {};
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

                    this.gameState.forEach(playerMeta => {
                        // console.log(playerMeta);
                        playerMeta.territoryMeta.forEach(territory => {
                            const territoryName = this.mapService.getName(territory.id);
                            newData.areas[territory.id] = {
                                value: playerUsernameMap[playerMeta.player],
                                attrs: {
                                    fill: playerColorMap[playerMeta.player],
                                    stroke: '#FFFFFF',
                                    'stroke-width': 1
                                },
                                attrsHover: {
                                    fill: playerColorMap[playerMeta.player]
                                },
                                tooltip: {
                                    content: `<p class="territory-name">${territoryName}</p>
                                        <p class="occupant">Current Occupant : ${playerUsernameMap[playerMeta.player]}</p>`
                                }
                            };
                        });
                    });

                    console.log(newData);

                    this.$mapArea.trigger('update', [{
                        mapOptions: newData
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

    ngOnDestroy() {

    }

}
