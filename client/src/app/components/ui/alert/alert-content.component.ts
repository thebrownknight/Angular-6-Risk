import { Component, Input, OnInit } from '@angular/core';

import { AlertService } from '../../../services/alert.service';

@Component({
    'selector': 'risk-alert-content',
    template: `
        <div class="alert-content">
            <div class="icon-container">
                <i [ngClass]="'fas icon ' + iconClass"></i>
            </div>
            <p>{{message}}</p>
            <button *ngIf="buttonTitle !== ''" class="btn btn-sunshine btn-small" (click)="reloadList()">{{buttonTitle}}</button>
        </div>
    `
})
export class AlertContentComponent implements OnInit {
    @Input() iconClass: string;
    @Input() message: string;
    @Input() buttonTitle: string;

    constructor(private alertService: AlertService) { }

    ngOnInit() {

    }

    reloadList() {
        this.alertService.clear('game_create');
        this.alertService.notificationEvent('reload_game_list');
    }
}
