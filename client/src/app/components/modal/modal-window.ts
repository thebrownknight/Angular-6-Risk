import { DOCUMENT } from '@angular/common';
import { Component, Output, EventEmitter, Input, Inject, ElementRef, HostBinding, HostListener } from '@angular/core';
import { Renderer2, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

import { ModalDismissReasons } from './modal-dismiss-reasons';

@Component({
    selector: 'risk-modal-window',
    template: `
    <div [class]="'modal-dialog' + (size ? ' modal-' + size : '') + (centered ? ' modal-dialog-centered' : '')" role="document">
        <div class="modal-content">
            <ng-content></ng-content>
        </div>
    </div>
    `
})

export class ModalWindowComponent implements OnInit, AfterViewInit, OnDestroy {
    private _document: any;
    private _elWithFocus: Element;

    @Input() backdrop: boolean | string = true;
    @Input() centered: string;
    @Input() keyboard: true;
    @Input() size: string;
    @Input() windowClass: string;

    @Output() dismissEvent = new EventEmitter();

    @HostBinding('class') classes = 'modal ' + (this.windowClass ? ' ' + this.windowClass : '');
    @HostBinding('attr.role') role = 'dialog';
    @HostBinding() tabindex = '-1';

    @HostListener('click', ['$event.target'])
    onclick(target) {
        this.backdropClick(target);
    }
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            this.escKey(event);
        } else if (event.keyCode === 27) {
            this.escKey(event);
        }
    }

    constructor(@Inject(DOCUMENT) document, private _elRef: ElementRef, private _renderer: Renderer2) {
        this._document = document;
    }

    backdropClick(target): void {
        console.log(target);
        console.log(this._elRef.nativeElement);
        if (this.backdrop === true && this._elRef.nativeElement === target) {
            this.dismiss(ModalDismissReasons.BACKDROP_CLICK);
        }
    }

    escKey(event): void {
        if (this.keyboard && !event.defaultPrevented) {
            this.dismiss(ModalDismissReasons.ESC);
        }
    }

    // Helper method
    dismiss(reason): void {
        this.dismissEvent.emit(reason);
    }

    // Lifecycle hooks
    ngOnInit() {
        this._elWithFocus = this._document.activeElement;
        this._renderer.addClass(this._document.body, 'modal-open');
    }

    ngAfterViewInit() {
        if (!this._elRef.nativeElement.contains(document.activeElement)) {
            this._elRef.nativeElement['focus'].apply(this._elRef.nativeElement, []);
        }
    }

    ngOnDestroy() {
        // Get references to the body element and the currently focused element
        const body = this._document.body;
        const elWithFocus = this._elWithFocus;

        // If we have a currently focused element and the element is contained within the body,
        // we get the reference to the element so we can remove focus
        // Otherwise we default it to the body element
        let elementToFocus;
        if (elWithFocus && elWithFocus['focus'] && body.contains(elWithFocus)) {
            elementToFocus = elWithFocus;
        } else {
            elementToFocus = body;
        }
        elementToFocus['focus'].apply(elementToFocus, []);

        this._elWithFocus = null;
        this._renderer.removeClass(body, 'modal-open');
    }
}
