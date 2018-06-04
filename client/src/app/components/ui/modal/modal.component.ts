import { Injectable, Injector, ComponentFactoryResolver } from '@angular/core';

import { RiskModalStack } from './modal-stack';
import { RiskModalRef } from './modal-ref';

import { Utils } from '../../../services/utils';

/**
 * Represent options available when opening new modal windows.
 */
export interface RiskModalOptions {
    /**
     * Whether a backdrop element should be created for a given modal (true by default).
     * Alternatively, specify 'static' for a backdrop which doesn't close the modal on click.
     */
    backdrop?: boolean | 'static';

    /**
     * Function called when a modal will be dismissed.
     * If this function returns false, the promise is resolved with false or the promise is rejected,
     * the modal is not dismissed.
     */
    beforeDismiss?: () => boolean | Promise<boolean>;

    /**
     * To center the modal vertically (false by default).
     */
    centered?: boolean;

    /**
     * An element to which to attach newly opened modal windows.
     */
    container?: string;

    /**
     * Injector to use for modal content.
     */
    injector?: Injector;

    /**
     * Whether to close the modal when escape key is pressed (true by default).
     */
    keyboard?: boolean;

    /**
     * Size of a new modal window.
     */
    size?: 'sm' | 'lg';

    /**
     * Custom class to append to the modal window.
     */
    windowClass?: string;

    /**
     * Custom class to append to the modal backdrop.
     */
    backdropClass?: string;
}

/**
 * A service to open modal windows. Creating a modal is straightforward: create a template and pass it as an argument to the
 * "open" method!
 */
@Injectable()
export class RiskModal {
    constructor(
        private _moduleCFR: ComponentFactoryResolver, private _injector: Injector, private _modalStack: RiskModalStack
    ) { }

    /**
     * Opens a new modal window with the specified content and using supplied options. Content can be provided
     * as a TemplateRef or a component type. If you pass a component type as content then instances of those components
     * can be injected with an instance of the RiskActiveModal class. You can use methods on the RiskActiveModal class
     * to close / dismiss modals from "inside" of a component.
     */
    open(content: any, options?: RiskModalOptions): RiskModalRef {
        const defaults: RiskModalOptions = {
            backdrop: true,
            centered: false,
            keyboard: true,
            container: '',
            size: 'sm',
            windowClass: '',
            backdropClass: ''
        };
        options = Utils.mergeObjects(defaults, options === undefined ? {} : options);
        return this._modalStack.open(this._moduleCFR, this._injector, content, options);
    }
}
