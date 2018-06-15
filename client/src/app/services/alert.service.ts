import { Injectable, TemplateRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { Alert, AlertType, NotificationEvent } from '../helpers/data-models';

@Injectable()
export class AlertService {
    private subject = new Subject<Alert>();
    private eventSource = new Subject<NotificationEvent>();
    private keepAfterRouteChange = false;

    refreshNotification = this.eventSource.asObservable();

    constructor(private router: Router) {
        // Clear alert messages on route change unless 'keepAfterRouteChange' flag is true
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterRouteChange) {
                    // Only keep for a single route change
                    this.keepAfterRouteChange = false;
                } else {
                    // Clear alert messages
                    this.clear();
                }
            }
        });
    }

    // Subscribe to alerts
    getAlert(alertId?: string): Observable<any> {
        return this.subject.asObservable().pipe(
            // filter((x: Alert) => x && x.alertId === alertId)
            filter((x: Alert) => x.alertId !== undefined)
        );
    }

    // Display alert
    alert(alert: Alert) {
        this.keepAfterRouteChange = alert.keepAfterRouteChange;
        this.subject.next(alert);
    }

    // Convenience methods
    showSuccessAlert(message: any) {
        this.alert(new Alert({
            message,
            type: AlertType.Success
        }));
    }

    // Helper methods
    clear(alertId?: string) {
        console.log(alertId);
        this.subject.next(new Alert({ alertId }));
    }

    notificationEvent(eventName: string, params?: any) {
        this.eventSource.next({ eventName: eventName, params: params });
    }
}
