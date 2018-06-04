import { Injector, TemplateRef, ViewRef, ViewContainerRef } from '@angular/core';
import { Renderer2, ComponentRef, ComponentFactoryResolver } from '@angular/core';

// Create a reference to the content inside the modal
// Params:
// nodes: array of projectable Nodes - node elements which are transcluded onto the ng-content that is in the template of our component
// viewRef: embeddedView reference that is added into our TemplateRef
// componentRef:
export class ContentRef {
    constructor(public nodes: any[], public viewRef?: ViewRef, public componentRef?: ComponentRef<any>) { }
}

export class PopupService<T> {
    private _windowRef: ComponentRef<T>;
    private _contentRef: ContentRef;

    // _type: specify the Component type to instantiate
    // _injector: Injector that will be used as parent for the Component
    // _viewContainerRef: The view container that will house the new Component
    // _renderer: The service that allows us to manipulate elements of app without touching DOM
    // _componentFactoryResolver: Service to get the component factory that will create our new Component
    constructor(
        private _type: any, private _injector: Injector, private _viewContainerRef: ViewContainerRef,
        private _renderer: Renderer2, private _componentFactoryResolver: ComponentFactoryResolver) {}

    // Private helper method to grab the content reference of the popup
    // content: Can be a string of content or a TemplateRef that can be added to the view container
    private _getContentRef(content: string | TemplateRef<any>, context?: any): ContentRef {
        if (!content) {
            return new ContentRef([]);
        } else if (content instanceof TemplateRef) {
            // Instantiate the modal content view inside the view container. The modal content is cast as
            // a TemplateRef since embedded views are linked to templates
            const viewRef = this._viewContainerRef.createEmbeddedView(<TemplateRef<T>>content, context);
            return new ContentRef([viewRef.rootNodes], viewRef);
        } else {
            // Content was a string so we use the renderer to create the DOM element for the content
            // and pass a two-dimensional array since we can have more than one ng-content inside the modal
            return new ContentRef([[this._renderer.createText(`${content}`)]]);
        }
    }

    // Method to handle opening the popup
    // Creates a new component inside the view containerf for the popup
    // content: The content of the modal either in a string format or a TemplateRef
    // context: The ViewRef that the modal will be opening inside
    open(content?: string | TemplateRef<any>, context?: any): ComponentRef<T> {
        if (!this._windowRef) {
            this._contentRef = this._getContentRef(content, context);
            this._windowRef = this._viewContainerRef.createComponent(
                this._componentFactoryResolver.resolveComponentFactory<T>(this._type), 0, this._injector, this._contentRef.nodes
            );
        }

        return this._windowRef;
    }

    // Method to close the popup
    close() {
        if (this._windowRef) {
            // Grab the index of the popup view within the view container and remove it from the view container
            this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._windowRef.hostView));
            this._windowRef = null;

            // If we the modal was instantiated with a TemplateRef, we have to remove this reference
            // and set the content reference to null
            if (this._contentRef.viewRef) {
                this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._contentRef.viewRef));
                this._contentRef = null;
            }
        }
    }
}
