import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

    constructor(
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            console.log(params['code']);
        });
    }

    ngAfterViewInit() {
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
                        click: (e, id) => {
                            this.$mapArea.trigger('zoom', {
                                area: id,
                                areaMargin: 10
                            });
                        }
                    }
                },
                afterInit: ($self, paper, areas, plots, options) => {
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

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
