import { NgModule, ModuleWithProviders } from '@angular/core';

import { ModalBackdropComponent } from './modal-backdrop';
import { ModalWindowComponent } from './modal-window';
import { RiskModalStack } from './modal-stack';
import { RiskModal } from './modal.component';

export { RiskModal, RiskModalOptions } from './modal.component';
export { RiskModalRef, RiskActiveModal } from './modal-ref';
export { ModalDismissReasons } from './modal-dismiss-reasons';

@NgModule({
    declarations: [ModalBackdropComponent, ModalWindowComponent],
    entryComponents: [ModalBackdropComponent, ModalWindowComponent],
    providers: [RiskModal]
})

export class RiskModalModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: RiskModalModule, providers: [RiskModal, RiskModalStack]};
    }
}
