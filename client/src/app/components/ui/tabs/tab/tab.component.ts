import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'risk-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent {
    @Input() heading: TemplateRef<any>;
    @Input() active = false;

    constructor() { }
}
