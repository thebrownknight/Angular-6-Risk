import { Directive, Component, Input, AfterViewInit } from '@angular/core';
import { ContentChildren, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';

import { animate, AnimationBuilder, AnimationFactory, AnimationPlayer, style } from '@angular/animations';

import { RiskCarouselItemDirective } from './carousel-item.directive';

// We use this for calculating width dynamically
@Directive({
    selector: '[riskCItem]'
})
export class CItemElementDirective { }

@Component({
    selector: 'risk-carousel',
    templateUrl: './carousel.component.html'
})
export class RiskCarouselComponent implements AfterViewInit {
    @ContentChildren(RiskCarouselItemDirective) items: QueryList<RiskCarouselItemDirective>;
    @ViewChildren(CItemElementDirective, { read: ElementRef }) private itemsElements: QueryList<ElementRef>;
    @ViewChild('carousel') private carousel: ElementRef;

    @Input() timing = '250ms ease-in';
    @Input() showControls = true;

    private player: AnimationPlayer;
    private itemWidth: number;
    private currentSlide = 0;
    carouselWrapperStyle = {};

    constructor(private builder: AnimationBuilder) { }

    ngAfterViewInit() {
        setTimeout(() => {
            this.itemWidth = this.itemsElements.first.nativeElement.getBoundingClientRect().width;
            this.carouselWrapperStyle = {
                width: `${this.itemWidth}px`
            };
        });
    }

    prev() {
        if (this.currentSlide === 0) { return; }

        this.currentSlide = ((this.currentSlide - 1) + this.items.length) % this.items.length;
        const offset = this.currentSlide * this.itemWidth;

        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
    }

    next() {
        if (this.currentSlide + 1 === this.items.length) { return; }

        this.currentSlide = (this.currentSlide + 1) % this.items.length;
        const offset = this.currentSlide * this.itemWidth;

        const myAnimation: AnimationFactory = this.buildAnimation(offset);
        this.player = myAnimation.create(this.carousel.nativeElement);
        this.player.play();
    }

    private buildAnimation(offset) {
        return this.builder.build([
            animate(this.timing, style({
                transform: `translateX(-${offset}px)`
            }))
        ]);
    }
}
