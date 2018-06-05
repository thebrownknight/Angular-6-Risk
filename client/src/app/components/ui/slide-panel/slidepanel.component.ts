import { Component, Input, ChangeDetectionStrategy, AfterContentInit } from '@angular/core';
import { ContentChild, TemplateRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

type PaneType = 'left' | 'right';

@Component({
    selector: 'risk-slide-panel',
    templateUrl: './slidepanel.component.html',
    styleUrls: ['./slidepanel.component.scss'],
    animations: [
        trigger('slide', [
            state('left', style({
                transform: 'translateX(0)'
            })),
            state('right', style({
                transform: 'translateX(-50%)'
            })),
            transition('* => *', animate(300))
        ])
    ]
})
export class SlidePanelComponent implements AfterContentInit {
    activePane: PaneType = 'left';

    @ContentChild('leftPane') leftPane: TemplateRef<any>;
    @ContentChild('rightPane') rightPane: TemplateRef<any>;

    constructor() { }

    // Public method that children can call to set the active pane
    setPanelState(spState: PaneType) {
        this.activePane = spState;
    }

    ngAfterContentInit() { }
}
