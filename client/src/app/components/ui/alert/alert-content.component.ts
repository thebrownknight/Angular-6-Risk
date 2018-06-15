import { Component, Input, OnInit } from '@angular/core';

import { AlertService } from '../../../services/alert.service';

@Component({
    'selector': 'risk-alert-content',
    template: `
        <div class="alert-content">
            <div class="icon-container">
                <i [ngClass]="'fas icon ' + iconClass"></i>
            </div>
            <p [innerHtml]="message"></p>
            <button *ngIf="buttonTitle !== ''" class="btn btn-sunshine btn-small" (click)="action()">{{buttonTitle}}</button>
        </div>
    `
})
export class AlertContentComponent implements OnInit {
    @Input() alertId: string;
    @Input() iconClass: string;
    @Input() message: string;
    @Input() buttonTitle: string;
    @Input() buttonAction: string;
    @Input() params: any;

    constructor(private alertService: AlertService) { }

    ngOnInit() {

    }

    action() {
        console.log(this.params);
        this.alertService.clear(this.alertId);
        this.alertService.notificationEvent(this.buttonAction, this.params);
    }
}
