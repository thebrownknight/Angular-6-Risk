import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlertComponent } from './alert.component';
import { AlertContentComponent } from './alert-content.component';
import { AlertService } from '../../../services/alert.service';

@NgModule({
    imports: [
        CommonModule
    ],
    entryComponents: [
        AlertContentComponent
    ],
    declarations: [
        AlertComponent,
        AlertContentComponent
    ],
    exports: [
        AlertComponent
    ],
    providers: [
        AlertService
    ]
})
export class RiskAlertModule { }
