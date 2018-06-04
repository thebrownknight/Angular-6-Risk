import { Component, Input } from '@angular/core';

@Component({
  selector: 'risk-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {
    @Input('title') title: String;
    @Input('iconClass') iconClass: String;
    @Input() active = false;

    constructor() { }
}
