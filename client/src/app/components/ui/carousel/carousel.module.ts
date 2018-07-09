import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiskCarouselItemDirective } from './carousel-item.directive';
import { RiskCarouselComponent } from './carousel.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        RiskCarouselItemDirective,
        RiskCarouselComponent
    ],
    exports: [
        RiskCarouselItemDirective,
        RiskCarouselComponent
    ]
})

export class RiskCarouselModule { }
