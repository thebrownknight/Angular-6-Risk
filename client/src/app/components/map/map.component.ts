import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { standardMap } from '../../../assets/scripts/maps/standard';

import { MapService } from '../../services/map.service';

// jQuery declaration
declare var $: any;

@Component({
  selector: 'risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
    private activeGame$: any;
    private mapW = 708.11981;
    private mapH = 465.85077;

    private tempNearbyTerritories: Array<string> = [];
    $mapArea: any;  // Reference to the jQuery Mapael object
    gamePlayers: Array<any> = [];   // Array of the players in the game
    gameMeta: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private mapService: MapService
    ) { }

    ngOnInit() {
        // this.activeGame$ = this.route.params.subscribe(params => {
        //     // Verify that the code is an existing code in the db
        //     this.mapService.verifyGameCode(params['code']).subscribe((game) => {
        //         if (game) {

        //         } else {
        //             // Incorrect code, navigate back to the dashboard
        //             // This will also take care of redirecting back to the
        //             // login page if the user is not authorized
        //             this.router.navigate(['/dashboard']);
        //         }
        //     });
        // });
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                return this.mapService.verifyGameCode(params.get('code'));
            })
        ).subscribe((game) => {
            if (game) {
                console.log(game);
                this.gamePlayers = game.players;
            } else {
                // Incorrect code, navigate back to the dashboard
                // This will also take care of redirecting back to the
                // login page if the user is not authorized
                this.router.navigate(['/dashboard']);
            }
        });
    }

    ngAfterViewInit() {
        const mapAreas = {};
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
                            const continentId = this.getContinent(id);
                            const continentDefaultColor = this.getDefaultColorByContinent(continentId);

                            // Second we check if there are already selected nearbyTerritories and if so,
                            // we just reset them instead of the whole map
                            if (this.tempNearbyTerritories.length > 0) {
                                this.tempNearbyTerritories.forEach((territoryId) => {
                                    // Get the continent of the territory and get the default color to reset to
                                    newData.areas[territoryId] = {
                                        attrs: {
                                            fill: continentDefaultColor
                                        }
                                    };
                                });
                            }

                            // Set a reference to the nearby territories so we can reset them on click of a different
                            // territory
                            this.tempNearbyTerritories = this.getNearbyTerritories(id);
                            this.tempNearbyTerritories.forEach((territoryId) => {
                                newData.areas[territoryId] = {
                                    attrs: {
                                        fill: '#FF0000'
                                    }
                                };
                            });

                            // Finally we set the colors of all the territories to the correct ones based on the logic above
                            this.$mapArea.trigger('update', [{
                                mapOptions: newData,
                                animDuration: 200
                            }]);
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
                    const newData = {
                        'areas': {}
                    };

                    standardMap.regions.forEach((region) => {
                        Object.keys(region.territories).forEach((territory) => {
                            newData.areas[territory] = {
                                'attrs': {
                                    fill: region.defaultColor
                                }
                            };
                        });
                    });

                    this.$mapArea.trigger('update', [{
                        mapOptions: newData
                    }]);
                }
            }
        });
    }

    clearZoom() {
        this.$mapArea.trigger('zoom', { level: 0 });
    }

    /**
     * PRIVATE HELPER METHODS
     */
    // Method to get the continent of a territory
    private getContinent(territoryId: string): string {
        let continentId = '';
        standardMap.regions.forEach((region) => {
            if (region.territories[territoryId]) {
                continentId = region.id;
            }
        });
        return continentId;
    }

    // Method to get territories of continent as an array of IDs
    private getTerritories(continentId: string): Array<any> {
        return Object.keys(standardMap.regions.filter((region) => {
            return region.id === continentId;
        })[0].territories);
    }

    // Method to get the default color of a continent
    private getDefaultColorByContinent(continentId: string): string {
        return standardMap.regions.filter((region) => {
            return region.id === continentId;
        })[0].defaultColor;
    }

    // Method to get the default color of a territory
    private getDefaultColorByTerritory(territoryId: string): string {
        return standardMap.regions.filter((region) => {
            return region.id === this.getContinent(territoryId);
        })[0].defaultColor;
    }

    // Private helper method to get the nearby territories of the territory
    // passed in as a parameter
    private getNearbyTerritories(territoryId: string): Array<string> {
        let nearbyTerritories = Array<string>();

        standardMap.regions.forEach((region) => {
            if (region.territories[territoryId]) {
                nearbyTerritories = region.territories[territoryId].nearbyTerritories;
            }
        });

        return nearbyTerritories;
    }

    ngOnDestroy() {

    }

}
