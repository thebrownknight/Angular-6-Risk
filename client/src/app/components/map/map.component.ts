import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { standardMap } from '../../../assets/scripts/maps/standard';

// jQuery declaration
declare var $: any;

@Component({
  selector: 'risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
    private sub: any;
    private mapW = 708.11981;
    private mapH = 465.85077;

    private tempNearbyTerritories: Array<string> = [];
    $mapArea: any;

    constructor(private route: ActivatedRoute) {

    }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            console.log(params['code']);
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
                                animDuration: 500
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
                    // $('.risk-board .map').off('resizeEnd');
                    // const winH = $(window).height();

                    // $(window).on('resize', () => {
                    //     paper.ellipse(100, 200, 100, 60).attr({stroke: '#0067bf', fill: '#63a2d7', opacity: 0.4});

                    //     console.log((this.mapW * winH) / this.mapH);

                    //     // paper.setSize((this.mapW * winH) / this.mapH, (winH - 117));
                    //     paper.setSize(800, 600);
                    // }).trigger('resize');

                    // $(window).on('resize', () => {
                    //     const winW = $(window).width(),
                    //         winRatio = winW / winH,
                    //         mapRatio = this.mapW / this.mapH;

                    //     // If the window ratio is larger than the map ratio
                    //     // then the height of the map needs to match the window
                    //     if (winRatio > mapRatio) {
                    //         // Set the height of the canvas to be window height minus the header height
                    //         paper.setSize((this.mapW * winH) / this.mapH, (winH - 117));
                    //     } else {
                    //         paper.setSize(winW, (this.mapH * winW) / this.mapW);
                    //     }

                    //     // Set the viewbox here so the map positions correctly
                    //     // paper.setViewBox(0, 0, this.mapW, this.mapH, true);
                    // }).trigger('resize');

                    // console.log(paper);
                     // You are free to call all Raphael.js functions on paper object
                    //  paper.ellipse(100, 200, 100, 60).attr({stroke:"#0067bf", fill:"#63a2d7",opacity:0.4});
                    //  paper.ellipse(300, 150, 80, 100).attr({stroke:"#4aa23c", fill:"#74d763",opacity:0.4});
                    // paper.setSize((this.mapW * winH) / this.mapH, (winH - 117));
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
        this.sub.unsubscribe();
    }

}
