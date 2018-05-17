import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthenticationService, UserDetails } from '../../services/authentication.service';

// jQuery declaration
declare var $: any;

@Component({
  selector: 'app-risk-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
    userDetails: UserDetails = {
        _id: '',
        email: '',
        username: '',
        exp: -1,
        iat: -1
    };

    constructor(private auth: AuthenticationService) { }

    ngOnInit() {
        this.userDetails = this.auth.getUserDetails();
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
