import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RiskCarouselItemDirective } from './carousel-item.directive';
import { CItemElementDirective, RiskCarouselComponent } from './carousel.component';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        RiskCarouselItemDirective,
        CItemElementDirective,
        RiskCarouselComponent
    ],
    exports: [
        RiskCarouselItemDirective,
        RiskCarouselComponent
    ]
})

export class RiskCarouselModule { }
