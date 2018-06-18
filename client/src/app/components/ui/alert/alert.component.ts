import { Component, Input, OnInit, AfterViewInit, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef, ViewChildren, ViewContainerRef, QueryList, ElementRef } from '@angular/core';
// import { HostBinding } from '@angular/core';

import { Alert, AlertType } from '../../../helpers/data-models';
import { AlertContentComponent } from './alert-content.component';
import { AlertService } from '../../../services/alert.service';

type AlertContent = 'template' | 'component';

@Component({
    selector: 'risk-alert',
    templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChildren('alertContentComponent', { read: ViewContainerRef }) alertContentComponent: QueryList<ElementRef>;
    @ViewChildren('alertBox', { read: ElementRef }) alertBoxes: QueryList<ElementRef>;
    componentRefs: ComponentRef<AlertContentComponent>[] = [];

    @Input() id: string;
    removingAlert: boolean;
    alertContent: AlertContent;

    alerts: Alert[] = [];

    constructor(private alertService: AlertService,
        private resolver: ComponentFactoryResolver,
        private cdRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.alertService.getAlert().subscribe((alert: Alert) => {
            if (!alert.message) {
                // Clear alerts when an empty alert is received
                // this.alerts = [];

                this.removeAlert(alert);
                return;
            }

            // Do a check for the content type
            if (alert.message instanceof TemplateRef) {
                this.alertContent = 'template';
            } else {
                this.alertContent = 'component';
                // Since we're looking at a ViewContainerRef (ng-template) inside
                // an ngFor directive, we have to subscribe to the changes property
                // of the ViewContainerRef
                this.alertContentComponent.changes.subscribe((acc) => {
                    // Loop through all the panels
                    acc.toArray().forEach((elem: any, index) => {
                        elem.clear();

                        const factory = this.resolver.resolveComponentFactory(AlertContentComponent);
                        const componentRef = elem.createComponent(factory);

                        // Add inputs for the alert content component
                        componentRef.instance.alertId = this.alerts[index].alertId ? this.alerts[index].alertId : '';
                        componentRef.instance.message = this.alerts[index].message;
                        componentRef.instance.iconClass = this.alerts[index].iconClass;
                        componentRef.instance.buttonTitle = this.alerts[index].buttonTitle ? this.alerts[index].buttonTitle : '';
                        componentRef.instance.buttonAction = this.alerts[index].buttonAction
                            ? this.alerts[index].buttonAction : 'reload_game_list';
                        componentRef.instance.params = this.alerts[index].params;

                        this.componentRefs.push(componentRef);
                    });

                    this.cdRef.detectChanges();
                });
            }

            // // Set the position of alerts
            // this.alertBoxes.changes.subscribe((boxes) => {
            //     boxes.toArray().forEach((elem: any, index) => {
            //         console.log(elem.nativeElement.offsetHeight);

            //         this.cdRef.detectChanges();
            //     });
            // });

            // Add alert to array
            this.alerts.push(alert);

            if (alert.dismiss) {
                setTimeout(() => {
                    this.removeAlert(alert);
                    if (this.removingAlert) {
                        this.removingAlert = false;
                    }
                }, 5000);
            }

            this.cdRef.detectChanges();
        });
    }

    ngAfterViewInit() {

    }

    removeAlert(alert: Alert, index?: number) {
        this.removingAlert =  true;
        this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
        this.removingAlert = false;

        // Prevent memory leaks - remove the component in the array when we close the alert
        if (this.componentRefs.length > 0 && index) {
            this.componentRefs[index].destroy();
            this.componentRefs.splice(index, 1);
        }

        this.cdRef.detectChanges();
    }

    getAlertPosition(curAlert, index) {
        let totalHeight = 10;
        this.alertBoxes.toArray().forEach((elem: any, i) => {
            if (i < index) {
                totalHeight += elem.nativeElement.offsetHeight;
            }
        });

        return totalHeight + (index * 10);
    }

    // Method to add css class for specific type of alert
    cssClass(alert: Alert) {
        if (!alert) { return; }

        // Return CSS class based on alerty type
        switch (alert.type) {
            case AlertType.Success:
                return 'rs-alert-success';
            case AlertType.Error:
                return 'rs-alert-error';
            case AlertType.Info:
                return 'rs-alert-info';
            case AlertType.Warning:
                return 'rs-alert-warning';
        }
    }

    ngOnDestroy() {
        if (this.componentRefs.length > 0) {
            this.componentRefs.forEach((elem) => {
                elem.destroy();
            });
        }
    }
}
