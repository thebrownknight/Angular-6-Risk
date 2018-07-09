import { Directive, TemplateRef } from '@angular/core';

@Directive({
    selector: '[riskCarouselItem]'
})
export class RiskCarouselItemDirective {
    constructor(public tpl: TemplateRef<any>) { }
}
