import { Component, Input, OnInit, AfterViewInit, TemplateRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ComponentFactoryResolver, ComponentRef, ViewChildren, ViewContainerRef, QueryList, ElementRef } from '@angular/core';
import { HostBinding } from '@angular/core';

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
    componentRef: ComponentRef<any>;

    @Input() id: string;
    removingAlert: boolean;
    alertContent: AlertContent;

    alerts: Alert[] = [];

    constructor(private alertService: AlertService,
        private resolver: ComponentFactoryResolver,
        private cdRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.alertService.getAlert().subscribe((alert: Alert) => {
            console.log(alert);
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
                    console.log(acc);
                    // Loop through all the panels
                    acc.toArray().forEach((elem: any, index) => {
                        elem.clear();

                        if (this.componentRef) {
                            this.componentRef.destroy();
                        }

                        const factory = this.resolver.resolveComponentFactory(AlertContentComponent);
                        this.componentRef = elem.createComponent(factory);

                        // Add inputs for the alert content component
                        this.componentRef.instance.alertId = alert.alertId ? alert.alertId : '';
                        this.componentRef.instance.message = alert.message;
                        this.componentRef.instance.iconClass = alert.iconClass;
                        this.componentRef.instance.buttonTitle = alert.buttonTitle ? alert.buttonTitle : '';
                        this.componentRef.instance.buttonAction = alert.buttonAction ? alert.buttonAction : 'reload_game_list';
                        this.componentRef.instance.params = alert.params;

                        this.cdRef.detectChanges();
                    });
                });
            }

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
        });
    }

    ngAfterViewInit() {

    }

    removeAlert(alert: Alert) {
        this.removingAlert =  true;
        this.alerts = this.alerts.filter(x => x.alertId !== alert.alertId);
        this.removingAlert = false;
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
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }
}
