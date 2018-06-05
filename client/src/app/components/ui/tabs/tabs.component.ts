import { Component, Input, ContentChildren } from '@angular/core';
import { QueryList, AfterContentInit, HostBinding } from '@angular/core';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'risk-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements AfterContentInit {
    @Input() orientation = 'horizontal';

    @HostBinding('class.horizontal-tabs')
    public get isHorizontal(): Boolean {
        return this.orientation === 'horizontal';
    }

    @HostBinding('class.vertical-tabs')
    public get isVertical(): Boolean {
        return this.orientation === 'vertical';
    }

    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
    constructor() { }

    ngAfterContentInit() {
        // Get all active tabs
        const activeTabs = this.tabs.filter((tab) => tab.active);

        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    }

    selectTab(tab: TabComponent) {
        // Deactivate all tabs
        this.tabs.toArray().forEach(t => t.active = false);

        // Activate the tab the user clicked on.
        tab.active = true;
    }

}
