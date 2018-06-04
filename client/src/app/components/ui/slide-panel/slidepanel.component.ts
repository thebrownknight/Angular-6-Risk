import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'risk-slide-panel',
    templateUrl: './slidepanel.component.html',
    styleUrls: ['./slidepanel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('slide', [
            state('left', style({ transform: 'translateX(0)' })),
            state('right', style({ transform: 'translateX(-50%) '})),
            transition('* => *', animate(300))
        ])
    ]
})
export class SlidePanelComponent {
    @Input() activePane: PaneType = 'left';
}

type PaneType = 'left' | 'right';
