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
    $('.risk-board').mapael({
      map: {
        name: 'risk_board'
      }
    });
  }

}
