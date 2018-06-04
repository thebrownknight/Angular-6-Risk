import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Injectable, Injector, Inject } from '@angular/core';
import { ComponentFactory, ComponentFactoryResolver, ComponentRef, TemplateRef } from '@angular/core';

import { ContentRef } from './popup';

import { ModalBackdropComponent } from './modal-backdrop';
import { ModalWindowComponent } from './modal-window';
import { RiskActiveModal, RiskModalRef } from './modal-ref';

@Injectable()
export class RiskModalStack {
    private _document: any;
    private _windowAttributes = ['backdrop', 'centered', 'keyboard', 'size', 'windowClass'];
    private _backdropAttributes = ['backdropClass'];

    constructor(
        private _applicationRef: ApplicationRef, private _injector: Injector,
        private _componentFactoryResolver: ComponentFactoryResolver, @Inject(DOCUMENT) document
    ) {
        this._document = document;
    }

    open(moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any, options): RiskModalRef {
        const containerEl =
            this.isDefined(options.container) && options.container !== ''
            ? this._document.querySelector(options.container) : this._document.body;

        if (!containerEl) {
            throw new Error(`The specified modal container "${options.container || 'body'}" was not found in the DOM.`);
        }

        const activeModal = new RiskActiveModal();
        const contentRef = this._getContentRef(moduleCFR, options.injector || contentInjector, content, activeModal);

        const backdropCmptRef: ComponentRef<ModalBackdropComponent> =
            options.backdrop !== false ? this._attachBackdrop(containerEl) : null;
        const windowCmptRef: ComponentRef<ModalWindowComponent> = this._attachWindowComponent(containerEl, contentRef);
        const riskModalRef: RiskModalRef = new RiskModalRef(windowCmptRef, contentRef, backdropCmptRef, options.beforeDismiss);

        activeModal.close = (result: any) => { riskModalRef.close(result); };
        activeModal.dismiss = (reason: any) => { riskModalRef.dismiss(reason); };

        this._applyWindowOptions(windowCmptRef.instance, options);

        if (backdropCmptRef && backdropCmptRef.instance) {
            this._applyBackdropOptions(backdropCmptRef.instance, options);
        }

        return riskModalRef;
    }

    /*******************
     * Private methods
     ******************/
    private isDefined(value: any): boolean {
        return value !== undefined && value !== null;
    }
    private isString(value: any): boolean {
        return typeof value === 'string';
    }

    private _attachBackdrop(containerEl: any): ComponentRef<ModalBackdropComponent> {
        // Create a ComponentFactory instance that will generate the Modal Backdrop component
        const backdropFactory: ComponentFactory<ModalBackdropComponent> =
            this._componentFactoryResolver.resolveComponentFactory(ModalBackdropComponent);

        // Create a new ModalBackdropComponent and store a reference
        const backdropCmptRef = backdropFactory.create(this._injector);

        // Attach the host view of the backdrop component to the application
        this._applicationRef.attachView(backdropCmptRef.hostView);

        // Perform the DOM manipulation where we grab the DOM of the backdrop and append it to the container
        containerEl.appendChild(backdropCmptRef.location.nativeElement);
        return backdropCmptRef;
    }

    private _attachWindowComponent(containerEl: any, contentRef: any): ComponentRef<ModalWindowComponent> {
        const windowFactory: ComponentFactory<ModalWindowComponent> =
            this._componentFactoryResolver.resolveComponentFactory(ModalWindowComponent);

        const windowCmptRef = windowFactory.create(this._injector, contentRef.nodes);
        this._applicationRef.attachView(windowCmptRef.hostView);
        containerEl.appendChild(windowCmptRef.location.nativeElement);
        return windowCmptRef;
    }

    private _applyWindowOptions(windowInstance: ModalWindowComponent, options: Object): void {
        this._windowAttributes.forEach((optionName: string) => {
            if (this.isDefined(options[optionName])) {
                windowInstance[optionName] = options[optionName];
            }
        });
    }

    private _applyBackdropOptions(backdropInstance: ModalBackdropComponent, options: Object): void {
        this._backdropAttributes.forEach((optionName: string) => {
            if (this.isDefined(options[optionName])) {
                backdropInstance[optionName] = options[optionName];
            }
        });
    }

    /**
     * Get the content reference from the active modal.
     */
    private _getContentRef(
        moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
        context: RiskActiveModal
    ): ContentRef {
        if (!content) {
            return new ContentRef([]);
        } else if (content instanceof TemplateRef) {
            return this._createFromTemplateRef(content, context);
        } else if (this.isString(content)) {
            return this._createFromString(content);
        } else {
            return this._createFromComponent(moduleCFR, contentInjector, content, context);
        }
    }

    /**
     * Helper methods to create different content references.
     */
    private _createFromTemplateRef(content: TemplateRef<any>, context: RiskActiveModal): ContentRef {
        const viewRef = content.createEmbeddedView(context);
        this._applicationRef.attachView(viewRef);
        return new ContentRef([viewRef.rootNodes], viewRef);
    }

    private _createFromString(content: string): ContentRef {
        const component = this._document.createTextNode(`${content}`);
        return new ContentRef([[component]]);
    }

    private _createFromComponent(
        moduleCFR: ComponentFactoryResolver, contentInjector: Injector, content: any,
        context: RiskActiveModal
    ): ContentRef {
        const contentCmptFactory = moduleCFR.resolveComponentFactory(content);
        const modalContentInjector = Injector.create(
            [{ provide: RiskActiveModal, useValue: context }],
            contentInjector
        );
        const componentRef = contentCmptFactory.create(modalContentInjector);
        this._applicationRef.attachView(componentRef.hostView);
        return new ContentRef([[componentRef.location.nativeElement]], componentRef.hostView, componentRef);
    }
}
