import { Component, OnInit, Input } from '@angular/core';
import { Output, TemplateRef, EventEmitter } from '@angular/core';

@Component({
    selector: 'risk-accordion-panel',
    templateUrl: './panel.component.html',
    styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit {
    @Input() opened = false;
    // @Input() panelHeading: TemplateRef<any>;
    @Output() toggle: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    ngOnInit() {

    }
}
