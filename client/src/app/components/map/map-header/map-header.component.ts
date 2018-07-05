import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'risk-map-header',
    templateUrl: './map-header.component.html'
})
export class MapHeaderComponent implements OnInit {
    @Input() players: Array<any>;

    constructor() { }

    ngOnInit() {
        // console.log(this.players);
    }
}
