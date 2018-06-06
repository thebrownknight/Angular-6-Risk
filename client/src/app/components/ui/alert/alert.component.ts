import { Component, Input, OnInit, TemplateRef } from '@angular/core';

import { Alert, AlertType } from '../../../helpers/data-models';
import { AlertService } from '../../../services/alert.service';

type AlertContent = 'template' | 'string';

@Component({
    selector: 'risk-alert',
    templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
    @Input() id: string;
    removingAlert: boolean;
    alertContent: AlertContent;

    alerts: Alert[] = [];

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.alertService.getAlert(this.id).subscribe((alert: Alert) => {
            if (!alert.message) {
                // Clear alerts when an empty alert is received
                this.alerts = [];
                return;
            }

            // Do a check for the content type
            if (alert.message instanceof TemplateRef) {
                this.alertContent = 'template';
            } else {
                this.alertContent = 'string';
            }

            // Add alert to array
            this.alerts.push(alert);
        });
    }

    removeAlert(alert: Alert) {
        this.removingAlert =  true;
        this.alerts = this.alerts.filter(x => x !== alert);
        this.removingAlert = false;
    }

    // Method to add css class for specific type of alert
    cssClass(alert: Alert) {
        if (!alert) { return; }

        // Return CSS class based on alerty type
        switch (alert.type) {
            case AlertType.Success:
                return 'rs-alert rs-alert-success';
            case AlertType.Error:
                return 'rs-alert rs-alert-error';
            case AlertType.Info:
                return 'rs-alert rs-alert-info';
            case AlertType.Warning:
                return 'rs-alert rs-alert-warning';
        }
    }
}
