import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { PanelComponent } from './panel/panel.component';

@Component({
    selector: 'risk-accordion',
    templateUrl: './accordion.component.html'
})
export class AccordionComponent implements AfterContentInit {
    @ContentChildren(PanelComponent) panels: QueryList<PanelComponent>;

    ngAfterContentInit() {
        // Open the first panel
        this.panels.toArray()[0].opened = true;

        // Loop through all the panels
        this.panels.toArray().forEach((panel: PanelComponent) => {
            // Subscribe panel toggle event
            panel.toggle.subscribe(() => {
                // Open the panel
                this.openPanel(panel);
            })
        });
    }

    openPanel(panel: PanelComponent) {
        // Close all panel initially
        this.panels.toArray().forEach(p => p.opened = false);

        // Open the selected panel
        panel.opened = true;
    }
}
