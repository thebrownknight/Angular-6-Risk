import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePanelComponent } from './slidepanel.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SlidePanelComponent
    ],
    exports: [
        SlidePanelComponent
    ]
})
export class RiskSlidePanelModule { }
