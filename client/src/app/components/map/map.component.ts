import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

// jQuery declaration
declare var $: any;

@Component({
  selector: 'risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

    constructor(private auth: AuthenticationService) { }

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

    logout() {
        this.auth.logout();
    }

}
