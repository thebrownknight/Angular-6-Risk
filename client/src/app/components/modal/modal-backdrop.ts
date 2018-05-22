import { Component, Input, HostBinding, HostListener } from '@angular/core';

@Component({
    selector: 'risk-modal-backdrop',
    template: ''
})

export class ModalBackdropComponent {
    @Input() backdropClass: string;

    @HostBinding('class') classes = 'modal-backdrop ' + (this.backdropClass ? ' ' + this.backdropClass : '');
}
