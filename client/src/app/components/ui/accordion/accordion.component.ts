import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { PanelComponent } from './panel/panel.component';

@Component({
    selector: 'risk-accordion',
    templateUrl: './accordion.component.html'
})
export class AccordionComponent implements AfterContentInit {
    @ContentChildren(PanelComponent) panels: QueryList<PanelComponent>;

    constructor() { }

    ngAfterContentInit() {
        this.panels.changes.subscribe((pls) => {
            // Loop through all the panels
            pls.toArray().forEach((panel: PanelComponent, index) => {
                // Subscribe panel toggle event
                panel.toggle.subscribe(() => {
                    // Close all panel initially
                    pls.toArray().forEach(p => {
                        if (p !== panel) {
                            p.opened = false;
                        }
                    });

                    // Open the panel
                    this.togglePanel(panel);
                });
            });
        });
    }

    togglePanel(panel: PanelComponent) {
        // Open the selected panel
        panel.opened = panel.opened === true ? false : true;
    }
}
