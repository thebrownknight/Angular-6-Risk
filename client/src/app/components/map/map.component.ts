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

                            // TODO: Reset the color of the continent before we highlight the nearby areas

                            this.getNearbyTerritories(id).forEach((territory) => {
                                newData.areas[territory] = {
                                    attrs: {
                                        fill: '#FF0000'
                                    }
                                };
                            });

                            // We set the fill of the nearby territories to red
                            this.$mapArea.trigger('update', [{
                                mapOptions: newData,
                                animDuration: 2000
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

    // Private helper method to get the nearby territories of the territory
    // passed in as a parameter
    private getNearbyTerritories(territory: string): Array<string> {
        let nearbyTerritories = Array<string>();

        standardMap.regions.forEach((region) => {
            if (region.territories[territory]) {
                nearbyTerritories = region.territories[territory].nearbyTerritories;
            }
        });

        return nearbyTerritories;
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
