import { Component, OnInit, AfterViewInit } from '@angular/core';

// jQuery declaration
declare var $: any;

@Component({
  selector: 'app-risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    const $mapArea = $('.risk-board');
    $mapArea.mapael({
      map: {
        name: 'risk_board',
        zoom: {
          enabled: true,
          maxLevel: 15
        },
        defaultArea: {
          eventHandlers: {
            click: function (e, id) {
              $mapArea.trigger('zoom', {
                area: id,
                areaMargin: 10
              });
            }
          }
        }
      }
    });
  }

  clearZoom() {
    const $mapArea = $('.risk-board');
    $mapArea.trigger('zoom', { level: 0 });
  }

}
