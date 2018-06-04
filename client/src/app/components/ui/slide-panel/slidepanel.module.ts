import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlidePanelComponent } from './slidepanel.component';
import { SlidePanelService } from './slidepanel.service';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SlidePanelComponent
    ],
    exports: [
        SlidePanelComponent
    ],
    providers: [
        SlidePanelService
    ]
})
export class RiskSlidePanelModule { }
