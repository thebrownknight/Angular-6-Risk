import { Component, Input, ChangeDetectionStrategy, AfterContentInit } from '@angular/core';
import { ContentChild, TemplateRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';

import { SlidePanelService } from './slidepanel.service';

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
    private _subscription: Subscription;
    activePane: PaneType = 'left';

    @ContentChild('leftPane') leftPane: TemplateRef<any>;
    @ContentChild('rightPane') rightPane: TemplateRef<any>;

    ctx = {
        activePane: this.activePane,
        setPanelState: function(spState: PaneType) {
            console.log(spState);
            this.activePane = spState;
            console.log(this);
        }
    };

    constructor(private spService: SlidePanelService) {

    }

    ngAfterContentInit() {
        // this._subscription = spService.state$.subscribe((spState) => {
        //     this.activePane = spState as PaneType;
        // });
        console.log(this.leftPane);
    }
}

type PaneType = 'left' | 'right';
